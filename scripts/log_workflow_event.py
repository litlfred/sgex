#!/usr/bin/env python3
"""
Workflow Event Logger

Logs detailed GitHub Actions event payload and metadata for debugging.
Records the exact event information delivered by GitHub including:
- Event name and action
- Triggering user/actor
- Complete event JSON payload
- Related commits, branches, and PRs with links
- Concurrent workflow runs for the same commit

Usage:
    python3 scripts/log_workflow_event.py \\
        --event-name "${{ github.event_name }}" \\
        --event-json '${{ toJSON(github.event) }}' \\
        --github-json '${{ toJSON(github) }}' \\
        --output-file "artifacts/workflow-event.log"
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional


class WorkflowEventLogger:
    """Logs GitHub Actions workflow event metadata."""

    def __init__(self, output_file: Optional[Path] = None):
        """
        Initialize the event logger.

        Args:
            output_file: Optional path to write log file
        """
        self.output_file = output_file
        if output_file:
            output_file.parent.mkdir(parents=True, exist_ok=True)

    def format_timestamp(self) -> str:
        """Get current timestamp in ISO format."""
        return datetime.now(timezone.utc).isoformat()

    def extract_commit_info(self, event: Dict[str, Any], github: Dict[str, Any]) -> Dict[str, Any]:
        """Extract commit information from event and github context."""
        commit_info = {
            'sha': github.get('sha', 'unknown'),
            'ref': github.get('ref', 'unknown'),
            'ref_name': github.get('ref_name', 'unknown'),
            'head_ref': github.get('head_ref', ''),
            'base_ref': github.get('base_ref', ''),
        }

        # Extract commit details from event
        if 'head_commit' in event:
            head_commit = event['head_commit']
            commit_info['message'] = head_commit.get('message', '')
            commit_info['author'] = head_commit.get('author', {}).get('name', '')
            commit_info['timestamp'] = head_commit.get('timestamp', '')
        elif 'pull_request' in event:
            pr = event['pull_request']
            commit_info['message'] = pr.get('title', '')
            commit_info['author'] = pr.get('user', {}).get('login', '')
        
        return commit_info

    def extract_pr_info(self, event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Extract pull request information if available."""
        if 'pull_request' in event:
            pr = event['pull_request']
            return {
                'number': pr.get('number'),
                'title': pr.get('title', ''),
                'state': pr.get('state', ''),
                'url': pr.get('html_url', ''),
                'head_ref': pr.get('head', {}).get('ref', ''),
                'base_ref': pr.get('base', {}).get('ref', ''),
                'user': pr.get('user', {}).get('login', ''),
            }
        return None

    def create_links(self, github: Dict[str, Any], commit_info: Dict[str, Any]) -> Dict[str, str]:
        """Create links to GitHub resources."""
        repo = github.get('repository', '')
        server_url = github.get('server_url', 'https://github.com')
        sha = commit_info.get('sha', '')
        ref_name = commit_info.get('ref_name', '')
        run_id = github.get('run_id', '')

        links = {}
        
        if repo and sha:
            links['commit'] = f"{server_url}/{repo}/commit/{sha}"
        
        if repo and ref_name and not ref_name.startswith('refs/pull/'):
            links['branch'] = f"{server_url}/{repo}/tree/{ref_name}"
        
        if repo and run_id:
            links['workflow_run'] = f"{server_url}/{repo}/actions/runs/{run_id}"
        
        return links

    def log_event(
        self,
        event_name: str,
        event: Dict[str, Any],
        github: Dict[str, Any]
    ) -> str:
        """
        Log the workflow event with detailed information.

        Args:
            event_name: Name of the GitHub event
            event: Event payload
            github: GitHub context

        Returns:
            Formatted log text
        """
        lines = []
        timestamp = self.format_timestamp()

        # Header
        lines.append("=" * 80)
        lines.append("GitHub Actions Workflow Event Log")
        lines.append(f"Timestamp: {timestamp}")
        lines.append("=" * 80)
        lines.append("")

        # Basic event info
        lines.append("=== Event Information ===")
        lines.append(f"Event Name: {event_name}")
        lines.append(f"Action: {event.get('action', 'N/A')}")
        lines.append(f"Triggered By: {github.get('actor', 'unknown')}")
        lines.append(f"Workflow: {github.get('workflow', 'unknown')}")
        lines.append(f"Run ID: {github.get('run_id', 'unknown')}")
        lines.append(f"Run Number: {github.get('run_number', 'unknown')}")
        lines.append(f"Run Attempt: {github.get('run_attempt', 'unknown')}")
        lines.append("")

        # Repository info
        lines.append("=== Repository Information ===")
        lines.append(f"Repository: {github.get('repository', 'unknown')}")
        lines.append(f"Repository Owner: {github.get('repository_owner', 'unknown')}")
        lines.append(f"Repository ID: {github.get('repository_id', 'unknown')}")
        lines.append("")

        # Commit info
        commit_info = self.extract_commit_info(event, github)
        lines.append("=== Commit Information ===")
        lines.append(f"SHA: {commit_info['sha']}")
        lines.append(f"Ref: {commit_info['ref']}")
        lines.append(f"Ref Name: {commit_info['ref_name']}")
        if commit_info.get('head_ref'):
            lines.append(f"Head Ref: {commit_info['head_ref']}")
        if commit_info.get('base_ref'):
            lines.append(f"Base Ref: {commit_info['base_ref']}")
        if commit_info.get('message'):
            lines.append(f"Message: {commit_info['message'][:200]}")
        if commit_info.get('author'):
            lines.append(f"Author: {commit_info['author']}")
        lines.append("")

        # PR info if available
        pr_info = self.extract_pr_info(event)
        if pr_info:
            lines.append("=== Pull Request Information ===")
            lines.append(f"PR Number: #{pr_info['number']}")
            lines.append(f"Title: {pr_info['title']}")
            lines.append(f"State: {pr_info['state']}")
            lines.append(f"User: {pr_info['user']}")
            lines.append(f"Head Ref: {pr_info['head_ref']}")
            lines.append(f"Base Ref: {pr_info['base_ref']}")
            lines.append(f"URL: {pr_info['url']}")
            lines.append("")

        # Links to GitHub resources
        links = self.create_links(github, commit_info)
        if links:
            lines.append("=== GitHub Links ===")
            for link_type, url in links.items():
                lines.append(f"{link_type.replace('_', ' ').title()}: {url}")
            lines.append("")

        # Sender information
        if 'sender' in event:
            sender = event['sender']
            lines.append("=== Event Sender ===")
            lines.append(f"Login: {sender.get('login', 'unknown')}")
            lines.append(f"Type: {sender.get('type', 'unknown')}")
            lines.append(f"URL: {sender.get('html_url', '')}")
            lines.append("")

        # Workflow inputs (for workflow_dispatch)
        if event_name == 'workflow_dispatch' and 'inputs' in event:
            lines.append("=== Workflow Inputs ===")
            for key, value in event['inputs'].items():
                lines.append(f"{key}: {value}")
            lines.append("")

        # Complete event JSON (pretty printed)
        lines.append("=== Complete Event Payload (JSON) ===")
        lines.append(json.dumps(event, indent=2, sort_keys=True))
        lines.append("")

        # Complete github context (pretty printed)
        lines.append("=== Complete GitHub Context (JSON) ===")
        lines.append(json.dumps(github, indent=2, sort_keys=True))
        lines.append("")

        # Footer
        lines.append("=" * 80)
        lines.append(f"End of Event Log - {timestamp}")
        lines.append("=" * 80)

        log_text = "\n".join(lines)

        # Write to file if specified
        if self.output_file:
            with open(self.output_file, 'w', encoding='utf-8') as f:
                f.write(log_text)
            print(f"✅ Event log written to: {self.output_file}")

        return log_text


