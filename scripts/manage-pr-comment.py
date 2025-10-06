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
from datetime import datetime
from typing import Dict, Optional, Any
from urllib.parse import quote

try:
    import requests
except ImportError:
    print("Error: requests library not found. Install with: pip install requests", file=sys.stderr)
    sys.exit(1)


class PRCommentManager:
    """Manages PR comments with content injection protection."""
    
    # Marker to identify our managed comment
    COMMENT_MARKER = "<!-- sgex-deployment-status-comment -->"
    
    # Allowed stages to prevent injection
    ALLOWED_STAGES = {
        'started', 'setup', 'building', 'deploying', 'verifying', 
        'success', 'failure'
    }
    
    def __init__(self, token: str, repo: str, pr_number: int):
        """
        Initialize the PR comment manager.
        
        Args:
            token: GitHub token for authentication
            repo: Repository in format 'owner/repo'
            pr_number: Pull request number
        """
        self.token = token
        self.owner, self.repo_name = repo.split('/')
        self.pr_number = pr_number
        self.api_base = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json"
        }
    
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
        
        # Only allow https URLs to GitHub
        if not re.match(r'^https://github\.com/', url):
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
        Find existing managed comment on the PR.
        
        Returns:
            Comment dict if found, None otherwise
        """
        url = f"{self.api_base}/repos/{self.owner}/{self.repo_name}/issues/{self.pr_number}/comments"
        
        try:
            response = requests.get(url, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            comments = response.json()
            for comment in comments:
                if self.COMMENT_MARKER in comment.get('body', ''):
                    return comment
            
            return None
        except requests.exceptions.RequestException as e:
            print(f"Error fetching comments: {e}", file=sys.stderr)
            return None
    
    def build_comment_body(self, stage: str, data: Dict[str, Any]) -> str:
        """
        Build the comment body for the given stage.
        
        Args:
            stage: Current stage of the workflow
            data: Stage-specific data (will be sanitized)
            
        Returns:
            Formatted comment body with marker
        """
        # Sanitize all data inputs
        commit_sha = self.sanitize_string(data.get('commit_sha', 'unknown'), max_length=40)
        commit_sha_short = commit_sha[:7]
        branch_name = self.sanitize_string(data.get('branch_name', 'unknown'), max_length=100)
        commit_url = self.sanitize_url(data.get('commit_url', ''))
        workflow_url = self.sanitize_url(data.get('workflow_url', ''))
        branch_url = self.sanitize_url(data.get('branch_url', ''))
        
        timestamp = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')
        
        # Stage-specific content
        if stage == 'started':
            status_line = "## 🚀 Deployment Status: Build Started"
            status_icon = "🔵"
            status_text = "Initializing build process"
            actions = f"""**🔗 Quick Actions:**
- 📊 [Watch build progress]({workflow_url})

**📝 Recent Change:**
Build started for commit [`{commit_sha_short}`]({commit_url})
**Started:** {timestamp}"""
        
        elif stage == 'setup':
            status_line = "## 🚀 Deployment Status: Setting Up Environment"
            status_icon = "🔵"
            status_text = "Installing dependencies and configuring environment"
            actions = f"""**🔗 Quick Actions:**
- 📊 [Watch build progress]({workflow_url})

**📝 Recent Change:**
Build for commit [`{commit_sha_short}`]({commit_url})
**Stage:** Environment setup
**Updated:** {timestamp}"""
        
        elif stage == 'building':
            status_line = "## 🚀 Deployment Status: Building Application"
            status_icon = "🔵"
            status_text = "Compiling and bundling application code"
            actions = f"""**🔗 Quick Actions:**
- 📊 [Watch build progress]({workflow_url})

**📝 Recent Change:**
Build for commit [`{commit_sha_short}`]({commit_url})
**Stage:** Building application
**Updated:** {timestamp}"""
        
        elif stage == 'deploying':
            status_line = "## 🚀 Deployment Status: Deploying to GitHub Pages"
            status_icon = "🟡"
            status_text = "Pushing build artifacts to gh-pages branch"
            actions = f"""**🔗 Quick Actions:**
- 📊 [Watch deployment progress]({workflow_url})

**📝 Recent Change:**
Deploying commit [`{commit_sha_short}`]({commit_url})
**Stage:** Deployment in progress
**Updated:** {timestamp}"""
        
        elif stage == 'verifying':
            status_line = "## 🚀 Deployment Status: Verifying Deployment"
            status_icon = "🟡"
            status_text = "Checking deployment accessibility"
            actions = f"""**🔗 Quick Actions:**
- 📊 [View deployment logs]({workflow_url})
- 🌐 [Preview URL]({branch_url}) (verifying...)

**📝 Recent Change:**
Verifying deployment of commit [`{commit_sha_short}`]({commit_url})
**Stage:** Verification in progress
**Updated:** {timestamp}"""
        
        elif stage == 'success':
            status_line = "## 🚀 Deployment Status: Successfully Deployed ✅"
            status_icon = "🟢"
            status_text = "Live and accessible"
            actions = f"""**🔗 Quick Actions:**
- 🌐 [Open Branch Preview]({branch_url})
- 📊 [View build logs]({workflow_url})

**📝 Deployment Complete:**
Deployed commit [`{commit_sha_short}`]({commit_url})
**Deployed:** {timestamp}"""
        
        elif stage == 'failure':
            error_message = self.sanitize_string(data.get('error_message', 'Unknown error'), max_length=200)
            status_line = "## 🚀 Deployment Status: Failed ❌"
            status_icon = "🔴"
            status_text = "Deployment failed"
            actions = f"""**🔗 Quick Actions:**
- 📊 [Check error logs]({workflow_url})
- 🔄 Retry deployment after fixing issues

**📝 Failure Details:**
Failed commit [`{commit_sha_short}`]({commit_url})
**Error:** {error_message}
**Failed:** {timestamp}"""
        
        else:
            # Fallback (should not reach here due to validation)
            status_line = "## 🚀 Deployment Status: In Progress"
            status_icon = "🔵"
            status_text = "Processing"
            actions = f"""**📝 Update:**
Processing commit [`{commit_sha_short}`]({commit_url})
**Updated:** {timestamp}"""
        
        # Build complete comment
        comment = f"""{self.COMMENT_MARKER}
{status_line}

{actions}

---

## 📊 Overall Progress
**Branch:** `{branch_name}`
**Status:** {status_icon} {status_text}
"""
        
        if stage == 'success' and branch_url:
            comment += f"**Preview URL:** {branch_url}\n"
        elif stage in ['verifying', 'deploying'] and branch_url:
            comment += f"**Preview URL (pending):** {branch_url}\n"
        
        comment += f"""
---

💡 *This comment is automatically updated as the deployment progresses.*
"""
        
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
            
            # Build comment body
            comment_body = self.build_comment_body(stage, data)
            
            # Check for existing comment
            existing = self.get_existing_comment()
            
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
  
  # Update comment for deployment success
  python manage-pr-comment.py --token $TOKEN --repo owner/repo --pr 123 \\
      --stage success --data '{"commit_sha": "abc123", "branch_name": "feature", "commit_url": "...", "workflow_url": "...", "branch_url": "..."}'
        """
    )
    
    parser.add_argument('--token', required=True, help='GitHub token for authentication')
    parser.add_argument('--repo', required=True, help='Repository in format owner/repo')
    parser.add_argument('--pr', type=int, required=True, help='Pull request number')
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
    manager = PRCommentManager(args.token, args.repo, args.pr)
    success = manager.update_comment(args.stage, data)
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
