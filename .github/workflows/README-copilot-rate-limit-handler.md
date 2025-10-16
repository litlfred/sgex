# Copilot Rate Limit Handler Workflow

## Overview

This GitHub Actions workflow automatically handles Copilot rate limit errors in PR comments. When Copilot encounters a rate limit, this workflow:

1. Detects the rate limit error in PR comments
2. Creates a status comment to notify users
3. Updates the status comment every 5 minutes with remaining wait time
4. Triggers Copilot to retry after the wait period completes

## How It Works

### Trigger
The workflow is triggered by `issue_comment` events (only on pull requests).

### Detection
The workflow scans incoming PR comments for common rate limit error patterns:
- "rate limit"
- "rate-limit"
- "too many requests"
- "retry after"
- "exceeded quota"
- "api rate limit exceeded"
- "429" (HTTP status code)
- "requests per"

### Wait Time Extraction
The workflow attempts to extract the wait time from the error message. It looks for patterns like:
- "retry after X minutes"
- "wait X hours"
- "X seconds"

If no specific time is found, it defaults to 60 minutes. The maximum wait time is capped at 360 minutes (6 hours) to stay within GitHub Actions job timeout limits.

### Status Updates
The workflow creates a managed PR comment (using `scripts/manage-pr-comment.py`) that:
- Shows initial notification with total wait time
- Updates every 5 minutes with remaining time (with message: "Yep, still here waiting. Will retry in X minutes.")
- Shows completion status when done

### Copilot Retry
After the wait period completes, the workflow posts a new comment:
```
@copilot review previous comments and try again.
```

This triggers Copilot to retry the previous request.

## Edge Cases Handled

### 6-Hour Timeout Warning
If the wait time is 6 hours or more, the workflow posts a warning comment:
```
⚠️ Warning: The wait time exceeds or is close to the GitHub Actions 6-hour 
timeout limit. If this workflow times out before completing, you may need to 
manually trigger Copilot with:

@copilot review previous comments and try again.

You can also wait for the rate limit to reset naturally and then post the 
command yourself.
```

### Error Handling
If the workflow encounters an error, it posts an error comment with:
- Link to workflow logs
- Instructions for manual intervention
- Copilot retry command for manual use

## Files Modified

### New Files
- `.github/workflows/copilot-rate-limit-handler.yml` - The main workflow file

### Modified Files
- `scripts/manage-pr-comment.py` - Added new stages:
  - `rate-limit-waiting` - For waiting status updates
  - `rate-limit-complete` - For completion notification

## Usage

This workflow runs automatically when Copilot posts rate limit errors. No manual intervention is required unless:

1. The workflow fails (check logs and retry manually)
2. The 6-hour timeout is exceeded (manually post the Copilot retry command)
3. You want to cancel the wait and retry manually

## Testing

To test this workflow:

1. Create a test PR
2. Trigger a Copilot rate limit error (by making many Copilot requests)
3. Observe the workflow creates a status comment
4. Wait for status updates every 5 minutes
5. Verify Copilot retry command is posted after wait completes

**Note**: Since rate limits are hard to trigger in testing, you may want to:
- Manually create a comment with rate limit keywords for testing detection
- Modify the workflow temporarily to use shorter wait times
- Test the comment update logic separately

## Permissions Required

The workflow requires these GitHub permissions:
- `contents: read` - To checkout the repository
- `pull-requests: write` - To post and update PR comments
- `issues: write` - To post comments (PRs are issues in GitHub API)

## Troubleshooting

### Workflow Not Triggering
- Verify the comment contains rate limit keywords
- Check workflow logs for detection output
- Ensure the workflow has correct permissions

### Comments Not Updating
- Verify `scripts/manage-pr-comment.py` is executable
- Check Python dependencies are installed (requests library)
- Review workflow logs for errors in comment posting

### Copilot Not Retrying
- Verify the retry command was posted correctly
- Check if Copilot is enabled for the repository
- Ensure the command format is exactly: `@copilot review previous comments and try again.`

## Future Improvements

Potential enhancements:
1. Support for different rate limit types (per hour, per day, etc.)
2. Configurable wait intervals and retry strategies
3. Integration with GitHub API rate limit headers for more accurate timing
4. Support for different Copilot error types beyond rate limits
5. Metrics tracking and reporting on rate limit occurrences
