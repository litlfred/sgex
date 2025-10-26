#!/usr/bin/env python3
"""
Webpack Bundle Analysis Script

Analyzes webpack build output and generates human-readable reports about
bundle sizes, modules, and optimization opportunities.

Features:
- Parse webpack stats JSON
- Analyze bundle sizes
- Identify largest modules
- Generate recommendations
- Format output for CI/CD artifacts

Usage:
    python3 scripts/analyze_webpack_stats.py \\
        --stats-file artifacts/webpack-stats.json \\
        --output-file artifacts/bundle-report.txt

    # Also analyze build directory
    python3 scripts/analyze_webpack_stats.py \\
        --build-dir build/ \\
        --output-file artifacts/bundle-report.txt
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple


class BundleAnalyzer:
    """Analyzes webpack bundles and generates reports."""

    # Size thresholds for warnings (in bytes)
    LARGE_MODULE_THRESHOLD = 200 * 1024  # 200 KB
    LARGE_BUNDLE_THRESHOLD = 500 * 1024  # 500 KB

    def __init__(self):
        """Initialize the bundle analyzer."""
        self.stats = None
        self.build_files = []

    def format_size(self, size_bytes: int) -> str:
        """
        Format byte size as human-readable string.

        Args:
            size_bytes: Size in bytes

        Returns:
            Formatted string (e.g., "1.2 MB", "345 KB")
        """
        if size_bytes < 1024:
            return f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            return f"{size_bytes / 1024:.1f} KB"
        else:
            return f"{size_bytes / (1024 * 1024):.2f} MB"

    def load_stats(self, stats_file: Path) -> bool:
        """
        Load webpack stats from JSON file.

        Args:
            stats_file: Path to webpack stats JSON

        Returns:
            True if loaded successfully, False otherwise
        """
        try:
            if not stats_file.exists():
                print(f"⚠️  Stats file not found: {stats_file}", file=sys.stderr)
                return False

            with open(stats_file, 'r', encoding='utf-8') as f:
                self.stats = json.load(f)

            print(f"✅ Loaded stats from: {stats_file}")
            return True

        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON in stats file: {e}", file=sys.stderr)
            return False
        except Exception as e:
            print(f"❌ Error loading stats: {e}", file=sys.stderr)
            return False

    def analyze_build_directory(self, build_dir: Path) -> Dict:
        """
        Analyze build directory to get file sizes.

        Args:
            build_dir: Path to build directory

        Returns:
            Dictionary with file information
        """
        if not build_dir.exists() or not build_dir.is_dir():
            print(f"⚠️  Build directory not found: {build_dir}", file=sys.stderr)
            return {}

        files = []
        total_size = 0

        # Walk through build directory
        for root, _, filenames in os.walk(build_dir):
            for filename in filenames:
                filepath = Path(root) / filename
                if filepath.is_file():
                    size = filepath.stat().st_size
                    rel_path = filepath.relative_to(build_dir)

                    files.append({
                        'path': str(rel_path),
                        'size': size,
                        'type': filepath.suffix
                    })
                    total_size += size

        # Sort by size descending
        files.sort(key=lambda x: x['size'], reverse=True)

        return {
            'files': files,
            'total_size': total_size,
            'file_count': len(files)
        }

    def generate_report(
        self,
        build_dir: Optional[Path] = None,
        output_file: Optional[Path] = None
    ) -> str:
        """
        Generate comprehensive bundle analysis report.

        Args:
            build_dir: Optional path to build directory for file analysis
            output_file: Optional path to write report to

        Returns:
            Report text
        """
        lines = []
        timestamp = datetime.now(timezone.utc).isoformat()

        # Header
        lines.append("=" * 80)
        lines.append("Webpack Bundle Analysis Report")
        lines.append(f"Generated: {timestamp}")
        lines.append("=" * 80)
        lines.append("")

        # Analyze build directory if provided
        build_info = None
        if build_dir:
            print(f"📊 Analyzing build directory: {build_dir}")
            build_info = self.analyze_build_directory(build_dir)

        if build_info:
            lines.append("=== Build Directory Summary ===")
            lines.append(f"Total Size: {self.format_size(build_info['total_size'])}")
            lines.append(f"File Count: {build_info['file_count']}")
            lines.append("")

            # Group by file type
            type_sizes = {}
            for file in build_info['files']:
                ext = file['type'] or 'no-extension'
                if ext not in type_sizes:
                    type_sizes[ext] = {'count': 0, 'size': 0}
                type_sizes[ext]['count'] += 1
                type_sizes[ext]['size'] += file['size']

            lines.append("=== File Types ===")
            for ext, info in sorted(
                type_sizes.items(),
                key=lambda x: x[1]['size'],
                reverse=True
            ):
                lines.append(
                    f"  {ext:20s} {info['count']:3d} files  "
                    f"{self.format_size(info['size']):>10s}"
                )
            lines.append("")

            # Largest files
            lines.append("=== Largest Files (Top 15) ===")
            for i, file in enumerate(build_info['files'][:15], 1):
                size_str = self.format_size(file['size'])
                lines.append(f"  {i:2d}. {size_str:>10s}  {file['path']}")

                # Add warning for large files
                if file['size'] > self.LARGE_MODULE_THRESHOLD:
                    lines.append(f"      ⚠️  Large file (>{self.format_size(self.LARGE_MODULE_THRESHOLD)})")
            lines.append("")

            # JavaScript bundles specifically
            js_files = [f for f in build_info['files'] if f['type'] == '.js']
            if js_files:
                lines.append("=== JavaScript Bundles ===")
                js_total = sum(f['size'] for f in js_files)
                lines.append(f"Total JS Size: {self.format_size(js_total)}")
                lines.append(f"JS File Count: {len(js_files)}")
                lines.append("")

                lines.append("Top 10 JavaScript Files:")
                for i, file in enumerate(js_files[:10], 1):
                    size_str = self.format_size(file['size'])
                    lines.append(f"  {i:2d}. {size_str:>10s}  {file['path']}")
                lines.append("")

            # CSS files
            css_files = [f for f in build_info['files'] if f['type'] == '.css']
            if css_files:
                lines.append("=== CSS Files ===")
                css_total = sum(f['size'] for f in css_files)
                lines.append(f"Total CSS Size: {self.format_size(css_total)}")
                lines.append(f"CSS File Count: {len(css_files)}")
                lines.append("")

                for i, file in enumerate(css_files[:5], 1):
                    size_str = self.format_size(file['size'])
                    lines.append(f"  {i:2d}. {size_str:>10s}  {file['path']}")
                lines.append("")

        # Analyze webpack stats if available
        if self.stats:
            lines.append("=== Webpack Stats Information ===")
            if 'note' in self.stats:
                lines.append(f"Note: {self.stats['note']}")
            if 'tool' in self.stats:
                lines.append(f"Tool: {self.stats['tool']}")
            if 'build_directory' in self.stats:
                lines.append(f"Build Directory: {self.stats['build_directory']}")
            lines.append("")

        # Recommendations
        lines.append("=== Recommendations ===")

        if build_info:
            large_js_files = [
                f for f in js_files
                if f['size'] > self.LARGE_MODULE_THRESHOLD
            ]

            if large_js_files:
                lines.append(f"⚠️  Found {len(large_js_files)} large JavaScript files (>{self.format_size(self.LARGE_MODULE_THRESHOLD)})")
                lines.append("   Consider:")
                lines.append("   - Code splitting for large modules")
                lines.append("   - Lazy loading for non-critical components")
                lines.append("   - Tree shaking to remove unused code")
                lines.append("")

            # Check for very large bundles
            very_large_files = [
                f for f in build_info['files']
                if f['size'] > self.LARGE_BUNDLE_THRESHOLD
            ]

            if very_large_files:
                lines.append(f"🔴 Found {len(very_large_files)} very large files (>{self.format_size(self.LARGE_BUNDLE_THRESHOLD)})")
                lines.append("   Priority actions:")
                lines.append("   - Review dependencies for these files")
                lines.append("   - Consider splitting into smaller chunks")
                lines.append("   - Enable compression (gzip/brotli)")
                lines.append("")

            # General optimization tips
            lines.append("💡 General Optimization Tips:")
            lines.append("   - Enable source map generation only for debugging")
            lines.append("   - Use production builds for deployment")
            lines.append("   - Consider using dynamic imports for routes")
            lines.append("   - Review and optimize third-party dependencies")
            lines.append("")

        else:
            lines.append("ℹ️  No build directory analyzed")
            lines.append("   Run with --build-dir to get detailed recommendations")
            lines.append("")

        # Footer
        lines.append("=" * 80)
        lines.append("End of Report")
        lines.append("=" * 80)

        # Join all lines
        report = "\n".join(lines)

        # Write to file if requested
        if output_file:
            try:
                output_file.parent.mkdir(parents=True, exist_ok=True)
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(report)
                print(f"✅ Report written to: {output_file}")
            except Exception as e:
                print(f"❌ Error writing report: {e}", file=sys.stderr)

        return report

    def generate_json_report(
        self,
        build_dir: Optional[Path] = None
    ) -> Dict:
        """
        Generate JSON bundle analysis report.

        Args:
            build_dir: Optional path to build directory for file analysis

        Returns:
            Dictionary with report data
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Build analysis data
        build_analysis = {}
        if build_dir and build_dir.exists():
            build_analysis = self.analyze_build_directory(build_dir)
        
        # Prepare JSON structure
        report_data = {
            'timestamp': timestamp,
            'build_directory': str(build_dir) if build_dir else None,
            'stats_loaded': self.stats is not None,
        }
        
        # Add build files info if available
        if build_analysis:
            files = build_analysis.get('files', [])
            total_size = build_analysis.get('total_size', 0)
            
            report_data['build_files'] = {
                'total_count': len(files),
                'total_size': total_size,
                'total_size_formatted': self.format_size(total_size),
                'files': files[:50],  # Limit to top 50 files
                'large_files': [
                    f for f in files 
                    if f['size'] > self.LARGE_MODULE_THRESHOLD
                ],
            }
            
            # Add JavaScript-specific analysis
            js_files = [f for f in files if f['type'] == '.js']
            if js_files:
                js_total = sum(f['size'] for f in js_files)
                report_data['javascript'] = {
                    'count': len(js_files),
                    'total_size': js_total,
                    'total_size_formatted': self.format_size(js_total),
                    'files': js_files,
                }
        
        # Add stats info if available
        if self.stats:
            assets = self.stats.get('assets', [])
            chunks = self.stats.get('chunks', [])
            modules = self.stats.get('modules', [])
            
            report_data['webpack_stats'] = {
                'asset_count': len(assets),
                'chunk_count': len(chunks),
                'module_count': len(modules),
                'assets': assets[:50],  # Limit to top 50 assets
                'chunks': chunks[:50],  # Limit to top 50 chunks
            }
        
        return report_data


