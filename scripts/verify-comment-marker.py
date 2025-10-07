#!/usr/bin/env python3
"""
Manual verification script for GitHub workflow comment marker fix.

This script can be run manually to verify that the comment marker
is correctly placed at the start of comment bodies for all stages.

Usage:
    python3 scripts/verify-comment-marker.py

This script does not require GitHub credentials and runs entirely offline.
"""

import sys
import os

# Add scripts directory to Python path
script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, script_dir)

# Import the module
import importlib.util
spec = importlib.util.spec_from_file_location(
    "manage_pr_comment", 
    os.path.join(script_dir, "manage-pr-comment.py")
)
manage_pr_comment = importlib.util.module_from_spec(spec)
spec.loader.exec_module(manage_pr_comment)

PRCommentManager = manage_pr_comment.PRCommentManager


def verify_all_stages():
    """Verify marker placement for all workflow stages."""
    
    print("="*70)
    print(" VERIFYING GITHUB WORKFLOW COMMENT MARKER PLACEMENT")
    print("="*70)
    print()
    print("This script verifies that the HTML comment marker is correctly")
    print("placed at the START of comment bodies for all workflow stages.")
    print()
    
    # Create manager instance
    manager = PRCommentManager(
        token="test-token",  # Fake token for offline testing
        repo="owner/repo",
        pr_number=123,
        action_id="test-run-12345"
    )
    
    print(f"Using marker: {manager.comment_marker}")
    print()
    
    # Test data
    test_data = {
        'commit_sha': 'abc1234567890def',
        'branch_name': 'feature/test-branch',
        'commit_url': 'https://github.com/owner/repo/commit/abc1234',
        'workflow_url': 'https://github.com/owner/repo/actions/runs/12345',
        'branch_url': 'https://github.com/owner.github.io/repo/branches/feature-test-branch'
    }
    
    # All stages to test
    stages = [
        ('started', 'Build Started', {}),
        ('setup', 'Setting Up Environment', {}),
        ('building', 'Building Application', {}),
        ('deploying', 'Deploying to GitHub Pages', {}),
        ('verifying', 'Verifying Deployment', {}),
        ('success', 'Successfully Deployed', {}),
        ('failure', 'Failed', {'error_message': 'Test error message'}),
        ('pages-built', 'GitHub Pages Built', {}),
    ]
    
    print("-"*70)
    print(f"{'Stage':<15} {'Description':<30} {'Result':<15}")
    print("-"*70)
    
    all_passed = True
    for stage, description, extra_data in stages:
        data = {**test_data, **extra_data}
        
        try:
            # Generate comment body
            body = manager.build_comment_body(stage, data, "")
            
            # Verify marker is at start
            marker_at_start = body.startswith(manager.comment_marker)
            marker_in_body = manager.comment_marker in body
            
            if marker_at_start and marker_in_body:
                result = "✅ PASS"
            else:
                result = "❌ FAIL"
                all_passed = False
                
            print(f"{stage:<15} {description:<30} {result:<15}")
            
            if not marker_at_start:
                print(f"  ERROR: Marker not at start!")
                print(f"  First 100 chars: {body[:100]}")
                print()
                
        except Exception as e:
            print(f"{stage:<15} {description:<30} ❌ ERROR")
            print(f"  Exception: {e}")
            print()
            all_passed = False
    
    print("-"*70)
    print()
    
    # Test with existing timeline
    print("Testing with existing timeline data...")
    existing_timeline = """### 📋 Deployment Timeline

- **2024-01-15 10:00:00 UTC** - 🔵 Build started
- **2024-01-15 10:01:00 UTC** - 🔵 Environment setup complete"""
    
    try:
        body = manager.build_comment_body('building', test_data, existing_timeline)
        if body.startswith(manager.comment_marker):
            print("✅ PASS - Marker at start with existing timeline")
        else:
            print("❌ FAIL - Marker not at start with existing timeline")
            all_passed = False
    except Exception as e:
        print(f"❌ ERROR - Exception: {e}")
        all_passed = False
    
    print()
    print("="*70)
    
    if all_passed:
        print("✅ VERIFICATION SUCCESSFUL")
        print()
        print("All stages correctly place the HTML comment marker at the start")
        print("of comment bodies. This ensures get_existing_comment() can find")
        print("and update existing comments without creating duplicates.")
        print()
        print("="*70)
        return 0
    else:
        print("❌ VERIFICATION FAILED")
        print()
        print("Some stages are NOT placing the marker at the start of comment")
        print("bodies. This will cause duplicate comments in PRs.")
        print()
        print("Please check the build_comment_body() method in manage-pr-comment.py")
        print("="*70)
        return 1


def main():
    """Main entry point."""
    try:
        exit_code = verify_all_stages()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\nVerification cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
