#!/usr/bin/env python3
"""
PR Comment Manager for GitHub Actions Workflows

This script manages a single PR comment that gets updated throughout
the build and deployment process. It includes proper content injection
protection and sanitization.

Usage:
    python manage-pr-comment.py --token TOKEN --repo OWNER/REPO --pr PR_NUMBER \
                                --stage STAGE --data JSON_DATA
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from typing import Dict, Optional, Any
from urllib.parse import quote

try:
    import requests
except ImportError:
    print("Error: requests library not found. Install with: pip install requests", file=sys.stderr)
    sys.exit(1)


class PRCommentManager:
    """Manages PR comments with content injection protection."""
    
    # Base marker to identify our managed comments
    COMMENT_MARKER_BASE = "sgex-deployment-status-comment"
    
    # Allowed stages to prevent injection
    ALLOWED_STAGES = {
        'started', 'setup', 'building', 'deploying', 'verifying', 
        'success', 'failure', 'pages-built'
    }
    
    def __init__(self, token: str, repo: str, pr_number: int, action_id: Optional[str] = None):
        """
        Initialize the PR comment manager.
        
        Args:
            token: GitHub token for authentication
            repo: Repository in format 'owner/repo'
            pr_number: Pull request number
            action_id: Optional action ID to create unique comment per workflow run.
                      This ensures exactly one comment per action run, allowing
                      multiple workflows (e.g., deploy-branch and pages-build-deployment)
                      to maintain their own separate status comments.
        """
        self.token = token
        self.owner, self.repo_name = repo.split('/')
        self.pr_number = pr_number
        self.action_id = action_id
        self.api_base = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
        }
        
        # Create action-specific marker
        if action_id:
            # Sanitize action_id to prevent injection
            safe_action_id = re.sub(r'[^a-zA-Z0-9\-_]', '', str(action_id))[:50]
            self.comment_marker = f"<!-- {self.COMMENT_MARKER_BASE}:{safe_action_id} -->"
        else:
            self.comment_marker = f"<!-- {self.COMMENT_MARKER_BASE} -->"
    
    def sanitize_string(self, value: str, max_length: int = 500) -> str:
        """
        Sanitize a string to prevent content injection.
        
        Args:
            value: String to sanitize
            max_length: Maximum allowed length
            
        Returns:
            Sanitized string safe for inclusion in markdown
        """
        if not isinstance(value, str):
            value = str(value)
        
        # Limit length
        value = value[:max_length]
        
        # Remove control characters except newlines and tabs
        value = re.sub(r'[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]', '', value)
        
        # Escape markdown special characters in user content
        # But preserve intentional formatting
        value = value.replace('`', '\\`')
        
        return value
    
    def sanitize_url(self, url: str) -> str:
        """
        Sanitize a URL to ensure it's safe.
        
        Args:
            url: URL to sanitize
            
        Returns:
            Sanitized URL or empty string if invalid
        """
        if not isinstance(url, str):
            return ""
        
        # Only allow https URLs to GitHub and GitHub Pages
        if not re.match(r'^https://(github\.com/|[a-zA-Z0-9\-]+\.github\.io/)', url):
            return ""
        
        return url
    
    def validate_stage(self, stage: str) -> str:
        """
        Validate and sanitize the stage parameter.
        
        Args:
            stage: Stage name to validate
            
        Returns:
            Validated stage name
            
        Raises:
            ValueError: If stage is not in allowed list
        """
        stage = stage.lower().strip()
        if stage not in self.ALLOWED_STAGES:
            raise ValueError(f"Invalid stage '{stage}'. Allowed: {', '.join(self.ALLOWED_STAGES)}")
        return stage
    
    def get_existing_comment(self) -> Optional[Dict[str, Any]]:
        """
        Find existing managed comment on the PR for this action_id.
        
        Returns:
            Comment dict if found, None otherwise
        """
        url = f"{self.api_base}/repos/{self.owner}/{self.repo_name}/issues/{self.pr_number}/comments"
        
        try:
            response = requests.get(url, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            comments = response.json()
            print(f"Searching {len(comments)} comments for marker: {self.comment_marker}")
            for comment in comments:
                if self.comment_marker in comment.get('body', ''):
                    print(f"✅ Found existing comment (ID: {comment['id']}) for action_id")
                    return comment
            
            print(f"No existing comment found for action_id: {self.action_id}")
            return None
        except requests.exceptions.RequestException as e:
            print(f"Error fetching comments: {e}", file=sys.stderr)
            return None
    
    def extract_timeline_from_comment(self, comment_body: str) -> str:
        """
        Extract the timeline section from existing comment.
        
        Args:
            comment_body: Existing comment body
            
        Returns:
            Timeline section or empty string if not found
        """
        # Look for the timeline section between markers
        timeline_start = comment_body.find('### 📋 Deployment Timeline')
        if timeline_start == -1:
            return ""
        
        # Find the end of the timeline section (the next --- after timeline header, but skip the line itself)
        # Timeline structure:
        # ### 📋 Deployment Timeline
        # 
        # - entry 1
        # - entry 2
        # ---
        # So we look for \n--- or start of next section
        search_start = timeline_start + len('### 📋 Deployment Timeline')
        
        # Look for the closing --- that comes after the timeline entries
        timeline_end = comment_body.find('\n---', search_start)
        if timeline_end == -1:
            # Try to find the final marker
            timeline_end = comment_body.find('💡 *', search_start)
        
        if timeline_end == -1:
            # No clear end, take the rest
            return comment_body[timeline_start:]
        
        return comment_body[timeline_start:timeline_end].strip()
    
    def build_comment_body(self, stage: str, data: Dict[str, Any], existing_timeline: str = "") -> str:
        """
        Build the comment body for the given stage, appending to timeline.
        
        CRITICAL: The HTML comment marker MUST be the very first thing in the returned
        comment body to ensure get_existing_comment() can find and update existing comments.
        
        Args:
            stage: Current stage of the workflow
            data: Stage-specific data (will be sanitized)
            existing_timeline: Previous timeline entries to append to
            
        Returns:
            Formatted comment body with marker at the very start
        """
        # Sanitize all data inputs
        commit_sha = self.sanitize_string(data.get('commit_sha', 'unknown'), max_length=40)
        commit_sha_short = commit_sha[:7]
        branch_name = self.sanitize_string(data.get('branch_name', 'unknown'), max_length=100)
        commit_url = self.sanitize_url(data.get('commit_url', ''))
        workflow_url = self.sanitize_url(data.get('workflow_url', ''))
        branch_url = self.sanitize_url(data.get('branch_url', ''))
        
        timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')
        
        # Stage-specific content with HTML headers for consistent styling
        if stage == 'started':
            status_line = "<h2>🚀 Deployment Status: Build Started</h2>"
            status_icon = "🔵"
            status_text = "Initializing build process"
            next_step = "**Next:** Installing dependencies and setting up environment"
            actions = f"""<h3>🔗 Quick Actions</h3>

