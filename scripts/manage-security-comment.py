#!/usr/bin/env python3
"""
Security Check Comment Manager for GitHub Actions

This script manages security check comments on pull requests,
integrating with the run-security-checks.js and format-security-comment.js scripts.
"""

import argparse
import json
import os
import sys
from typing import Dict, Optional, Any

try:
    import requests
except ImportError:
    print("Error: requests library not found. Install with: pip install requests", file=sys.stderr)
    sys.exit(1)


class SecurityCheckCommentManager:
    """Manages security check comments on PRs."""
    
    COMMENT_MARKER = "<!-- sgex-security-check-comment -->"
    
    def __init__(self, token: str, repo: str, pr_number: int):
        """
        Initialize the security check comment manager.
        
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
    
    def get_existing_comment(self) -> Optional[Dict[str, Any]]:
        """Find existing security check comment on the PR."""
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
    
    def create_comment_body(self, security_comment: str) -> str:
        """Create the full comment body with marker."""
        return f"""{self.COMMENT_MARKER}
{security_comment}

---

*This security check is automatically run on every PR build. [Learn more about our security checks](../blob/main/docs/security.md)*
"""
    
    def update_or_create_comment(self, security_comment: str) -> bool:
        """Update existing comment or create new one."""
        try:
            comment_body = self.create_comment_body(security_comment)
            existing = self.get_existing_comment()
            
            if existing:
                # Update existing comment
                url = f"{self.api_base}/repos/{self.owner}/{self.repo_name}/issues/comments/{existing['id']}"
                payload = {"body": comment_body}
                
                response = requests.patch(url, headers=self.headers, json=payload, timeout=30)
                response.raise_for_status()
                
                print(f"✅ Updated security check comment on PR #{self.pr_number}")
                return True
            else:
                # Create new comment
                url = f"{self.api_base}/repos/{self.owner}/{self.repo_name}/issues/{self.pr_number}/comments"
                payload = {"body": comment_body}
                
                response = requests.post(url, headers=self.headers, json=payload, timeout=30)
                response.raise_for_status()
                
                print(f"✅ Created security check comment on PR #{self.pr_number}")
                return True
                
        except requests.exceptions.RequestException as e:
            print(f"Error updating comment: {e}", file=sys.stderr)
            return False


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Manage security check comments on PRs')
    parser.add_argument('--token', required=True, help='GitHub token')
    parser.add_argument('--repo', required=True, help='Repository (owner/repo)')
    parser.add_argument('--pr', type=int, required=True, help='Pull request number')
    parser.add_argument('--comment-file', default='security-comment.md', 
                       help='Path to formatted security comment file')
    
    args = parser.parse_args()
    
    # Read the formatted security comment
    if not os.path.exists(args.comment_file):
        print(f"Error: Comment file not found: {args.comment_file}", file=sys.stderr)
        print("Run run-security-checks.js and format-security-comment.js first.", file=sys.stderr)
        sys.exit(1)
    
    with open(args.comment_file, 'r') as f:
        security_comment = f.read()
    
    # Create manager and update comment
    manager = SecurityCheckCommentManager(
        token=args.token,
        repo=args.repo,
        pr_number=args.pr
    )
    
    success = manager.update_or_create_comment(security_comment)
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
