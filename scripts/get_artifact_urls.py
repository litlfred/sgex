#!/usr/bin/env python3
"""
Retrieve GitHub Actions artifact URLs for a specific workflow run.
"""

import argparse
import json
import sys
import os
import time
import requests


def get_artifact_urls(token, repo, run_id, artifact_names, max_retries=3, retry_delay=2):
    """
    Retrieve artifact URLs for specific artifacts from a workflow run.
    
    Args:
        token: GitHub authentication token
        repo: Repository in format owner/repo
        run_id: Workflow run ID
        artifact_names: List of artifact names to retrieve URLs for
        max_retries: Maximum number of retries for API calls
        retry_delay: Delay in seconds between retries
    
    Returns:
        Dictionary mapping artifact names to their URLs
    """
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json'
    }
    
    url = f'https://api.github.com/repos/{repo}/actions/runs/{run_id}/artifacts'
    
    artifact_urls = {}
    
    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            artifacts = data.get('artifacts', [])
            
            # Match artifacts by name
            for artifact in artifacts:
                artifact_name = artifact.get('name', '')
                if artifact_name in artifact_names:
                    # Construct browser-friendly URL instead of API URL
                    # API URL format: https://api.github.com/repos/{repo}/actions/artifacts/{id}/zip
                    # Browser URL format: https://github.com/{repo}/actions/runs/{run_id}/artifacts/{id}
                    artifact_id = artifact.get('id')
                    if artifact_id:
                        artifact_url = f'https://github.com/{repo}/actions/runs/{run_id}/artifacts/{artifact_id}'
                        artifact_urls[artifact_name] = artifact_url
            
            # If we found all requested artifacts, we're done
            if len(artifact_urls) == len(artifact_names):
                break
            
            # Otherwise, wait and retry (artifacts might still be uploading)
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
        
        except requests.exceptions.RequestException as e:
            print(f"Attempt {attempt + 1}/{max_retries} failed: {e}", file=sys.stderr)
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                print(f"Failed to retrieve artifacts after {max_retries} attempts", file=sys.stderr)
                return {}
    
    return artifact_urls


def main():
    parser = argparse.ArgumentParser(
        description='Retrieve GitHub Actions artifact URLs for a workflow run'
    )
    parser.add_argument('--token', required=True, help='GitHub authentication token')
    parser.add_argument('--repo', required=True, help='Repository in format owner/repo')
    parser.add_argument('--run-id', required=True, help='Workflow run ID')
    parser.add_argument('--artifact-names', required=True, help='Comma-separated list of artifact names')
    parser.add_argument('--output-file', help='Optional output file for JSON results')
    parser.add_argument('--max-retries', type=int, default=3, help='Maximum number of retries')
    parser.add_argument('--retry-delay', type=int, default=2, help='Delay between retries in seconds')
    
    args = parser.parse_args()
    
    # Parse artifact names
    artifact_names = [name.strip() for name in args.artifact_names.split(',')]
    
    # Retrieve artifact URLs
    artifact_urls = get_artifact_urls(
        args.token,
        args.repo,
        args.run_id,
        artifact_names,
        args.max_retries,
        args.retry_delay
    )
    
    if not artifact_urls:
        print("Warning: No artifact URLs retrieved", file=sys.stderr)
    
    # Output results
    results = {
        'artifact_urls': artifact_urls,
        'found_count': len(artifact_urls),
        'requested_count': len(artifact_names)
    }
    
    # Write to file if specified
    if args.output_file:
        with open(args.output_file, 'w') as f:
            json.dump(results, f, indent=2)
    
    # Also output as JSON to stdout
    print(json.dumps(results))
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