<a href="{workflow_url}"><img src="https://img.shields.io/badge/Build_Logs-gray?style=for-the-badge&logo=github" alt="Build Logs"/></a>"""
            timeline_entry = f"- **{timestamp}** - 🔵 Build started for commit [`{commit_sha_short}`]({commit_url})"
        
        elif stage == 'setup':
            status_line = "<h2>🚀 Deployment Status: Setting Up Environment</h2>"
            status_icon = "🔵"
            status_text = "Installing dependencies and configuring environment"
            next_step = "**Next:** Building React application"
            actions = f"""<h3>🔗 Quick Actions</h3>

<a href="{workflow_url}"><img src="https://img.shields.io/badge/Build_Logs-gray?style=for-the-badge&logo=github" alt="Build Logs"/></a>"""
            timeline_entry = f"- **{timestamp}** - 🔵 Environment setup complete"
        
        elif stage == 'building':
            status_line = "<h2>🚀 Deployment Status: Building Application</h2>"
            status_icon = "🔵"
            status_text = "Compiling and bundling application code"
            next_step = "**Next:** Deploying to GitHub Pages"
            
            # Build actions with styled buttons
            actions = f"""<h3>🔗 Quick Actions</h3>

<a href="{workflow_url}"><img src="https://img.shields.io/badge/Build_Logs-gray?style=for-the-badge&logo=github" alt="Build Logs"/></a>"""
            
            # Add preview URL if available (determined after PUBLIC_URL calculation)
            if branch_url:
                actions += f"""
