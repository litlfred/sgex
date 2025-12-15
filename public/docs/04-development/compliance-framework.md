# Compliance Framework User Guide

## Overview

The SGEX Compliance Framework has been enhanced with improved reporting, condensed output formats, and PR comment integration. This guide explains how to use the new features.

## Quick Start

### Running Compliance Checks

```bash
# Standard format (original verbose output)
npm run check-framework-compliance

# Condensed format (recommended for quick overview)
node scripts/check-framework-compliance.js --condensed

# JSON format (for programmatic use)
node scripts/check-framework-compliance.js --json

# With commit SHA and workflow URL (for PR comments)
node scripts/check-framework-compliance.js \
  --format pr-comment \
  --commit-sha abc123 \
  --workflow-url https://github.com/owner/repo/actions/runs/123
```

## Output Formats

### Standard Format (Default)

Shows detailed information for each component:

```
⚠️ ActorEditor: 5/6 (83%) - PARTIAL
   Issues: Found 3 layout components - should only have one
   Suggestions: Remove nested PageLayout components - only use one per page

✅ BPMNEditor: 6/6 (100%) - COMPLIANT

📊 COMPLIANCE SUMMARY
====================
✅ Fully Compliant: 20/36
⚠️  Partially Compliant: 16/36
❌ Non-Compliant: 0/36
```

**Use case:** Detailed analysis, debugging specific components

### Condensed Format (Recommended)

Groups issues by category and shows only critical information:

```
📊 COMPLIANCE SUMMARY
====================
🟢 Compliant: 20/36 (56%)
🟠 Partial: 16/36
🔴 Non-compliant: 0/36

📦 Nested Layouts (7 components):
  🟠 QuestionnaireEditor (5 layouts)
  🟠 ActorEditor (3 layouts)
  🟠 BranchDeploymentSelector (3 layouts)

📄 Missing PageLayout (7 components):
  🟠 DAKPublicationGenerator
  🟠 ExampleValueSetEditor
```

**Use case:** Quick overview, CI/CD logs, daily development

### JSON Format

Machine-readable output for automation:

```json
{
  "timestamp": "2025-10-11T11:36:20.312Z",
  "commitSha": "abc123",
  "workflowUrl": "https://...",
  "summary": {
    "total": 36,
    "compliant": 20,
    "partiallyCompliant": 16,
    "nonCompliant": 0,
    "overallCompliance": 56
  },
  "results": {
    "compliant": [...],
    "partiallyCompliant": [...],
    "nonCompliant": [...]
  }
}
```

**Use case:** PR comments, dashboards, metrics tracking

## PR Comment Integration

### Automatic PR Comments

When code-quality workflow runs on a PR, it automatically:

1. Runs compliance check with JSON output
2. Posts/updates a single PR comment with results
3. Links to specific component files at the commit SHA
4. Includes timestamp and workflow run URL

### PR Comment Format

```markdown
## 🔍 Framework Compliance Report

[Commit Badge] [Workflow Badge] [Compliance Badge]

**Generated:** 2025-10-11 11:29:38 UTC
**Status:** Good

### 📊 Summary

| Status | Count | Percentage |
|--------|-------|------------|
| 🟢 Compliant | 20/36 | 56% |
| 🟠 Partial | 16/36 | 44% |
| 🔴 Non-compliant | 0/36 | 0% |

### 📦 Nested Layouts (7 components)

- 🟠 [QuestionnaireEditor](link) (5 layouts)
- 🟠 [ActorEditor](link) (3 layouts)
...
```

### Manual PR Comment Creation

```bash
# Generate JSON report
node scripts/check-framework-compliance.js --json > compliance-report.json

# Update PR comment
python3 scripts/manage-compliance-comment.py \
  --token $GITHUB_TOKEN \
  --repo owner/repo \
  --pr 123 \
  --commit-sha abc123 \
  --workflow-url https://github.com/owner/repo/actions/runs/456 \
  --report-file compliance-report.json
```

## Compliance Status Indicators

### Badge Colors

- 🟢 **Green Circle**: Fully compliant (100%)
- 🟠 **Orange Circle**: Partially compliant (1-99%)
- 🔴 **Red Circle**: Non-compliant (0%)

### Status Text

- **Excellent** (90-100%): All good, minor improvements possible
- **Good** (70-89%): Mostly compliant, some improvements needed
- **Needs Improvement** (50-69%): Multiple issues to address
- **Action Required** (<50%): Significant compliance issues

## Issue Categories

### 📦 Nested Layouts

**Problem:** Component has multiple PageLayout/AssetEditorLayout wrappers

