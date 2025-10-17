# SAML Authorization Workflow - Manual Testing Guide

## Prerequisites

1. Valid GitHub Personal Access Token (PAT)
2. Access to an organization with SAML SSO enabled (e.g., WorldHealthOrganization)
3. PAT not yet authorized for the SAML organization
4. Modern browser with BroadcastChannel support (Chrome, Firefox, Safari)

## Test Environment Setup

1. **Build and run the application:**
   ```bash
   npm install
   npm start
   ```

2. **Login with your PAT:**
   - Navigate to http://localhost:3000/sgex
   - Enter your GitHub PAT
   - Click "Login"

## Test Scenarios

### Test 1: Basic SAML Modal Flow

**Objective:** Verify that SAML modal appears on SAML enforcement error

**Steps:**
1. After login, navigate to a page that fetches WHO organization data
2. Application attempts to fetch data for WorldHealthOrganization
3. GitHub returns 403 SAML enforcement error

**Expected Results:**
- ✅ SAML modal appears automatically
- ✅ Modal title: "🔐 SAML SSO Authorization Required"
- ✅ Organization name is displayed correctly
- ✅ Instructions are clear and numbered
- ✅ Two buttons visible: "🔓 Authorize on GitHub" and "Later"
- ✅ Modal is centered and styled with WHO branding
- ✅ Modal has blue gradient header
- ✅ Only one modal appears (no duplicates)

**Screenshot Required:** Modal appearance

### Test 2: Automatic Polling and Retry

**Objective:** Verify automatic polling detects authorization and retries request

**Steps:**
1. Trigger SAML error (see Test 1)
2. Click "🔓 Authorize on GitHub" button
3. Observe modal changes
4. In the new GitHub tab, authorize your token
5. Return to SGEX tab (leave it open)

**Expected Results:**
- ✅ GitHub SSO page opens in new tab
- ✅ Modal shows polling status section with spinner
- ✅ Status text: "Waiting for authorization..."
- ✅ Spinner animates continuously
- ✅ Button changes to single "Cancel" button
- ✅ After authorization on GitHub (within 5 minutes):
  - Polling detects authorization automatically
  - Status changes to "Authorization successful!"
  - Modal closes after 1 second
  - Original page data loads successfully

**Screenshot Required:** 
1. Modal during polling
2. Success state (if you can catch it)

### Test 3: Later Button and Cooldown

**Objective:** Verify "Later" button triggers 1-minute cooldown

**Steps:**
1. Trigger SAML error
2. Click "Later" button
3. Immediately trigger another SAML error for same org
4. Wait 1 minute
5. Trigger SAML error again

**Expected Results:**
- ✅ Modal closes when "Later" is clicked
- ✅ No modal appears for same org within 1 minute
- ✅ After 1 minute, modal can appear again for same org
- ✅ Different org can show modal immediately

### Test 4: Cross-Tab Synchronization

**Objective:** Verify only one modal appears per org across all tabs

**Steps:**
1. Open SGEX in Tab 1, login
2. Open SGEX in Tab 2 (Ctrl+Click on link or Ctrl+T)
3. In Tab 1, trigger SAML error
4. Observe both tabs

**Expected Results:**
- ✅ Modal appears in Tab 1 (first tab)
- ✅ Modal does NOT appear in Tab 2
- ✅ If you close Tab 1 modal, Tab 2 doesn't auto-open new modal

**Advanced:**
1. In Tab 1, click "Authorize"
2. Authorize on GitHub
3. Observe both tabs

**Expected Results:**
- ✅ Both tabs detect authorization within ~3 seconds
- ✅ Both tabs close any open SAML modals
- ✅ Both tabs can now access the organization

**Screenshot Required:** Two tabs side-by-side showing synchronized behavior

### Test 5: User Dropdown SAML Status

**Objective:** Verify SAML status display in user dropdown

**Steps:**
1. Login to SGEX
2. Navigate to a page that involves an organization (e.g., WHO)
3. Click on your user avatar in the header
4. Observe the dropdown menu

**Expected Results:**
- ✅ Dropdown opens
- ✅ "SAML Authorization" section appears
- ✅ Section header is uppercase and muted color
- ✅ Organization(s) are listed
- ✅ Each org shows status badge:
  - "✓ Authorized" in green if authorized
  - "⚠ Not Authorized" in yellow if not authorized
- ✅ "Authorize Now" button appears for unauthorized orgs
- ✅ Status shows "..." while loading

**Screenshot Required:** Dropdown showing SAML status section

### Test 6: Dynamic Status Refresh

**Objective:** Verify 10-second auto-refresh in dropdown

**Steps:**
1. Open user dropdown
2. Note the status of an organization
3. Keep dropdown open for 10+ seconds
4. Observe status updates

**Expected Results:**
- ✅ Status refreshes approximately every 10 seconds
- ✅ Loading indicator or status change visible
- ✅ No flickering or UI disruption
- ✅ Console shows debug logs: "Refreshing SAML statuses"

**Steps to verify stop:**
1. Close dropdown
2. Check browser console
3. Wait 10+ seconds

**Expected Results:**
- ✅ Console shows: "Stopped SAML status refresh interval"
- ✅ No status refresh requests in network tab

### Test 7: User-Initiated Authorization

**Objective:** Verify authorization can be initiated from dropdown

**Steps:**
1. Open user dropdown
2. Find an unauthorized organization
3. Click "Authorize Now" button

**Expected Results:**
- ✅ Dropdown closes
- ✅ SAML modal opens for that organization
- ✅ Modal proceeds with normal flow (see Test 2)