<a href="{branch_url}"><img src="https://img.shields.io/badge/Preview_URL-orange?style=for-the-badge&logo=github&label=🌐&labelColor=gray" alt="Expected Deployment URL"/></a> _(will be live after deployment)_"""
            
            timeline_entry = f"- **{timestamp}** - 🔵 Building application"
        
        elif stage == 'deploying':
            status_line = "<h2>🚀 Deployment Status: Deploying to GitHub Pages</h2>"
            status_icon = "🟡"
            status_text = "Pushing build artifacts to gh-pages branch"
            next_step = "**Next:** Verifying deployment accessibility"
            actions = f"""<h3>🔗 Quick Actions</h3>

<a href="{workflow_url}"><img src="https://img.shields.io/badge/Build_Logs-gray?style=for-the-badge&logo=github" alt="Build Logs"/></a>"""
            if branch_url:
                actions += f"""
<a href="{branch_url}"><img src="https://img.shields.io/badge/Preview_URL-orange?style=for-the-badge&logo=github&label=🌐&labelColor=gray" alt="Expected Deployment URL"/></a> _(deploying...)_"""
            timeline_entry = f"- **{timestamp}** - 🟡 Deploying to gh-pages branch"
        
        elif stage == 'verifying':
            status_line = "<h2>🚀 Deployment Status: Verifying Deployment</h2>"
            status_icon = "🟡"
            status_text = "Checking deployment accessibility"
            next_step = "**Next:** Deployment complete or failure reported"
            actions = f"""<h3>🔗 Quick Actions</h3>

<a href="{workflow_url}"><img src="https://img.shields.io/badge/Build_Logs-gray?style=for-the-badge&logo=github" alt="Build Logs"/></a>"""
            if branch_url:
                actions += f"""
<a href="{branch_url}"><img src="https://img.shields.io/badge/Preview_URL-orange?style=for-the-badge&logo=github&label=🌐&labelColor=gray" alt="Preview URL"/></a> _(verifying...)_"""
            timeline_entry = f"- **{timestamp}** - 🟡 Verifying deployment"
        
        elif stage == 'pages-built':
            status_line = "<h2>🚀 Deployment Status: GitHub Pages Built</h2>"
            status_icon = "🟢"
            status_text = "Pages content deployed, site building"
            next_step = "**Status:** Site is live and accessible"
            actions = f"""<h3>🔗 Quick Actions</h3>

<a href="{branch_url}"><img src="https://img.shields.io/badge/Preview_URL-brightgreen?style=for-the-badge&logo=github&label=🌐&labelColor=gray" alt="Open Branch Preview"/></a>
<a href="{workflow_url}"><img src="https://img.shields.io/badge/Build_Logs-gray?style=for-the-badge&logo=github" alt="Build Logs"/></a>"""
            timeline_entry = f"- **{timestamp}** - 🟢 GitHub Pages built"
        
        elif stage == 'success':
            status_line = "<h2>🚀 Deployment Status: Successfully Deployed ✅</h2>"
            status_icon = "🟢"
            status_text = "Live and accessible"
            next_step = "**Status:** Deployment complete - site is ready for testing"
            actions = f"""<h3>🌐 Preview URLs</h3>

