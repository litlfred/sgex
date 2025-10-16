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

## Example Workflow Execution

Here's an example of how the workflow handles a Copilot rate limit error:

### Scenario
1. User asks Copilot to review a PR
2. Copilot responds with: "Sorry, I've hit the rate limit. Please retry after 30 minutes."
3. The rate limit handler workflow automatically triggers

### Timeline

**T+0 minutes** - Initial Detection
```
⏳ Copilot Rate Limit Handler: Waiting 🟡

Copilot rate limit detected. Automatically waiting and will retry when ready.
Remaining time: 30 minutes

📋 Deployment Timeline
- 2025-10-16 18:30:00 UTC - 🟡 Waiting for rate limit - 30 minutes remaining
```

**T+5 minutes** - First Update
```
⏳ Copilot Rate Limit Handler: Waiting 🟡

Yep, still here waiting. Will retry in 25 minutes.
Remaining time: 25 minutes

📋 Deployment Timeline
- 2025-10-16 18:30:00 UTC - 🟢 Waiting for rate limit - 30 minutes remaining
- 2025-10-16 18:35:00 UTC - 🟡 Waiting for rate limit - 25 minutes remaining
```

**T+10 minutes** - Second Update
```
⏳ Copilot Rate Limit Handler: Waiting 🟡

Yep, still here waiting. Will retry in 20 minutes.
Remaining time: 20 minutes
```

... (continues every 5 minutes) ...

**T+30 minutes** - Complete
```
✅ Copilot Rate Limit Handler: Complete 🟢

Done waiting! Copilot retry command posted.

📋 Deployment Timeline
- 2025-10-16 18:30:00 UTC - 🟢 Waiting for rate limit - 30 minutes remaining
- 2025-10-16 18:35:00 UTC - 🟢 Waiting for rate limit - 25 minutes remaining
- ... (all previous updates) ...
- 2025-10-16 19:00:00 UTC - 🟢 Rate limit handler complete - Copilot retry triggered
```

Followed by a new comment:
```
@copilot review previous comments and try again.
```

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

## Architecture Details

### Workflow Stages

The workflow uses the `manage-pr-comment.py` script with two custom stages:

1. **`rate-limit-waiting`** - Used for initial notification and periodic updates
   - Shows remaining wait time
   - Updates every 5 minutes with countdown
   - Displays orange/yellow status indicator (🟡)

2. **`rate-limit-complete`** - Used when wait completes
   - Shows completion message
   - Indicates Copilot retry has been triggered
   - Displays green status indicator (🟢)

### Comment Management

The workflow creates a single managed comment that gets updated throughout the process:
- Uses action-specific marker: `copilot-rate-limit-{github.run_id}`
- Prevents duplicate comments for the same workflow run
- Maintains a timeline of all status updates
- Includes links to workflow logs for debugging

### Timing Strategy

The workflow implements a simple but effective timing strategy:

```bash
total_wait = wait_minutes * 60  # Convert to seconds
elapsed = 0
update_interval = 300  # 5 minutes

while elapsed < total_wait:
  remaining = total_wait - elapsed
  wait_time = min(remaining, update_interval)
  
  sleep(wait_time)
  elapsed += wait_time
  
  if elapsed < total_wait:
    update_status(remaining_minutes)
```

This ensures:
- Updates happen every 5 minutes
- Last update happens when wait completes
- No updates are skipped due to rounding errors
- Workflow stays within GitHub Actions timeout (6 hours)

### Error Recovery

The workflow includes several error recovery mechanisms:

1. **Detection Errors**: If rate limit detection fails, workflow simply doesn't trigger
2. **Update Errors**: If comment updates fail, workflow continues to retry
3. **Timeout Warning**: Posts warning if wait time exceeds 6 hours
4. **Failure Handler**: Catches all errors and posts helpful message with manual instructions

### Testing Strategy

The workflow includes a companion test script (`scripts/test-copilot-rate-limit-handler.py`) that validates:
- Rate limit error detection patterns
- Wait time extraction from various message formats
- Update interval calculations
- Edge cases (missing time, invalid formats, etc.)

Run tests with:
```bash
python3 scripts/test-copilot-rate-limit-handler.py
```

## Related Files

- **Workflow**: `.github/workflows/copilot-rate-limit-handler.yml`
- **Comment Manager**: `scripts/manage-pr-comment.py`
- **Tests**: `scripts/test-copilot-rate-limit-handler.py`
- **Documentation**: This file
