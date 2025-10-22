#!/usr/bin/env python3
"""
Analyze build output and generate size statistics.

This script walks through the build directory, calculates file sizes,
generates statistics by file type, and identifies the largest files.
Outputs both human-readable text and machine-readable JSON formats.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple
from datetime import datetime, timezone


def format_bytes(bytes_size: int) -> str:
    """Format bytes into human-readable format."""
    if bytes_size == 0:
        return '0 B'
    
    k = 1024
    sizes = ['B', 'KB', 'MB', 'GB']
    i = 0
    size = float(bytes_size)
    
    while size >= k and i < len(sizes) - 1:
        size /= k
        i += 1
    
    return f'{size:.2f} {sizes[i]}'


def analyze_directory(directory: Path) -> List[Dict]:
    """Walk directory and collect file information."""
    files = []
    
    for file_path in directory.rglob('*'):
        if file_path.is_file():
            rel_path = file_path.relative_to(directory)
            files.append({
                'path': str(rel_path),
                'size': file_path.stat().st_size,
                'extension': file_path.suffix or 'no-extension'
            })
    
    return files


def calculate_stats_by_type(files: List[Dict]) -> Tuple[Dict, int]:
    """Calculate statistics grouped by file type."""
    by_type = {}
    total_size = 0
    
    for file_info in files:
        ext = file_info['extension']
        size = file_info['size']
        total_size += size
        
        if ext not in by_type:
            by_type[ext] = {'count': 0, 'size': 0}
        
        by_type[ext]['count'] += 1
        by_type[ext]['size'] += size
    
    return by_type, total_size


def print_analysis(files: List[Dict], by_type: Dict, total_size: int):
    """Print human-readable analysis."""
    print('=== Build Analysis Report ===\n')
    
    # Build size summary
    print('📊 Build Size Summary:')
    print(f'Total Files: {len(files)}')
    print(f'Total Size: {format_bytes(total_size)}\n')
    
    # Size by file type
    print('📂 Size by File Type:')
    sorted_types = sorted(by_type.items(), key=lambda x: x[1]['size'], reverse=True)
    
    for ext, stats in sorted_types:
        percentage = (stats['size'] / total_size * 100) if total_size > 0 else 0
        size_str = format_bytes(stats['size'])
        print(f"  {ext:15} {size_str:12} ({percentage:.1f}%) - {stats['count']} files")
    
    # Top 20 largest files
    print('\n🔍 Top 20 Largest Files:')
    sorted_files = sorted(files, key=lambda x: x['size'], reverse=True)[:20]
    
    for idx, file_info in enumerate(sorted_files, 1):
        percentage = (file_info['size'] / total_size * 100) if total_size > 0 else 0
        size_str = format_bytes(file_info['size'])
        print(f"  {idx:2}. {size_str:12} ({percentage:5.1f}%) - {file_info['path']}")


def save_analysis_json(files: List[Dict], by_type: Dict, total_size: int, output_file: Path):
    """Save detailed analysis to JSON file."""
    
    # Prepare by-type data
    by_type_list = []
    for ext, stats in sorted(by_type.items(), key=lambda x: x[1]['size'], reverse=True):
        percentage = (stats['size'] / total_size * 100) if total_size > 0 else 0
        by_type_list.append({
            'extension': ext,
            'count': stats['count'],
            'size': stats['size'],
            'sizeFormatted': format_bytes(stats['size']),
            'percentage': f'{percentage:.1f}'
        })
    
    # Prepare largest files data
    sorted_files = sorted(files, key=lambda x: x['size'], reverse=True)[:50]
    largest_files = []
    for file_info in sorted_files:
        percentage = (file_info['size'] / total_size * 100) if total_size > 0 else 0
        largest_files.append({
            'path': file_info['path'],
            'size': file_info['size'],
            'sizeFormatted': format_bytes(file_info['size']),
            'percentage': f'{percentage:.1f}'
        })
    
    # Create analysis object
    analysis = {
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'totalFiles': len(files),
        'totalSize': total_size,
        'totalSizeFormatted': format_bytes(total_size),
        'byType': by_type_list,
        'largestFiles': largest_files
    }
    
    # Write to file
    with open(output_file, 'w') as f:
        json.dump(analysis, f, indent=2)
    
    print(f'\n✅ Detailed analysis saved to {output_file}')


def main():
    """Main entry point."""
    build_dir = Path('build')
    artifacts_dir = Path('artifacts')
    
    if not build_dir.exists():
        print('❌ Build directory not found!')
        return 1
    
    # Create artifacts directory
    artifacts_dir.mkdir(exist_ok=True)
    
    # Analyze build directory
    files = analyze_directory(build_dir)
    by_type, total_size = calculate_stats_by_type(files)
    
    # Print human-readable analysis
    print_analysis(files, by_type, total_size)
    
    # Save JSON analysis
    json_output = artifacts_dir / 'build-analysis.json'
    save_analysis_json(files, by_type, total_size, json_output)
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
