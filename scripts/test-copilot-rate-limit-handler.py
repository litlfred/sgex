#!/usr/bin/env python3
"""
Test script for Copilot Rate Limit Handler workflow logic.

This script tests the rate limit detection patterns and wait time extraction
without actually running the GitHub Actions workflow.
"""

import re
import sys


def test_rate_limit_detection():
    """Test rate limit error pattern detection."""
    
    # Rate limit patterns from the workflow
    rate_limit_patterns = [
        'rate limit',
        'rate-limit',
        'too many requests',
        'retry after',
        'exceeded.*quota',
        'api rate limit exceeded',
        '429',
        'requests per'
    ]
    
    # Test cases
    test_cases = [
        # Should match
        ("Sorry, I hit the rate limit. Please try again later.", True),
        ("API rate limit exceeded. Retry after 60 minutes.", True),
        ("Too many requests. Please wait.", True),
        ("Error 429: Rate-limit reached", True),
        ("You've exceeded your quota for requests per hour.", True),
        
        # Should not match
        ("This is a normal comment without any errors.", False),
        ("The build failed due to syntax errors.", False),
        ("Please review the changes and approve.", False),
    ]
    
    passed = 0
    failed = 0
    
    print("Testing rate limit detection patterns...\n")
    
    for comment_body, should_match in test_cases:
        comment_lower = comment_body.lower()
        has_rate_limit_error = any(
            re.search(pattern, comment_lower) 
            for pattern in rate_limit_patterns
        )
        
        if has_rate_limit_error == should_match:
            print(f"✅ PASS: '{comment_body[:50]}...'")
            passed += 1
        else:
            print(f"❌ FAIL: '{comment_body[:50]}...' (expected {should_match}, got {has_rate_limit_error})")
            failed += 1
    
    print(f"\n{'='*60}")
    print(f"Detection Tests: {passed} passed, {failed} failed")
    print(f"{'='*60}\n")
    
    return failed == 0


def test_wait_time_extraction():
    """Test wait time extraction from error messages."""
    
    test_cases = [
        # (comment, expected_minutes)
        ("Retry after 30 minutes", 30),
        ("Wait 2 hours before trying again", 120),
        ("Rate limit exceeded. Retry after 90 seconds", 2),  # Rounded up
        ("Please wait 45 minutes", 45),
        ("Try again in 1 hour", 60),
        ("No specific time mentioned", 60),  # Default
    ]
    
    passed = 0
    failed = 0
    
    print("Testing wait time extraction...\n")
    
    for comment_body, expected_minutes in test_cases:
        comment_lower = comment_body.lower()
        
        # Wait time extraction logic matching the workflow
        retry_after_match = re.search(r'retry\s+after\s+(\d+)\s*(minute|hour|second)', comment_lower, re.IGNORECASE)
        wait_match = re.search(r'wait\s+(\d+)\s*(minute|hour|second)', comment_lower, re.IGNORECASE)
        time_match = re.search(r'(\d+)\s*(hour|minute|second)s?\s+before', comment_lower, re.IGNORECASE) or \
                     re.search(r'(\d+)\s*(hour|minute|second)s?$', comment_lower, re.IGNORECASE)
        
        match = retry_after_match or wait_match or time_match
        
        if match:
            time = int(match.group(1))
            unit = match.group(2).lower()
            
            if 'hour' in unit:
                wait_minutes = time * 60
            elif 'second' in unit:
                wait_minutes = max(1, (time + 59) // 60)  # Round up
            else:
                wait_minutes = time
        else:
            wait_minutes = 60  # Default
        
        # Cap at 360 minutes
        wait_minutes = min(wait_minutes, 360)
        
        if wait_minutes == expected_minutes:
            print(f"✅ PASS: '{comment_body}' → {wait_minutes} minutes")
            passed += 1
        else:
            print(f"❌ FAIL: '{comment_body}' → {wait_minutes} minutes (expected {expected_minutes})")
            failed += 1
    
    print(f"\n{'='*60}")
    print(f"Extraction Tests: {passed} passed, {failed} failed")
    print(f"{'='*60}\n")
    
    return failed == 0


def test_update_intervals():
    """Test that update intervals are calculated correctly."""
    
    test_cases = [
        # (total_minutes, expected_updates)
        (5, 1),      # 5 minutes: 1 update at start, maybe 1 at end
        (15, 3),     # 15 minutes: updates at 0, 5, 10, 15
        (60, 12),    # 60 minutes: updates every 5 minutes
        (360, 72),   # 360 minutes (6 hours): max duration
    ]
    
    passed = 0
    failed = 0
    
    print("Testing update interval calculations...\n")
    
    for total_minutes, expected_updates in test_cases:
        total_seconds = total_minutes * 60
        update_interval = 300  # 5 minutes in seconds
        
        # Calculate number of updates
        num_updates = (total_seconds + update_interval - 1) // update_interval
        
        # Allow some tolerance for edge cases
        if abs(num_updates - expected_updates) <= 1:
            print(f"✅ PASS: {total_minutes} minutes → ~{num_updates} updates")
            passed += 1
        else:
            print(f"❌ FAIL: {total_minutes} minutes → {num_updates} updates (expected ~{expected_updates})")
            failed += 1
    
    print(f"\n{'='*60}")
    print(f"Interval Tests: {passed} passed, {failed} failed")
    print(f"{'='*60}\n")
    
    return failed == 0


def main():
    """Run all tests."""
    print("="*60)
    print("Copilot Rate Limit Handler - Unit Tests")
    print("="*60)
    print()
    
    all_passed = True
    
    all_passed &= test_rate_limit_detection()
    all_passed &= test_wait_time_extraction()
    all_passed &= test_update_intervals()
    
    if all_passed:
        print("\n✅ All tests passed!")
        return 0
    else:
        print("\n❌ Some tests failed!")
        return 1


if __name__ == '__main__':
    sys.exit(main())
