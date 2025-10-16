#!/usr/bin/env python3
"""
Compliance Report PR Comment Manager for GitHub Actions Workflows

This script manages a single PR comment for compliance reports that gets updated
when compliance checks run. It follows the same pattern as manage-pr-comment.py
for consistency.

Usage:
    python manage-compliance-comment.py --token TOKEN --repo OWNER/REPO --pr PR_NUMBER \\
                                       --commit-sha SHA --workflow-url URL [--report-file FILE]
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


class ComplianceCommentManager:
    """Manages compliance report PR comments with content injection protection."""
    
    # Marker to identify our managed compliance comments
    COMMENT_MARKER = "<!-- sgex-compliance-report-comment -->"
    
    def __init__(self, token: str, repo: str, pr_number: int, commit_sha: str, 
                 workflow_url: str, report_data: Optional[Dict[str, Any]] = None):
        """
        Initialize the compliance comment manager.
        
        Args:
            token: GitHub token for authentication
            repo: Repository in format 'owner/repo'
            pr_number: Pull request number
            commit_sha: Commit SHA being checked
            workflow_url: URL to the workflow run
            report_data: Optional compliance report data (parsed from JSON)
        """
        self.token = token
        self.owner, self.repo_name = repo.split('/')
        self.pr_number = pr_number
        self.commit_sha = commit_sha
        self.commit_sha_short = commit_sha[:7] if commit_sha else 'unknown'
        self.workflow_url = workflow_url
        self.report_data = report_data or {}
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
        
        value = value[:max_length]
        value = re.sub(r'[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]', '', value)
        value = value.replace('`', '\\`')
        
        return value
    
    @staticmethod
    def get_layout_count_for_sorting(comp: Dict[str, Any]) -> int:
        """
        Extract layout count from component issues for sorting.
        
        Handles edge cases and errors gracefully by returning 0 for any
        issues that can't be parsed.
        
        Args:
            comp: Component dictionary with 'issues' list
            
        Returns:
            Layout count as integer, or 0 if parsing fails
        """
        try:
            match = re.search(r'(\d+)', comp['issues'][0])
            return int(match.group(1)) if match else 0
        except (KeyError, IndexError, ValueError, TypeError):
            return 0
    
    def get_existing_comment(self) -> Optional[Dict[str, Any]]:
        """
        Find existing compliance report comment on the PR.
        
        Returns:
            Comment dict if found, None otherwise
        """
        url = f"{self.api_base}/repos/{self.owner}/{self.repo_name}/issues/{self.pr_number}/comments"
        
        try:
            response = requests.get(url, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            comments = response.json()
            print(f"Searching {len(comments)} comments for compliance report marker")
            for comment in comments:
                if self.COMMENT_MARKER in comment.get('body', ''):
                    print(f"✅ Found existing compliance comment (ID: {comment['id']})")
                    return comment
            
            print("No existing compliance comment found")
            return None
        except requests.exceptions.RequestException as e:
            print(f"Error fetching comments: {e}", file=sys.stderr)
            return None
    
    def build_comment_body(self) -> str:
        """
        Build the compliance report comment body.
        
        Returns:
            Formatted comment body with marker at the very start
        """
        timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')
        
        # Extract summary data
        summary = self.report_data.get('summary', {})
        results = self.report_data.get('results', {})
        
        total = summary.get('total', 0)
        compliant = summary.get('compliant', 0)
        partial = summary.get('partiallyCompliant', 0)
        non_compliant = summary.get('nonCompliant', 0)
        compliance_pct = summary.get('overallCompliance', 0)
        
        # Determine status badge color
        if compliance_pct >= 90:
            status_badge = "brightgreen"
            status_text = "Excellent"
        elif compliance_pct >= 70:
            status_badge = "green"
            status_text = "Good"
        elif compliance_pct >= 50:
            status_badge = "yellow"
            status_text = "Needs Improvement"
        else:
            status_badge = "orange"
            status_text = "Action Required"
        
        # Create commit link
        commit_url = f"https://github.com/{self.owner}/{self.repo_name}/commit/{self.commit_sha}"
        
        # Build the comment header
        comment = f"""{self.COMMENT_MARKER}
