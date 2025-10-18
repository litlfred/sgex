# Copilot Rate Limit Handler - Quick Reference

## What It Does
Automatically handles Copilot rate limit errors in PR comments by:
1. 🔍 Detecting rate limit errors
2. ⏳ Waiting the required time
3. 🔄 Retrying Copilot automatically

## How to Use

### Normal Operation
**Nothing to do!** The workflow runs automatically when Copilot hits a rate limit.

### What You'll See

#### 1. Initial Notification
```
⏳ Copilot Rate Limit Handler: Waiting 🟡
Copilot rate limit detected. Waiting 30 minutes before retrying.
Remaining time: 30 minutes
```

#### 2. Periodic Updates (Every 5 Minutes)
```
⏳ Copilot Rate Limit Handler: Waiting 🟡
Yep, still here waiting. Will retry in 25 minutes.
Remaining time: 25 minutes
```

#### 3. Completion
```
✅ Copilot Rate Limit Handler: Complete 🟢
Done waiting! Copilot retry command posted.
```

Followed by:
```
@copilot review previous comments and try again.
```

## Supported Error Formats

The handler detects these patterns:
- "rate limit"
- "rate-limit"
- "too many requests"
- "retry after"
- "exceeded quota"
- "api rate limit exceeded"
- "429" (HTTP status)
- "requests per"

## Time Format Examples

✅ "Retry after 30 minutes" → Waits 30 minutes
✅ "Wait 2 hours" → Waits 2 hours (120 minutes)
✅ "90 seconds" → Waits 2 minutes (rounded up)
✅ No time specified → Waits 60 minutes (default)

## Maximum Wait Time

**6 hours (360 minutes)**

If wait time exceeds 6 hours, you'll get a warning:
```
⚠️ Warning: The wait time exceeds the GitHub Actions timeout limit.
If this workflow times out, manually trigger Copilot with:
@copilot review previous comments and try again.
```

## Manual Override

To manually trigger Copilot without waiting:
1. Cancel the workflow run (if in progress)
2. Post this comment: `@copilot review previous comments and try again.`

## Troubleshooting

### Workflow Not Triggering
- Check if comment contains rate limit keywords
- Verify workflow logs in GitHub Actions

### Updates Not Showing
- Refresh the PR page
- Check workflow logs for errors

### Copilot Not Retrying
- Verify the retry command was posted
- Check Copilot is enabled for your repository
- Manually post: `@copilot review previous comments and try again.`

## Files to Review

- **Workflow**: `.github/workflows/copilot-rate-limit-handler.yml`
- **Documentation**: `.github/workflows/README-copilot-rate-limit-handler.md`
- **Implementation**: `COPILOT_RATE_LIMIT_IMPLEMENTATION.md`

## Testing

Run tests locally:
```bash
python3 scripts/test-copilot-rate-limit-handler.py
```

Expected output:
```
✅ All tests passed!
```

## Need Help?

1. Check [workflow logs](../../actions/workflows/copilot-rate-limit-handler.yml)
2. Review [full documentation](.github/workflows/README-copilot-rate-limit-handler.md)
3. Contact repository maintainers

---

**Status**: ✅ Active and Monitoring
**Version**: 1.0.0
**Last Updated**: October 16, 2025
