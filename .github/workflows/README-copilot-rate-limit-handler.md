# Copilot Rate Limit Handler Workflow

## Overview

This GitHub Actions workflow automatically handles Copilot rate limit errors in PRs by monitoring **timeline events**. When Copilot encounters a rate limit, this workflow:

1. Detects the rate limit error in PR timeline events (not just comments)
2. Creates a status comment to notify users
3. Updates the status comment every 5 minutes with remaining wait time
4. Triggers Copilot to retry after the wait period completes

## How It Works

### Trigger
The workflow uses a **hybrid trigger approach** for comprehensive coverage:

- **`schedule`**: Runs every 5 minutes to poll all open PRs for new rate limit events
- **`pull_request`**: Immediate response when a PR is synchronized, opened, reopened, or ready for review
- **`workflow_dispatch`**: Manual triggering for testing and debugging

This replaces the previous `issue_comment` trigger which only caught comment-based errors.

### Detection - Timeline Events vs Comments

**Key Change**: The workflow now monitors **timeline events** instead of just comments.

Timeline events are what appear in the GitHub UI under the "Timeline" tab of a PR. They include:
- Comments
- Commits
- Reviews
- **Copilot error events** ← This is the critical addition!

When Copilot hits a rate limit, GitHub creates a timeline event (not a comment) that looks like:
```html
<div id="event-20491893602" ...>
  <strong>Copilot</strong> stopped work on behalf of {user} due to an error
  ...
  Sorry, you've hit a rate limit...
</div>
```

The workflow uses the GitHub Timeline API (`issues.listEventsForTimeline`) to fetch these events:

```javascript
const { data: timeline } = await github.rest.issues.listEventsForTimeline({
  owner: context.repo.owner,
  repo: context.repo.repo,
  issue_number: pr.number,
  per_page: 50
});
```

### Event Filtering

The workflow filters timeline events to find Copilot rate limit errors:

1. **Recency Check**: Only processes events from the last 10 minutes to avoid reprocessing
2. **Copilot Check**: Identifies events where:
   - The actor is "copilot" or "github-actions[bot]"
   - The event content mentions "copilot"
3. **Rate Limit Check**: Scans event content for rate limit patterns:
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
- "retry again in X minutes" or "try again in X minutes"
- "wait X hours"
- "X seconds"

The improved regex patterns match GitHub's actual error message format:
```
"Please try again in 1 minute"
```

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

## Why Timeline Events vs Comments?

### The Problem with Comment-Based Detection
The previous implementation monitored only `issue_comment` events, which meant:
- ❌ It only triggered when a **comment** was created
- ❌ Copilot rate limit errors appear as **timeline events**, not comments
- ❌ The workflow would never detect actual Copilot rate limit errors

### The Solution with Timeline Events
The new implementation monitors timeline events, which means:
- ✅ Detects actual Copilot error events as they appear in the GitHub UI
- ✅ Polls regularly to catch events that don't trigger webhooks
- ✅ Immediate response via PR events for faster detection
- ✅ Avoids reprocessing by checking event timestamps

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
2. Copilot encounters a rate limit and creates a **timeline event** (not a comment) with: "Sorry, you've hit a rate limit... Please try again in 1 minute."
3. Within 5 minutes, the scheduled workflow polls and detects the rate limit event
4. The rate limit handler workflow automatically begins waiting

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

This workflow runs automatically in two ways:
1. **Schedule**: Polls every 5 minutes for rate limit events in all open PRs
2. **PR Events**: Checks immediately when PRs are updated

No manual intervention is required unless:

1. The workflow fails (check logs and retry manually)
2. The 6-hour timeout is exceeded (manually post the Copilot retry command)
3. You want to cancel the wait and retry manually

## Testing

To test this workflow:

1. **Manual Trigger**: Use the "Actions" tab → "Copilot Rate Limit Handler" → "Run workflow"
2. **Simulate Rate Limit**: The workflow will check all open PRs for Copilot rate limit events
3. **Observe Logs**: Check workflow logs to see PR scanning and event detection
4. **Wait for Schedule**: The workflow automatically runs every 5 minutes

**Note**: Since rate limits are hard to trigger in testing, the workflow includes comprehensive logging:
- Shows number of PRs being checked
- Displays timeline events being scanned
- Reports when rate limit events are found
- You can manually trigger via `workflow_dispatch` to test the detection logic

## Permissions Required

The workflow requires these GitHub permissions:
- `contents: read` - To checkout the repository
- `pull-requests: write` - To post and update PR comments
- `issues: write` - To post comments (PRs are issues in GitHub API)

## Troubleshooting

### Workflow Not Triggering
- **Schedule-based**: Workflow runs every 5 minutes automatically; check Actions tab for runs
- **PR-based**: Workflow triggers on PR synchronize/open/reopen/ready_for_review events
- Verify timeline events (not comments) contain rate limit keywords
- Check workflow logs for detection output
- Ensure the workflow has correct permissions

### Timeline Events Not Detected
- Verify rate limit errors appear as timeline events (check PR UI)
- Ensure events are less than 10 minutes old (recency filter)
- Check that event actor is "copilot" or contains copilot-related content
- Review workflow logs for event scanning details

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
6. Event deduplication using GitHub Actions cache or artifacts
7. Support for checking multiple pages of timeline events (currently limited to 50)

## Migration Notes (v2.0 - Timeline Events)

### What Changed
- **Trigger**: `issue_comment` → `schedule` + `pull_request` + `workflow_dispatch`
- **Detection**: Comments → Timeline events via GitHub API
- **Polling**: Added 5-minute scheduled polling for comprehensive coverage
- **Event Filtering**: Added recency check (10 minutes) and Copilot actor filtering

### Why This Change Was Necessary
The previous version only monitored `issue_comment` events. However, when Copilot encounters a rate limit, GitHub creates a **timeline event** (visible in the PR UI) rather than a regular comment. The old workflow would never detect these actual rate limit errors.

### Backward Compatibility
The new workflow maintains full backward compatibility:
- Comment management (`manage-pr-comment.py`) unchanged
- Same status update stages (`rate-limit-waiting`, `rate-limit-complete`)
- Same retry mechanism (`@copilot review previous comments and try again.`)
- Same timeout handling and error recovery

## Architecture Details

### PR Checking Strategy

The workflow uses an intelligent PR checking strategy based on trigger type:

**On `pull_request` events:**
```javascript
// Check only the specific PR that triggered the event
prsToCheck.push({
  number: context.payload.pull_request.number,
  html_url: context.payload.pull_request.html_url
});
```

**On `schedule` or `workflow_dispatch` events:**
```javascript
// Check all open PRs (up to 100)
const { data: openPRs } = await github.rest.pulls.list({
  owner: context.repo.owner,
  repo: context.repo.repo,
  state: 'open',
  per_page: 100
});
```

This dual approach ensures:
- **Fast response** when a specific PR is updated
- **Comprehensive coverage** via scheduled polling
- **Efficient API usage** by avoiding unnecessary checks

### Timeline Event Processing

For each PR, the workflow:
1. Fetches up to 50 recent timeline events
2. Filters events created in the last 10 minutes (recency check)
3. Identifies Copilot-related events by actor or content
4. Scans event content for rate limit error patterns
5. Extracts wait time from error messages
6. Stops at the first rate limit event found

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