def parse_arguments():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description='Analyze webpack bundle and generate report',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Analyze webpack stats JSON
  python3 scripts/analyze_webpack_stats.py \\
      --stats-file artifacts/webpack-stats.json \\
      --output-file artifacts/bundle-report.txt

  # Analyze build directory
  python3 scripts/analyze_webpack_stats.py \\
      --build-dir build/ \\
      --output-file artifacts/bundle-report.txt

  # Analyze both
  python3 scripts/analyze_webpack_stats.py \\
      --stats-file artifacts/webpack-stats.json \\
      --build-dir build/ \\
      --output-file artifacts/bundle-report.txt

  # Print to stdout
  python3 scripts/analyze_webpack_stats.py \\
      --build-dir build/
        """
    )

    parser.add_argument(
        '--stats-file',
        type=Path,
        help='Path to webpack stats JSON file'
    )

    parser.add_argument(
        '--build-dir',
        type=Path,
        default=Path('build'),
        help='Path to build directory (default: build)'
    )

    parser.add_argument(
        '--output-file',
        type=Path,
        help='Path to write report (default: print to stdout)'
    )

    parser.add_argument(
        '--format',
        type=str,
        choices=['text', 'json'],
        default='text',
        help='Output format: text or json (default: text)'
    )

    return parser.parse_args()


def main():
    """Main entry point."""
    args = parse_arguments()

    # Create analyzer
    analyzer = BundleAnalyzer()

    # Load stats if provided
    if args.stats_file:
        analyzer.load_stats(args.stats_file)

    # Generate report based on format
    if args.format == 'json':
        report_data = analyzer.generate_json_report(build_dir=args.build_dir)
        report = json.dumps(report_data, indent=2)
        
        # Write to file if requested
        if args.output_file:
            try:
                args.output_file.parent.mkdir(parents=True, exist_ok=True)
                with open(args.output_file, 'w', encoding='utf-8') as f:
                    f.write(report)
                print(f"✅ JSON report written to: {args.output_file}")
            except Exception as e:
                print(f"❌ Error writing JSON report: {e}", file=sys.stderr)
        else:
            print(report)
    else:
        # Generate text report
        report = analyzer.generate_report(
            build_dir=args.build_dir,
            output_file=args.output_file
        )

        # Print to stdout if no output file specified
        if not args.output_file:
            print()
            print(report)

    sys.exit(0)


if __name__ == '__main__':
    main()
