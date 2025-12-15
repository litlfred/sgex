# Feature Branch Deployment Fix - Issue #625

## Problem Summary

The feature branch deployment workflow was failing with "non-fast-forward" git push errors. This typically occurred when:

1. Multiple deployments ran concurrently on the same repository
2. Other commits were made to the gh-pages branch between fetch and push operations  
3. The retry mechanism failed to properly recover from reset operations

## Error Details

**Original Error:**
```
error: failed to push some refs to 'https://github.com/litlfred/sgex'
hint: Updates were rejected because the tip of your current branch is behind
hint: its remote counterpart. If you want to integrate the remote changes,
hint: use 'git pull' before pushing again.
```

**Root Cause:**
The original retry mechanism had a critical flaw where it tried to copy from a `build/` directory that was no longer available in the gh-pages branch context after a `git reset --hard origin/gh-pages` operation.

## Solution Implemented

### 1. Build Artifact Backup System

Added a new workflow step that creates a backup of deployment artifacts before switching to the gh-pages branch:

```yaml
- name: Create build artifact backup
  shell: bash
  run: |
    backup_dir="/tmp/sgex-deployment-backup-$$"
    mkdir -p "$backup_dir"
    cp -a "$target_subdir" "$backup_dir/"
    echo "BACKUP_DIR=$backup_dir" >> $GITHUB_ENV
```

### 2. Improved Retry Mechanism

Enhanced the retry logic with:
- **Increased retries**: From 3 to 5 attempts
- **Progressive backoff**: 2s, 5s, 8s, 11s, 14s delays
- **Better synchronization**: Always fetch before operations
- **Robust recovery**: Use backup instead of missing build directory

### 3. Enhanced Recovery Process

When the local branch is behind remote:
1. Store current changes if needed
2. Reset to remote state: `git reset --hard origin/gh-pages`
3. Restore deployment from backup: `cp -a "$backup_dir/$target_subdir" "./"`
4. Re-stage changes and retry push

### 4. Comprehensive Error Handling

- Validates backup directory exists before recovery
- Provides detailed logging for each retry attempt
- Cleans up temporary files after deployment
- Maintains existing safety checks and validations

## Testing

### Automated Test Suite

Run the deployment workflow test:
```bash
./scripts/test-deployment-workflow.sh
```

This test validates:
- Backup creation mechanism
- Recovery from simulated reset scenarios  
- File integrity after restoration
- Proper cleanup of temporary artifacts

### Manual Verification

To test the fix manually:

1. **Create concurrent deployments** by triggering the workflow multiple times:
   ```
   GitHub Actions → Branch Deployment → Run workflow
   Branch: your-test-branch
   ```

2. **Verify successful deployment** by checking:
   - Workflow completes successfully
   - Branch preview is accessible at `https://litlfred.github.io/sgex/your-branch-name/`
   - No "non-fast-forward" errors in logs

3. **Check retry behavior** in workflow logs:
   - Look for "Deployment attempt X of Y" messages
   - Verify backup restoration occurs when needed
   - Confirm progressive backoff timing

## Benefits of This Fix

1. **Eliminates Race Conditions**: Handles concurrent deployments gracefully
2. **Zero Downtime**: Existing deployments remain active during retries
3. **Robust Recovery**: Uses backup artifacts instead of missing directories
4. **Better Debugging**: Enhanced logging for troubleshooting
5. **Backward Compatible**: Maintains all existing workflow functionality

## File Changes

### Modified Files
- `.github/workflows/branch-deployment.yml`: Enhanced retry mechanism and backup system

### New Files  
- `scripts/test-deployment-workflow.sh`: Automated test for backup/recovery mechanism

## Usage Notes

- The fix is automatic - no changes needed to existing deployment processes
- Backup files are temporary and cleaned up after each deployment
- Progressive retry delays help avoid overwhelming the GitHub API
- All existing safety validations and security checks remain intact

## Troubleshooting

If deployments still fail after this fix:

1. **Check GitHub API rate limits**: May need longer delays between retries
2. **Verify permissions**: Ensure workflow has write access to gh-pages branch  
3. **Monitor concurrent deployments**: Consider adding workflow concurrency controls
4. **Review logs**: Look for backup/restore messages in workflow output

The enhanced logging will provide detailed information about which retry attempt succeeded and whether backup recovery was needed.