#!/usr/bin/env python3
"""
Generate build metadata JSON file.

This script creates a metadata file with information about the build
environment, workflow run, and configuration.
"""

import json
import sys
import argparse
from pathlib import Path


def generate_metadata(
    output_file: Path,
    workflow_run_id: str,
    workflow_run_url: str,
    branch: str,
    commit_sha: str,
    commit_url: str,
    build_timestamp: str,
    generate_sourcemaps: bool,
    node_version: str,
    runner_os: str,
    triggered_by: str,
    event_name: str
):
    """Generate build metadata JSON file."""
    
    metadata = {
        'workflow_run_id': workflow_run_id,
        'workflow_run_url': workflow_run_url,
        'branch': branch,
        'commit_sha': commit_sha,
        'commit_url': commit_url,
        'build_timestamp': build_timestamp,
        'generate_sourcemaps': generate_sourcemaps,
        'node_version': node_version,
        'runner_os': runner_os,
        'triggered_by': triggered_by,
        'event_name': event_name
    }
    
    output_file.parent.mkdir(exist_ok=True, parents=True)
    
    with open(output_file, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"✅ Build metadata saved to {output_file}")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Generate build metadata JSON')
    parser.add_argument('--workflow-run-id', required=True, help='GitHub workflow run ID')
    parser.add_argument('--workflow-run-url', required=True, help='GitHub workflow run URL')
    parser.add_argument('--branch', required=True, help='Git branch name')
    parser.add_argument('--commit-sha', required=True, help='Git commit SHA')
    parser.add_argument('--commit-url', required=True, help='Git commit URL')
    parser.add_argument('--build-timestamp', required=True, help='Build timestamp')
    parser.add_argument('--generate-sourcemaps', type=lambda x: x.lower() == 'true', 
                       default=False, help='Whether source maps were generated')
    parser.add_argument('--node-version', default='20', help='Node.js version')
    parser.add_argument('--runner-os', required=True, help='Runner OS')
    parser.add_argument('--triggered-by', required=True, help='User who triggered the workflow')
    parser.add_argument('--event-name', required=True, help='GitHub event name')
    parser.add_argument('--output', default='artifacts/build-metadata.json', help='Output file path')
    
    args = parser.parse_args()
    
    generate_metadata(
        output_file=Path(args.output),
        workflow_run_id=args.workflow_run_id,
        workflow_run_url=args.workflow_run_url,
        branch=args.branch,
        commit_sha=args.commit_sha,
        commit_url=args.commit_url,
        build_timestamp=args.build_timestamp,
        generate_sourcemaps=args.generate_sourcemaps,
        node_version=args.node_version,
        runner_os=args.runner_os,
        triggered_by=args.triggered_by,
        event_name=args.event_name
    )
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
