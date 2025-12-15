# Workflow Concurrency Race Condition Fix

## Issue #841: Race condition in deploy feature branch workflow

### Problem Summary

The branch deployment workflow was experiencing cancellations with error messages like:
```
Deploy Feature Branch
Canceling since a higher priority waiting request for branch-deployment-copilot/fix-826 exists
```

This occurred when multiple commits were pushed quickly to the same branch (common with copilot or rapid development), causing workflow runs to cancel each other.

### Root Cause

The issue was in the `concurrency` configuration of `.github/workflows/branch-deployment.yml`:

```yaml
concurrency:
  group: "branch-deployment-${{ github.event.inputs.branch || github.head_ref || github.ref_name }}"
  cancel-in-progress: true  # ❌ This caused the race condition
```

When multiple workflow runs started for the same branch:
1. Each run joined the same concurrency group (branch-specific)
2. `cancel-in-progress: true` caused newer runs to cancel older ones
3. Rapid commits created a race condition where workflows kept cancelling each other
4. Result: "higher priority waiting request" errors and failed deployments

### Solution Implemented

Changed the concurrency configuration to prevent aggressive cancellation:

```yaml
concurrency:
  group: "branch-deployment-${{ github.event.inputs.branch || github.head_ref || github.ref_name }}"
  cancel-in-progress: false  # ✅ Allows workflows to queue instead of cancelling
```

### Why This Works

1. **Workflow Level**: Workflows now queue instead of cancelling each other
2. **Git Level**: Existing robust git-level race condition handling (implemented in previous fixes) manages actual deployment conflicts
3. **Best of Both**: Prevents workflow cancellation while maintaining deployment safety

### Existing Safeguards Maintained

The fix relies on existing git-level race condition handling already implemented:
- Robust fetch/rebase/push sequence in deployment steps
- Automatic conflict resolution for branch-specific deployments
- Retry mechanism with exponential backoff
- Comprehensive error handling and recovery

### Files Modified

- `.github/workflows/branch-deployment.yml` - Changed `cancel-in-progress: false`
- `src/tests/BranchDeploymentWorkflowTriggers.test.js` - Added concurrency tests

### Test Coverage

Added comprehensive tests to validate:
- ✅ Concurrency configuration prevents race conditions
- ✅ Branch-specific concurrency groups work correctly  
- ✅ Different branches can deploy concurrently
- ✅ Same branch workflows queue instead of cancelling

### Expected Behavior After Fix

When multiple commits are pushed to the same branch:

1. ✅ Multiple workflow runs start and join the same concurrency group
2. ✅ Workflows queue instead of cancelling each other
3. ✅ Each workflow processes its deployment safely
4. ✅ Git-level handling manages any deployment conflicts
5. ✅ No more "higher priority waiting request" errors

### Impact

This is a minimal, surgical change that:
- ✅ Fixes the cancellation race condition
- ✅ Maintains all existing deployment safety mechanisms
- ✅ Improves reliability for rapid development workflows
- ✅ Enhances copilot and automated commit compatibility

### Related Documentation

- `docs/deployment-fix-691.md` - Git-level race condition handling
- `DEPLOYMENT.md` - Overall deployment workflow documentation
- `BRANCH_DEPLOYMENT_FIX.md` - Previous deployment fixes

---

**Document Version**: 1.0  
**Issue**: #841  
**Fix Date**: 2024-01-XX  
**Next Review**: Monitor deployment reliability metrics