**Impact:** 
- Duplicate headers
- Layout conflicts
- Inconsistent styling

**Fix:** Consolidate to single PageLayout at top level

### 📄 Missing PageLayout

**Problem:** Page component not wrapped with PageLayout

**Impact:**
- No standard header
- No help mascot integration
- Missing navigation context

**Fix:** Wrap component with PageLayout or AssetEditorLayout

### 🎨 Custom Headers

**Problem:** Component implements its own header instead of using PageLayout's

**Impact:**
- Inconsistent UI
- Duplicate navigation elements
- Maintenance burden

**Fix:** Remove custom header, use PageLayout's header prop

### 🛠️ Manual Help Mascot

**Problem:** Direct import of ContextualHelpMascot

**Impact:**
- Bypasses framework help system
- Inconsistent help experience

**Fix:** Remove import, use PageLayout's built-in mascot

## Excluded Components

The following component types are excluded from compliance checks as they're not full pages:

- **Modals & Dialogs**: LoginModal, SAMLAuthModal, CollaborationModal, etc.
- **Forms**: BugReportForm, SaveDialog
- **Badges & Status**: PreviewBadge, ForkStatusBar, DAKStatusBox
- **Widgets**: WorkflowDashboard, ExampleStatsDashboard
- **Selectors**: BranchSelector, LanguageSelector
- **Utility Components**: ContextualHelpMascot, BPMNViewerEnhanced

See `scripts/check-framework-compliance.js` UTILITY_COMPONENTS for complete list.

## Command-Line Options

```
Usage: node check-framework-compliance.js [options]

Options:
  --format <type>       Output format: standard, condensed, pr-comment, json
  --condensed           Shortcut for --format condensed
  --json                Shortcut for --format json
  --commit-sha <sha>    Git commit SHA for linking
  --workflow-url <url>  Workflow run URL for linking
  --help, -h            Show help message

Examples:
  node check-framework-compliance.js
  node check-framework-compliance.js --condensed
  node check-framework-compliance.js --format pr-comment --commit-sha abc123
  node check-framework-compliance.js --json > compliance-report.json
```

## Workflow Integration

### GitHub Actions

The code-quality.yml workflow automatically:

1. Runs compliance check on PR creation/update
2. Generates JSON report
3. Posts condensed summary to workflow logs
4. Creates/updates PR comment with full report
5. Links to component files at specific commit
6. Includes timestamp and workflow run URL

### Exit Codes

- **0**: Compliance check passed (no non-compliant components)
- **1**: Compliance check failed (has non-compliant components)

Note: Partially compliant components don't cause failure

## Best Practices

### For Developers

1. **Run locally before push**: `node scripts/check-framework-compliance.js --condensed`
2. **Fix critical issues first**: Start with nested layouts (highest impact)
3. **Check PR comments**: Review compliance feedback before requesting review
4. **Ask for help**: Unclear about a compliance issue? Add comment to PR

### For Reviewers

1. **Check compliance status**: Look for 🟢🟠🔴 in PR comment
2. **Prioritize nested layouts**: These cause the most problems
3. **Consider context**: Some partial compliance may be acceptable
4. **Use links**: Click component links to review code directly

### For CI/CD

1. **Use condensed format**: Easier to read in logs
2. **Store JSON reports**: For metrics and dashboards
3. **Update PR comments**: Don't create duplicates
4. **Include timestamps**: Track compliance over time

## Troubleshooting

### "Falling back to directory scan"

**Cause:** Could not parse route definitions from App.js or lazyRouteUtils.js

**Impact:** All components in src/components/ are scanned

**Fix:** Usually not a problem, but can be optimized by updating route detection logic

### False Positives

**Cause:** Component incorrectly flagged as non-compliant

**Fix:** Add to UTILITY_COMPONENTS list in check-framework-compliance.js

### Comment Not Updating

**Cause:** Comment marker not found or authentication issues

**Fix:** 
1. Check GITHUB_TOKEN has write permissions
2. Verify PR number is correct
3. Check workflow logs for errors

## Related Documentation

- [COMPLIANCE_ANALYSIS.md](../COMPLIANCE_ANALYSIS.md) - Detailed analysis of all compliance issues
- [Page Framework Documentation](../public/docs/page-framework.md) - Framework usage guide
- [Code Quality Workflow](../.github/workflows/code-quality.yml) - CI/CD integration

## Support

For questions or issues:
1. Review [COMPLIANCE_ANALYSIS.md](../COMPLIANCE_ANALYSIS.md) for detailed explanations
2. Check existing PR comments for similar cases
3. Add comment to your PR describing the issue
4. Tag @litlfred for framework-related questions