<a href="{branch_url}"><img src="https://img.shields.io/badge/Open_Branch_Preview-brightgreen?style=for-the-badge&logo=github&label=🌐&labelColor=gray" alt="Open Branch Preview"/></a>

<h3>🔗 Quick Actions</h3>

<a href="{workflow_url}"><img src="https://img.shields.io/badge/Build_Logs-gray?style=for-the-badge&logo=github" alt="Build Logs"/></a>"""
            timeline_entry = f"- **{timestamp}** - ✅ Deployment successful - site is live"
        
        elif stage == 'failure':
            error_message = self.sanitize_string(data.get('error_message', 'Unknown error'), max_length=200)
            status_line = "<h2>🚀 Deployment Status: Failed ❌</h2>"
            status_icon = "🔴"
            status_text = "Deployment failed"
            next_step = "**Action Required:** Fix issues and retry deployment"
            actions = f"""<h3>🔗 Quick Actions</h3>

<a href="{workflow_url}"><img src="https://img.shields.io/badge/Error_Logs-red?style=for-the-badge&logo=github&label=📊&labelColor=gray" alt="Error Logs"/></a> _Action ID: `{self.action_id if self.action_id else 'N/A'}`_

**Error:** {error_message}"""
            timeline_entry = f"- **{timestamp}** - ❌ Deployment failed: {error_message}"
        
        else:
            # Fallback (should not reach here due to validation)
            status_line = "<h2>🚀 Deployment Status: In Progress</h2>"
            status_icon = "🔵"
            status_text = "Processing"
            next_step = "**Status:** Processing deployment"
            actions = f"""<h3>🔗 Quick Actions</h3>

<a href="{workflow_url}"><img src="https://img.shields.io/badge/Build_Logs-gray?style=for-the-badge&logo=github" alt="Build Logs"/></a>"""
            timeline_entry = f"- **{timestamp}** - 🔵 Processing"
        
        # Build timeline section
        timeline_section = "### 📋 Deployment Timeline\n\n"
        if existing_timeline:
            # Extract just the timeline entries from existing timeline
            timeline_lines = [line for line in existing_timeline.split('\n') if line.strip().startswith('-')]
            timeline_section += '\n'.join(timeline_lines) + '\n'
        timeline_section += timeline_entry + '\n'
        
        # Build complete comment with action-specific marker
        comment = f"""{self.comment_marker}
{status_line}

{actions}

---

<h3>📊 Overall Progress</h3>

**Branch:** `{branch_name}`  
**Status:** {status_icon} {status_text}  
{next_step}
"""
        
        if branch_url and stage in ['success', 'pages-built']:
            comment += f"\n**Preview URL:** {branch_url}\n"
        elif branch_url and stage in ['verifying', 'deploying', 'building']:
            comment += f"\n**Expected Preview URL:** {branch_url} (deploying...)\n"
        
        comment += f"""
---

{timeline_section}
---

