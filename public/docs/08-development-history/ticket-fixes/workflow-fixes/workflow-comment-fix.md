# GitHub Workflow Comment Marker Fix

## Issue
The "No existing comment found" issue was occurring when GitHub Actions workflows tried to update existing PR comments. Instead of updating the existing comment, new duplicate comments were being created.

## Root Cause
The HTML comment marker (e.g., `<!-- sgex-deployment-status-comment:run-12345 -->`) **MUST** be at the very start of every comment body created by `build_comment_body()`. This marker is used by `get_existing_comment()` to find and identify existing comments that belong to a specific workflow run.

If the marker is not present or not at the start, the search logic cannot find the existing comment, leading to:
- Duplicate comments on PRs
- Lost deployment status history
- Confusing PR feedback

## Solution
The fix ensures the marker is always at the start by:

1. **Code Structure**: The `build_comment_body()` method constructs the comment with the marker as the first element in the f-string (line 345):
   ```python
   comment = f"""{self.comment_marker}
   {status_line}
   ...
   ```

2. **Runtime Validation**: Added a validation check before returning the comment body:
   ```python
   if not comment.startswith(self.comment_marker):
       raise RuntimeError("CRITICAL ERROR: Comment marker is not at the start...")
   ```

3. **Debug Logging**: Added logging in `update_comment()` to verify marker placement:
   ```python
   marker_at_start = comment_body.startswith(self.comment_marker)
   print(f"📋 Comment body generated (marker at start: {marker_at_start}, ...)")
   ```

## How It Works

### Comment Creation Flow
1. Workflow calls `manage-pr-comment.py` with `--action-id` (e.g., `${{ github.run_id }}`)
2. Script creates `PRCommentManager` with the action_id
3. Manager creates unique marker: `<!-- sgex-deployment-status-comment:ACTION_ID -->`
4. `build_comment_body()` creates comment with marker at the START
5. Comment is posted to GitHub via API

### Comment Update Flow
1. Workflow calls script again with same `--action-id`
2. Manager creates same marker
3. `get_existing_comment()` fetches all PR comments
4. Searches for comment containing the marker
5. If found: Updates existing comment
6. If not found: Creates new comment

### Why Marker MUST Be At Start
- GitHub API returns comment bodies as-is
- The marker is an HTML comment (`<!-- -->`) which is invisible in rendered markdown
- The search logic uses `marker in comment.get('body', '')` to find matching comments
- If the marker is anywhere else or missing, the comment won't be found
- This causes duplicate comments instead of updates

## Testing
The fix includes comprehensive tests that verify:
- Marker is at the very start for all workflow stages
- Marker works with and without action_id
- Marker works with existing timeline data
- Runtime validation catches any future regressions

## Workflow Integration
The fix is used by `.github/workflows/branch-deployment.yml` which calls the script multiple times during deployment:
- Build Started
- Environment Setup Complete  
- Building Application
- Deploying to GitHub Pages
- Verifying Deployment
- Successfully Deployed / Failed

Each call should update the SAME comment, creating a single, continuously-updated status message on the PR.

## Related Files
- `scripts/manage-pr-comment.py` - Main script with the fix
- `.github/workflows/branch-deployment.yml` - Workflow that uses the script
- `WORKFLOW_INTERACTION.md` - Documentation on workflow comment system

## Verification
To verify the fix is working correctly:
1. Check workflow logs for "Comment body generated (marker at start: True)" messages
2. Verify PRs have only ONE deployment status comment per workflow run (not duplicates)
3. Verify the comment updates in-place as the workflow progresses
4. Check for any "CRITICAL ERROR" messages indicating marker placement issues