**Screenshot Required:** Dropdown with "Authorize Now" button

### Test 8: Session Storage Persistence

**Objective:** Verify state persists across page reload

**Steps:**
1. Trigger SAML error, modal opens
2. Press Ctrl+R (page reload)
3. Observe after reload

**Expected Results:**
- ✅ Page reloads successfully
- ✅ Pending SAML request remembered in sessionStorage
- ✅ Organization appears in dropdown as "Not Authorized"
- ✅ Cooldown state preserved (if in cooldown)

**Console verification:**
```javascript
// In browser console:
JSON.parse(sessionStorage.getItem('sgex_saml_state'))
```

**Expected Output:**
```json
{
  "pendingRequests": ["WorldHealthOrganization"],
  "cooldowns": {
    "WorldHealthOrganization": 1729189123456
  },
  "timestamp": 1729189345678
}
```

### Test 9: Polling Timeout

**Objective:** Verify polling stops after 5 minutes

**Steps:**
1. Trigger SAML error
2. Click "Authorize on GitHub"
3. Do NOT authorize on GitHub
4. Wait 5+ minutes (or modify pollingTimeout prop to 30 seconds for faster testing)

**Expected Results:**
- ✅ Polling continues for timeout duration
- ✅ At timeout, polling stops
- ✅ Status changes to "Authorization check timed out. Please try again."
- ✅ No more polling requests in network tab
- ✅ Modal remains open for user action

### Test 10: Dark Mode Support

**Objective:** Verify all SAML UI works in dark mode

**Steps:**
1. Enable dark mode in browser/OS
2. Run Tests 1-7 in dark mode

**Expected Results:**
- ✅ Modal background is dark
- ✅ Text is light colored and readable
- ✅ Buttons have appropriate dark mode styling
- ✅ Dropdown SAML section uses dark colors
- ✅ Status badges have appropriate dark mode colors
- ✅ No white/light flashes or contrast issues

**Screenshot Required:** 
1. Modal in dark mode
2. Dropdown in dark mode

### Test 11: Accessibility

**Objective:** Verify keyboard navigation and screen reader support

**Steps:**
1. Trigger SAML modal
2. Use only keyboard to interact:
   - Tab through focusable elements
   - Press Escape to close
   - Press Enter on buttons
3. Use screen reader to navigate

**Expected Results:**
- ✅ Focus is trapped in modal
- ✅ Tab order is logical
- ✅ Escape key closes modal
- ✅ Enter activates buttons
- ✅ Modal has proper ARIA labels
- ✅ Screen reader announces modal correctly
- ✅ Dropdown keyboard navigation works

### Test 12: Multiple Organizations

**Objective:** Verify handling of multiple organizations simultaneously

**Steps:**
1. Navigate to a page with multiple org contexts
2. Trigger SAML errors for different orgs

**Expected Results:**
- ✅ Each org gets its own modal (sequentially)
- ✅ Dropdown shows all relevant orgs
- ✅ Status is tracked independently per org
- ✅ Authorization of one org doesn't affect others

## Browser Compatibility Testing

Test on the following browsers:

- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Performance Testing

1. **Network Traffic:**
   - Open browser DevTools → Network tab
   - Verify polling frequency is 3 seconds
   - Verify status refresh is 10 seconds
   - No excessive requests

2. **Memory Usage:**
   - Open DevTools → Performance/Memory tab
   - Monitor memory during polling
   - Verify no memory leaks after modal closes

3. **Console Logs:**
   - Check for proper debug logging
   - Verify no errors or warnings
   - Logs should be structured and readable

## Common Issues and Debugging

### Modal doesn't appear
**Debug:**
1. Check browser console for errors
2. Verify error is actually SAML (403 with "SAML" in message)
3. Check if org is in cooldown period
4. Verify modal callback is registered

### Polling doesn't work
**Debug:**
1. Check browser console for polling logs
2. Verify BroadcastChannel is supported
3. Check network tab for polling requests
4. Verify no JavaScript errors

### Cross-tab sync doesn't work
**Debug:**
1. Verify BroadcastChannel API support
2. Check if both tabs are same origin
3. Look for broadcast events in console
4. Verify service initialization

### Status doesn't update in dropdown
**Debug:**
1. Check if interval is running (console logs)
2. Verify API calls in network tab
3. Check for JavaScript errors
4. Verify dropdown is actually open

## Test Report Template

```markdown
## SAML Enhancement Manual Test Report

**Date:** [Date]
**Tester:** [Name]
**Browser:** [Browser + Version]
**OS:** [Operating System]

### Test Results

| Test | Status | Notes |
|------|--------|-------|
| Test 1: Basic Modal | ✅/❌ | |
| Test 2: Polling | ✅/❌ | |
| Test 3: Cooldown | ✅/❌ | |
| Test 4: Cross-Tab | ✅/❌ | |
| Test 5: Dropdown Status | ✅/❌ | |
| Test 6: Auto-Refresh | ✅/❌ | |
| Test 7: User-Initiated | ✅/❌ | |
| Test 8: Persistence | ✅/❌ | |
| Test 9: Timeout | ✅/❌ | |
| Test 10: Dark Mode | ✅/❌ | |
| Test 11: Accessibility | ✅/❌ | |
| Test 12: Multi-Org | ✅/❌ | |

### Screenshots
[Attach screenshots here]

### Issues Found
[List any issues discovered]

### Overall Assessment
[Pass/Fail with summary]
```

## Conclusion

This comprehensive testing guide covers all aspects of the SAML authorization workflow enhancements. Complete all tests to ensure the implementation meets requirements and provides a robust user experience.
