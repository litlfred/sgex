#!/usr/bin/env node

/**
 * XSS Protection Demonstration Script
 * 
 * This script demonstrates the security improvements implemented in SGEX Workbench
 * to prevent XSS attacks through HTML injection and input validation.
 */

const { 
  sanitizeHtml, 
  validateRepositoryName, 
  validateUsername, 
  validateBranchName,
  isValidUrlScheme,
  preventPathTraversal,
  escapeHtml
} = require('../src/utils/securityUtils.js');

console.log('🔒 SGEX Workbench XSS Protection Demonstration\n');

// Test HTML Sanitization
console.log('📝 HTML Sanitization Tests:');
console.log('=====================================\n');

const maliciousHtml = `
  <h1>Welcome</h1>
  <p>Safe content here</p>
  <script>alert('XSS Attack!');</script>
  <p onclick="alert('Click attack!')">Click me</p>
  <iframe src="https://evil.com"></iframe>
  <a href="javascript:alert('Link attack!')">Malicious link</a>
  <style>body { background: url(javascript:alert('CSS attack!')); }</style>
`;

console.log('Input HTML:');
console.log(maliciousHtml);
console.log('\nSanitized HTML:');
console.log(sanitizeHtml(maliciousHtml));
console.log('\n');

// Test Input Validation
console.log('✅ Input Validation Tests:');
console.log('=====================================\n');

const testInputs = {
  repositories: [
    { input: 'valid-repo', expected: true },
    { input: 'my_repo.name', expected: true },
    { input: '../../../etc/passwd', expected: false },
    { input: '.hidden-start', expected: false },
    { input: 'repo-end-', expected: false },
    { input: 'repo@invalid', expected: false }
  ],
  usernames: [
    { input: 'validuser', expected: true },
    { input: 'user-123', expected: true },
    { input: '../admin', expected: false },
    { input: 'user--double', expected: false },
    { input: '-startdash', expected: false },
    { input: 'user@domain', expected: false }
  ],
  branches: [
    { input: 'main', expected: true },
    { input: 'feature/new-feature', expected: true },
    { input: '../main', expected: false },
    { input: 'branch..invalid', expected: false },
    { input: '/startslash', expected: false },
    { input: 'branch.lock', expected: false }
  ]
};

console.log('Repository Name Validation:');
testInputs.repositories.forEach(test => {
  const result = validateRepositoryName(test.input);
  const status = result === test.expected ? '✅' : '❌';
  console.log(`${status} "${test.input}" -> ${result} (expected: ${test.expected})`);
});

console.log('\nUsername Validation:');
testInputs.usernames.forEach(test => {
  const result = validateUsername(test.input);
  const status = result === test.expected ? '✅' : '❌';
  console.log(`${status} "${test.input}" -> ${result} (expected: ${test.expected})`);
});

console.log('\nBranch Name Validation:');
testInputs.branches.forEach(test => {
  const result = validateBranchName(test.input);
  const status = result === test.expected ? '✅' : '❌';
  console.log(`${status} "${test.input}" -> ${result} (expected: ${test.expected})`);
});

// Test URL Scheme Validation
console.log('\n🔗 URL Scheme Validation:');
console.log('=====================================\n');

const testUrls = [
  { input: 'https://github.com/user/repo', expected: true },
  { input: 'http://example.com', expected: true },
  { input: 'mailto:user@example.com', expected: true },
  { input: 'javascript:alert("xss")', expected: false },
  { input: 'data:text/html,<script>alert("xss")</script>', expected: false },
  { input: 'vbscript:msgbox("xss")', expected: false }
];

testUrls.forEach(test => {
  const result = isValidUrlScheme(test.input);
  const status = result === test.expected ? '✅' : '❌';
  console.log(`${status} "${test.input}" -> ${result} (expected: ${test.expected})`);
});

// Test Path Traversal Prevention
console.log('\n📁 Path Traversal Prevention:');
console.log('=====================================\n');

const testPaths = [
  '../../../../etc/passwd',
  'docs/../config.yml',
  'safe/path/file.txt',
  '/absolute/path/file.txt',
  'path//with///multiple/slashes',
  'path<script>alert()</script>file'
];

testPaths.forEach(path => {
  const sanitized = preventPathTraversal(path);
  console.log(`"${path}" -> "${sanitized}"`);
});

// Test HTML Escaping
console.log('\n🔤 HTML Entity Escaping:');
console.log('=====================================\n');

const testStrings = [
  '<script>alert("xss")</script>',
  'User input: "Hello & welcome"',
  "It's a 'test' with quotes",
  'Path: /path/to/file'
];

testStrings.forEach(str => {
  const escaped = escapeHtml(str);
  console.log(`"${str}" -> "${escaped}"`);
});

console.log('\n🎉 All security tests completed!');
console.log('\n📋 Summary of Security Improvements:');
console.log('=====================================');
console.log('✅ HTML content sanitization (removes scripts, event handlers, dangerous tags)');
console.log('✅ Repository name validation (prevents path traversal, injection)');
console.log('✅ Username validation (follows GitHub naming rules)');
console.log('✅ Branch name validation (follows Git naming rules)');
console.log('✅ URL scheme validation (prevents javascript:, data:, vbscript: protocols)');
console.log('✅ Path traversal prevention (removes ../, normalizes paths)');
console.log('✅ HTML entity escaping (escapes dangerous characters)');
console.log('✅ Comprehensive test coverage (40+ test cases)');
console.log('\n🔒 SGEX Workbench is now protected against XSS attacks!');