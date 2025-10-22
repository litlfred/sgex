#!/usr/bin/env python3
"""
Generate webpack bundle statistics JSON from build output.

This script runs the build with stats-json flag and moves the generated
stats.json file to the artifacts directory for analysis with tools like
webpack-bundle-analyzer.
"""

import subprocess
import sys
import os
import shutil
from pathlib import Path


def main():
    """Generate webpack stats JSON file."""
    print("📊 Generating webpack bundle statistics JSON...")
    
    try:
        # Run webpack build with JSON stats output
        env = os.environ.copy()
        env.update({
            'CI': 'false',
            'ESLINT_NO_DEV_ERRORS': 'true',
            'GENERATE_SOURCEMAP': 'false',
            'PUBLIC_URL': '/sgex/'
        })
        
        print("Running webpack build with --stats-json flag...")
        subprocess.run(
            ['npx', 'craco', 'build', '--stats-json'],
            env=env,
            check=True,
            capture_output=False
        )
        
        print("✅ Webpack stats generated successfully")
        
        # Find and move the stats.json file
        build_dir = Path('build')
        stats_file = build_dir / 'stats.json'
        
        if stats_file.exists():
            artifacts_dir = Path('artifacts')
            artifacts_dir.mkdir(exist_ok=True)
            
            dest_file = artifacts_dir / 'webpack-stats.json'
            shutil.copy2(stats_file, dest_file)
            print(f"📦 Stats file saved to {dest_file}")
            return 0
        else:
            print("⚠️ stats.json not found in build directory")
            return 1
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Error generating stats: {e}")
        return 1
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return 1


if __name__ == '__main__':
    sys.exit(main())