def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description='Log GitHub Actions workflow event metadata',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Log event to file
  python3 scripts/log_workflow_event.py \\
      --event-name "push" \\
      --event-json '${{ toJSON(github.event) }}' \\
      --github-json '${{ toJSON(github) }}' \\
      --output-file "artifacts/workflow-event.log"

  # Print to stdout
  python3 scripts/log_workflow_event.py \\
      --event-name "pull_request" \\
      --event-json '${{ toJSON(github.event) }}' \\
      --github-json '${{ toJSON(github) }}'
        """
    )

    parser.add_argument(
        '--event-name',
        required=True,
        help='GitHub event name (e.g., push, pull_request, workflow_dispatch)'
    )

    parser.add_argument(
        '--event-json',
        required=True,
        help='GitHub event payload as JSON string (use toJSON(github.event))'
    )

    parser.add_argument(
        '--github-json',
        required=True,
        help='GitHub context as JSON string (use toJSON(github))'
    )

    parser.add_argument(
        '--output-file',
        type=Path,
        help='Path to write log file (default: print to stdout)'
    )

    return parser.parse_args()


def main():
    """Main entry point."""
    args = parse_arguments()

    try:
        # Parse JSON arguments
        event = json.loads(args.event_json)
        github = json.loads(args.github_json)
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON: {e}", file=sys.stderr)
        sys.exit(1)

    # Create logger and log event
    logger = WorkflowEventLogger(output_file=args.output_file)
    log_text = logger.log_event(args.event_name, event, github)

    # Print summary to console
    print("\n📋 Workflow Event Summary")
    print("=" * 80)
    print(f"Event: {args.event_name}")
    print(f"Actor: {github.get('actor', 'unknown')}")
    print(f"SHA: {github.get('sha', 'unknown')}")
    print(f"Ref: {github.get('ref', 'unknown')}")
    print(f"Run ID: {github.get('run_id', 'unknown')}")
    
    if args.output_file:
        print(f"\n📝 Full log saved to: {args.output_file}")
    else:
        print("\n" + log_text)

    sys.exit(0)


if __name__ == '__main__':
    main()
