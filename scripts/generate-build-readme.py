#!/usr/bin/env python3
"""
Generate build artifacts README file.

This script creates a README.md file in the artifacts directory
that explains what each artifact is and how to use them.
"""

import sys
import argparse
from pathlib import Path
from datetime import datetime, timezone


def generate_readme(
    output_file: Path,
    branch: str,
    commit_sha: str,
    workflow_url: str
):
    """Generate README.md for build artifacts."""
    
    readme_content = f"""# Build Analysis Artifacts

This directory contains detailed build logs and statistics from the SGEX Workbench production build.

## Files in this Archive

### Logs
- **npm-install.log** - Complete npm dependency installation log with verbose output
- **build.log** - Full webpack build log including all warnings and errors
- **build-analysis.txt** - Human-readable analysis of build output with size breakdowns

### Statistics
- **webpack-stats.json** - Complete webpack bundle statistics in JSON format (if generated)
- **build-analysis.json** - Detailed build size analysis with file-by-file breakdown

## How to Use These Artifacts

### Viewing Build Logs
Simply open the `.log` or `.txt` files in any text editor to review the build output.

### Analyzing Bundle Size
1. Open `build-analysis.json` to see detailed file-by-file breakdown
2. Review `build-analysis.txt` for a quick summary of largest files
3. Use `webpack-stats.json` with tools like:
   - [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)
   - [webpack-visualizer](https://chrisbateman.github.io/webpack-visualizer/)
   - [source-map-explorer](https://www.npmjs.com/package/source-map-explorer)

### Finding Build Issues
1. Search `build.log` for "ERROR" or "WARNING" to find issues
2. Check `npm-install.log` if build failures occur during dependency installation
3. Review bundle sizes in `build-analysis.json` to identify optimization opportunities

## Accessing These Artifacts from GitHub

1. Navigate to the GitHub Actions tab
2. Click on the specific workflow run
3. Scroll down to the "Artifacts" section
4. Download the "build-logs-and-stats" artifact
5. Extract the ZIP file to access all logs and statistics

## Retention Policy

Build artifacts are retained for **90 days** by default (configurable in workflow settings).
After this period, artifacts are automatically deleted by GitHub.

---

Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}
Branch: {branch}
Commit: {commit_sha}
Workflow Run: {workflow_url}
"""
    
    with open(output_file, 'w') as f:
        f.write(readme_content)
    
    print(f"✅ Build summary generated at {output_file}")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='Generate build artifacts README')
    parser.add_argument('--branch', required=True, help='Git branch name')
    parser.add_argument('--commit', required=True, help='Git commit SHA')
    parser.add_argument('--workflow-url', required=True, help='GitHub workflow run URL')
    parser.add_argument('--output', default='artifacts/README.md', help='Output file path')
    
    args = parser.parse_args()
    
    output_file = Path(args.output)
    output_file.parent.mkdir(exist_ok=True, parents=True)
    
    generate_readme(
        output_file=output_file,
        branch=args.branch,
        commit_sha=args.commit,
        workflow_url=args.workflow_url
    )
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