💡 *This comment is automatically updated as the deployment progresses.*
"""
        
        # Validation: Ensure marker is at the very start (CRITICAL for comment updates to work)
        # This is critical for get_existing_comment() to find and update existing comments
        if not comment.startswith(self.comment_marker):
            raise RuntimeError(
                f"CRITICAL ERROR: Comment marker is not at the start of comment body. "
                f"This will cause duplicate comments. Marker: {self.comment_marker}, "
                f"Comment starts with: {comment[:100]}"
            )
        
        return comment
    
    def update_comment(self, stage: str, data: Dict[str, Any]) -> bool:
        """
        Update or create the PR comment for the given stage.
        
        Args:
            stage: Current workflow stage
            data: Stage-specific data
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Validate stage
            stage = self.validate_stage(stage)
            
            # Check for existing comment and extract timeline
            existing = self.get_existing_comment()
            existing_timeline = ""
            if existing:
                print(f"Found existing comment with ID {existing['id']}")
                existing_timeline = self.extract_timeline_from_comment(existing.get('body', ''))
                if existing_timeline:
                    # Count existing timeline entries
                    entry_count = len([line for line in existing_timeline.split('\n') if line.strip().startswith('-')])
                    print(f"Extracted {entry_count} existing timeline entries")
                else:
                    print("No existing timeline found in comment")
            else:
                print(f"No existing comment found for action_id: {self.action_id if self.action_id else 'N/A'}")
            
            # Build comment body with existing timeline
            comment_body = self.build_comment_body(stage, data, existing_timeline)
            
            # Debug: Log marker placement verification
            marker_at_start = comment_body.startswith(self.comment_marker)
            print(f"📋 Comment body generated (marker at start: {marker_at_start}, length: {len(comment_body)} chars)")
            if not marker_at_start:
                print(f"⚠️  WARNING: Marker not at start! First 100 chars: {comment_body[:100]}")
            
            if existing:
                # Update existing comment
                url = f"{self.api_base}/repos/{self.owner}/{self.repo_name}/issues/comments/{existing['id']}"
                payload = {"body": comment_body}
                
                response = requests.patch(url, headers=self.headers, json=payload, timeout=30)
                response.raise_for_status()
                
                print(f"✅ Updated PR #{self.pr_number} comment (stage: {stage})")
                return True
            else:
                # Create new comment
                url = f"{self.api_base}/repos/{self.owner}/{self.repo_name}/issues/{self.pr_number}/comments"
                payload = {"body": comment_body}
                
                response = requests.post(url, headers=self.headers, json=payload, timeout=30)
                response.raise_for_status()
                
                print(f"✅ Created PR #{self.pr_number} comment (stage: {stage})")
                return True
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Error updating comment: {e}", file=sys.stderr)
            return False
        except Exception as e:
            print(f"❌ Unexpected error: {e}", file=sys.stderr)
            return False


def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(
        description="Manage PR deployment status comments",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Update comment for build start
  python manage-pr-comment.py --token $TOKEN --repo owner/repo --pr 123 \\
      --stage started --data '{"commit_sha": "abc123", "branch_name": "feature", "commit_url": "...", "workflow_url": "..."}'
  
  # Update comment for deployment success with action ID to ensure one comment per workflow run
  python manage-pr-comment.py --token $TOKEN --repo owner/repo --pr 123 \\
      --action-id ${{ github.run_id }} \\
      --stage success --data '{"commit_sha": "abc123", "branch_name": "feature", "commit_url": "...", "workflow_url": "...", "branch_url": "..."}'

Workflow Interaction:
  When a PR is created or updated, two workflows may run:
  1. deploy-branch workflow (branch-deployment.yml): Builds and deploys to gh-pages
  2. pages-build-deployment workflow (GitHub native): Builds the static site from gh-pages
  
  To maintain separate status comments for each workflow:
  - Pass --action-id ${{ github.run_id }} from the deploy-branch workflow
  - Pass --action-id ${{ github.event.deployment.id }} from pages-build-deployment
  
  This ensures exactly one comment per workflow run, preventing duplicate or conflicting updates.
        """
    )
    
    parser.add_argument('--token', required=True, help='GitHub token for authentication')
    parser.add_argument('--repo', required=True, help='Repository in format owner/repo')
    parser.add_argument('--pr', type=int, required=True, help='Pull request number')
    parser.add_argument('--action-id', help='Optional action/run ID to ensure one comment per workflow run')
    parser.add_argument('--stage', required=True, 
                       choices=list(PRCommentManager.ALLOWED_STAGES),
                       help='Current workflow stage')
    parser.add_argument('--data', required=True, help='JSON data for the stage')
    
    args = parser.parse_args()
    
    # Parse JSON data
    try:
        data = json.loads(args.data)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON data: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Create manager and update comment
    manager = PRCommentManager(args.token, args.repo, args.pr, args.action_id)
    success = manager.update_comment(args.stage, data)
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
