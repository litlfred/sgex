#!/usr/bin/env python3
"""
Test script for manage-compliance-comment.py sorting function

Tests the get_layout_count_for_sorting function to ensure it:
1. Correctly extracts layout counts from component issues
2. Handles edge cases gracefully (missing keys, no matches, etc.)
3. Returns 0 for unparseable inputs instead of crashing

This validates Suggested Change 2 from PR #1092
"""

import sys
import os
import re
from typing import Dict, Any

# Add the scripts directory to path
script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, script_dir)

# Import the module by loading it directly
import importlib.util
spec = importlib.util.spec_from_file_location(
    "manage_compliance_comment",
    os.path.join(script_dir, "manage-compliance-comment.py")
)
manage_compliance_comment = importlib.util.module_from_spec(spec)
spec.loader.exec_module(manage_compliance_comment)

ComplianceCommentManager = manage_compliance_comment.ComplianceCommentManager

# ANSI color codes
GREEN = '\033[92m'
RED = '\033[91m'
RESET = '\033[0m'

def test_valid_issue():
    """Test with a valid component that has layout count in issues"""
    comp = {
        'name': 'TestComponent',
        'issues': ['Found 5 layout components - should only have one']
    }
    result = ComplianceCommentManager.get_layout_count_for_sorting(comp)
    expected = 5
    
    if result == expected:
        print(f"{GREEN}✓ PASS{RESET}: Valid issue with layout count")
        return True
    else:
        print(f"{RED}✗ FAIL{RESET}: Valid issue - expected {expected}, got {result}")
        return False

def test_missing_issues_key():
    """Test with a component missing the 'issues' key"""
    comp = {
        'name': 'TestComponent'
    }
    result = ComplianceCommentManager.get_layout_count_for_sorting(comp)
    expected = 0
    
    if result == expected:
        print(f"{GREEN}✓ PASS{RESET}: Missing 'issues' key returns 0")
        return True
    else:
        print(f"{RED}✗ FAIL{RESET}: Missing issues - expected {expected}, got {result}")
        return False

def test_empty_issues_list():
    """Test with an empty issues list"""
    comp = {
        'name': 'TestComponent',
        'issues': []
    }
    result = ComplianceCommentManager.get_layout_count_for_sorting(comp)
    expected = 0
    
    if result == expected:
        print(f"{GREEN}✓ PASS{RESET}: Empty issues list returns 0")
        return True
    else:
        print(f"{RED}✗ FAIL{RESET}: Empty issues - expected {expected}, got {result}")
        return False

def test_no_number_in_issue():
    """Test with an issue that has no number"""
    comp = {
        'name': 'TestComponent',
        'issues': ['Missing PageLayout wrapper']
    }
    result = ComplianceCommentManager.get_layout_count_for_sorting(comp)
    expected = 0
    
    if result == expected:
        print(f"{GREEN}✓ PASS{RESET}: Issue without number returns 0")
        return True
    else:
        print(f"{RED}✗ FAIL{RESET}: No number - expected {expected}, got {result}")
        return False

def test_multiple_numbers():
    """Test with an issue containing multiple numbers (should get first)"""
    comp = {
        'name': 'TestComponent',
        'issues': ['Found 12 layout components - should only have 1']
    }
    result = ComplianceCommentManager.get_layout_count_for_sorting(comp)
    expected = 12  # Should extract the first number
    
    if result == expected:
        print(f"{GREEN}✓ PASS{RESET}: Multiple numbers extracts first")
        return True
    else:
        print(f"{RED}✗ FAIL{RESET}: Multiple numbers - expected {expected}, got {result}")
        return False

def test_large_number():
    """Test with a large layout count"""
    comp = {
        'name': 'TestComponent',
        'issues': ['Found 999 layout components - should only have one']
    }
    result = ComplianceCommentManager.get_layout_count_for_sorting(comp)
    expected = 999
    
    if result == expected:
        print(f"{GREEN}✓ PASS{RESET}: Large number handled correctly")
        return True
    else:
        print(f"{RED}✗ FAIL{RESET}: Large number - expected {expected}, got {result}")
        return False

def test_invalid_types():
    """Test with invalid data types"""
    test_cases = [
        None,
        "string instead of dict",
        123,
        [],
        {'issues': None},
        {'issues': 'not a list'},
        {'issues': [None]},
    ]
    
    all_passed = True
    for i, comp in enumerate(test_cases):
        try:
            result = ComplianceCommentManager.get_layout_count_for_sorting(comp)
            if result == 0:
                print(f"{GREEN}✓ PASS{RESET}: Invalid type {i+1} returns 0")
            else:
                print(f"{RED}✗ FAIL{RESET}: Invalid type {i+1} - expected 0, got {result}")
                all_passed = False
        except Exception as e:
            print(f"{RED}✗ FAIL{RESET}: Invalid type {i+1} raised exception: {e}")
            all_passed = False
    
    return all_passed

def test_sorting_behavior():
    """Test that components sort correctly by layout count"""
    components = [
        {'name': 'A', 'issues': ['Found 3 layout components']},
        {'name': 'B', 'issues': ['Found 10 layout components']},
        {'name': 'C', 'issues': ['Found 5 layout components']},
        {'name': 'D', 'issues': ['Missing PageLayout']},  # No number
        {'name': 'E', 'issues': []},  # Empty
    ]
    
    sorted_comps = sorted(
        components, 
        key=ComplianceCommentManager.get_layout_count_for_sorting, 
        reverse=True
    )
    
    expected_order = ['B', 'C', 'A', 'D', 'E']  # 10, 5, 3, 0, 0
    actual_order = [c['name'] for c in sorted_comps]
    
    if actual_order == expected_order:
        print(f"{GREEN}✓ PASS{RESET}: Components sort correctly by layout count")
        return True
    else:
        print(f"{RED}✗ FAIL{RESET}: Sorting order incorrect")
        print(f"  Expected: {expected_order}")
        print(f"  Got:      {actual_order}")
        return False

def run_tests():
    """Run all tests"""
    print("🧪 Testing get_layout_count_for_sorting function\n")
    print("=" * 60)
    
    tests = [
        ("Valid issue with layout count", test_valid_issue),
        ("Missing 'issues' key", test_missing_issues_key),
        ("Empty issues list", test_empty_issues_list),
        ("Issue without number", test_no_number_in_issue),
        ("Multiple numbers in issue", test_multiple_numbers),
        ("Large number", test_large_number),
        ("Invalid data types", test_invalid_types),
        ("Sorting behavior", test_sorting_behavior),
    ]
    
    passed = 0
    failed = 0
    
    for name, test_func in tests:
        print(f"\nTest: {name}")
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"{RED}✗ FAIL{RESET}: Unexpected exception: {e}")
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"\n📊 Test Results:")
    print(f"   {GREEN}Passed: {passed}{RESET}")
    print(f"   {RED}Failed: {failed}{RESET}")
    print(f"   Total: {passed + failed}")
    
    if failed == 0:
        print(f"\n{GREEN}✓ All tests passed!{RESET}\n")
        return 0
    else:
        print(f"\n{RED}✗ Some tests failed{RESET}\n")
        return 1

if __name__ == '__main__':
    sys.exit(run_tests())