## 🔍 Framework Compliance Report

<a href="{commit_url}"><img src="https://img.shields.io/badge/Commit-{self.commit_sha_short}-blue?style=flat-square&logo=github" alt="Commit"/></a>
<a href="{self.workflow_url}"><img src="https://img.shields.io/badge/Workflow-View_Logs-gray?style=flat-square&logo=github-actions" alt="Workflow"/></a>
<a href="#"><img src="https://img.shields.io/badge/Compliance-{compliance_pct}%25-{status_badge}?style=flat-square" alt="Compliance"/></a>

**Generated:** {timestamp}  
**Status:** {status_text}

### 📊 Summary

| Status | Count | Percentage |
|--------|-------|------------|
| 🟢 Compliant | {compliant}/{total} | {round(compliant/total*100) if total > 0 else 0}% |
| 🟠 Partial | {partial}/{total} | {round(partial/total*100) if total > 0 else 0}% |
| 🔴 Non-compliant | {non_compliant}/{total} | {round(non_compliant/total*100) if total > 0 else 0}% |

"""

        # Add issue categories if available
        partial_comps = results.get('partiallyCompliant', [])
        
        # Group by issue type
        nested_layouts = [c for c in partial_comps if any('layout components' in i for i in c.get('issues', []))]
        missing_layout = [c for c in partial_comps if any('Missing PageLayout' in i for i in c.get('issues', []))]
        custom_headers = [c for c in partial_comps if any('custom header' in i for i in c.get('issues', []))]
        
        if nested_layouts:
            comment += f"\n### 📦 Nested Layouts ({len(nested_layouts)} components)\n\n"
            for comp in sorted(nested_layouts, key=self.get_layout_count_for_sorting, reverse=True)[:5]:
                layout_count = re.search(r'Found (\d+)', comp['issues'][0])
                count_str = layout_count.group(1) if layout_count else '?'
                comp_url = f"https://github.com/{self.owner}/{self.repo_name}/blob/{self.commit_sha}/src/components/{comp['name']}.js"
                comment += f"- 🟠 [{comp['name']}]({comp_url}) ({count_str} layouts)\n"
            if len(nested_layouts) > 5:
                comment += f"- ... and {len(nested_layouts) - 5} more\n"
        
        if missing_layout:
            comment += f"\n### 📄 Missing PageLayout ({len(missing_layout)} components)\n\n"
            for comp in missing_layout[:5]:
                comp_url = f"https://github.com/{self.owner}/{self.repo_name}/blob/{self.commit_sha}/src/components/{comp['name']}.js"
                comment += f"- 🟠 [{comp['name']}]({comp_url})\n"
            if len(missing_layout) > 5:
                comment += f"- ... and {len(missing_layout) - 5} more\n"
        
        if custom_headers:
            comment += f"\n### 🎨 Custom Headers ({len(custom_headers)} components)\n\n"
            for comp in custom_headers:
                comp_url = f"https://github.com/{self.owner}/{self.repo_name}/blob/{self.commit_sha}/src/components/{comp['name']}.js"
                comment += f"- 🟠 [{comp['name']}]({comp_url})\n"
        
        # Add non-compliant section if any
        non_compliant_comps = results.get('nonCompliant', [])
        if non_compliant_comps:
            comment += f"\n### 🔴 Non-Compliant Components ({len(non_compliant_comps)})\n\n"
            for comp in non_compliant_comps:
                comp_url = f"https://github.com/{self.owner}/{self.repo_name}/blob/{self.commit_sha}/src/components/{comp['name']}.js"
                issues_str = ', '.join(comp.get('issues', []))
                comment += f"- 🔴 [{comp['name']}]({comp_url}): {issues_str}\n"
        
        # Add footer with next steps
        comment += "\n---\n\n"
        
        if non_compliant > 0:
            comment += "### ❌ Action Required\n\n"
            comment += "Fix non-compliant components before merging.\n\n"
        elif partial > 0:
            comment += "### ⚠️ Recommendations\n\n"
            comment += "Consider addressing partial compliance issues to improve code quality.\n\n"
        else:
            comment += "### ✅ All Clear!\n\n"
            comment += "All components are fully compliant with the framework standards.\n\n"
        
        comment += "📚 **Resources:**\n"
        comment += f"- [Page Framework Documentation](https://github.com/{self.owner}/{self.repo_name}/blob/{self.commit_sha}/public/docs/page-framework.md)\n"
        comment += f"- [View Full Workflow Logs]({self.workflow_url})\n"
        
        comment += "\n💡 *This comment is automatically updated when compliance checks run.*\n"
        
        return comment
    
    def update_comment(self) -> bool:
        """
        Update or create the PR compliance comment.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Check for existing comment
            existing = self.get_existing_comment()
            
            # Build comment body
            comment_body = self.build_comment_body()
            
            if existing:
                # Update existing comment
                url = f"{self.api_base}/repos/{self.owner}/{self.repo_name}/issues/comments/{existing['id']}"
                payload = {"body": comment_body}
                
                response = requests.patch(url, headers=self.headers, json=payload, timeout=30)
                response.raise_for_status()
                
                print(f"✅ Updated PR #{self.pr_number} compliance comment")
                return True
            else:
                # Create new comment
                url = f"{self.api_base}/repos/{self.owner}/{self.repo_name}/issues/{self.pr_number}/comments"
                payload = {"body": comment_body}
                
                response = requests.post(url, headers=self.headers, json=payload, timeout=30)
                response.raise_for_status()
                
                print(f"✅ Created PR #{self.pr_number} compliance comment")
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
        description="Manage PR compliance report comments",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Update PR with compliance report from JSON file
  python manage-compliance-comment.py --token $TOKEN --repo owner/repo --pr 123 \\
      --commit-sha abc123 --workflow-url "https://..." --report-file compliance.json
  
  # Update PR with compliance report from stdin
  node check-framework-compliance.js --json | \\
  python manage-compliance-comment.py --token $TOKEN --repo owner/repo --pr 123 \\
      --commit-sha abc123 --workflow-url "https://..."
        """
    )
    
    parser.add_argument('--token', required=True, help='GitHub token for authentication')
    parser.add_argument('--repo', required=True, help='Repository in format owner/repo')
    parser.add_argument('--pr', type=int, required=True, help='Pull request number')
    parser.add_argument('--commit-sha', required=True, help='Commit SHA being checked')
    parser.add_argument('--workflow-url', required=True, help='URL to the workflow run')
    parser.add_argument('--report-file', help='Path to JSON report file (optional, reads from stdin if not provided)')
    
    args = parser.parse_args()
    
    # Load report data
    report_data = {}
    try:
        if args.report_file and os.path.exists(args.report_file):
            with open(args.report_file, 'r') as f:
                report_data = json.load(f)
            print(f"Loaded compliance report from {args.report_file}")
        else:
            # Try reading from stdin
            import select
            if select.select([sys.stdin], [], [], 0.0)[0]:
                stdin_data = sys.stdin.read()
                if stdin_data.strip():
                    report_data = json.loads(stdin_data)
                    print("Loaded compliance report from stdin")
            else:
                print("Warning: No report data provided, will create comment with empty data", file=sys.stderr)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON data: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error reading report data: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Create manager and update comment
    manager = ComplianceCommentManager(
        args.token,
        args.repo,
        args.pr,
        args.commit_sha,
        args.workflow_url,
        report_data
    )
    success = manager.update_comment()
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
