# Proposed Workflow Modifications

**File**: `.github/workflows/branch-deployment.yml`
**Status**: ⏸️ AWAITING APPROVAL FROM @litlfred

## Changes Overview

Replace the current build step and add artifact generation steps.

## Current Code (Line ~238-252)

```yaml
      - name: Build branch-specific React app
        continue-on-error: false
        run: |
          echo "Building with PUBLIC_URL: ${{ steps.public_url.outputs.public_url }}"
          echo "Building with REACT_APP_GITHUB_REF_NAME: ${{ steps.branch_info.outputs.branch_name }}"
          
          # Build the React app
          npm run build
        env:
          CI: false
          ESLINT_NO_DEV_ERRORS: true
          GENERATE_SOURCEMAP: false
          PUBLIC_URL: ${{ steps.public_url.outputs.public_url }}
          GITHUB_REF_NAME: ${{ steps.branch_info.outputs.branch_name }}
          REACT_APP_GITHUB_REF_NAME: ${{ steps.branch_info.outputs.branch_name }}
```

## Proposed Code (Replaces Above)

```yaml
      - name: Build branch-specific React app with enhanced logging
        id: build_app
        continue-on-error: false
        run: |
          echo "🔧 Starting enhanced build with logging..."
          echo "📍 PUBLIC_URL: ${{ steps.public_url.outputs.public_url }}"
          echo "🌿 Branch: ${{ steps.branch_info.outputs.branch_name }}"
          
          # Use Python script for secure build execution with comprehensive logging
          python3 scripts/build_with_logging.py \
            --public-url "${{ steps.public_url.outputs.public_url }}" \
            --branch-name "${{ steps.branch_info.outputs.branch_name }}" \
            --artifacts-dir "artifacts"
        env:
          CI: false
          ESLINT_NO_DEV_ERRORS: true
          GENERATE_SOURCEMAP: false

      - name: Analyze build artifacts and generate bundle report
        id: analyze_bundle
        if: always()
        continue-on-error: true
        run: |
          echo "📊 Analyzing webpack bundle..."
          
          # Generate bundle analysis report
          python3 scripts/analyze_webpack_stats.py \
            --build-dir "build" \
            --output-file "artifacts/bundle-report.txt"
          
          # Display summary
          if [ -f "artifacts/bundle-report.txt" ]; then
            echo "✅ Bundle analysis complete"
            echo ""
            echo "=== Bundle Summary (First 25 lines) ==="
            head -25 artifacts/bundle-report.txt
            echo ""
            echo "📦 Full report available in workflow artifacts"
          else
            echo "⚠️ Bundle analysis report not generated"
          fi

      - name: Upload build logs and stats as artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: build-logs-${{ github.run_id }}-${{ github.run_attempt }}
          path: |
            artifacts/build-logs.txt
            artifacts/webpack-stats.json
            artifacts/bundle-report.txt
          retention-days: 90
          if-no-files-found: warn

      - name: Display build artifacts summary
        if: always()
        run: |
          echo ""
          echo "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "="
          echo "📊 Build Artifacts Summary"
          echo "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "="
          echo ""
          
          if [ -f "artifacts/build-logs.txt" ]; then
            log_lines=$(wc -l < artifacts/build-logs.txt)
            log_size=$(du -h artifacts/build-logs.txt | cut -f1)
            echo "📝 Build Log: $log_lines lines, $log_size"
          else
            echo "⚠️ Build log not found"
          fi
          
          if [ -f "artifacts/webpack-stats.json" ]; then
            stats_size=$(du -h artifacts/webpack-stats.json | cut -f1)
            echo "📊 Webpack Stats: $stats_size"
          else
            echo "⚠️ Webpack stats not found"
          fi
          
          if [ -f "artifacts/bundle-report.txt" ]; then
            report_lines=$(wc -l < artifacts/bundle-report.txt)
            report_size=$(du -h artifacts/bundle-report.txt | cut -f1)
            echo "📦 Bundle Report: $report_lines lines, $report_size"
            echo ""
            echo "Top 3 Largest Files:"
            grep -A 3 "Largest Files" artifacts/bundle-report.txt | tail -3 || echo "  (Not available)"
          else
            echo "⚠️ Bundle report not found"
          fi
          
          echo ""
          echo "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "="
          echo "🔗 Download artifacts from the Actions run page"
          echo "   Artifacts section → build-logs-${{ github.run_id }}-${{ github.run_attempt }}"
          echo "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "=" "="
          echo ""
```

## Insertion Point

Insert the new steps **after** line 238 (the current "Build branch-specific React app" step) and **before** line 254 ("Validate branch directory safety").

## Rationale for Changes

### Security Improvements
1. **Python Script**: Moves bash logic to Python with proper input validation
2. **Variable Sanitization**: All inputs validated against allowlist
3. **No Shell Injection**: subprocess.Popen with list arguments (not shell strings)
4. **Path Safety**: Validates paths stay within workspace

### Debugging Improvements  
1. **Timestamped Logs**: Every build line logged with timestamp
2. **Bundle Analysis**: Automatic size analysis and recommendations
3. **Persistent Artifacts**: 90-day retention for troubleshooting
4. **Summary Display**: Quick overview in workflow output

### Maintainability Improvements
1. **Python vs Bash**: More maintainable, testable, documented
2. **Separation of Concerns**: Build logic in scripts, not workflow
3. **Error Handling**: Better error messages and exit codes
4. **Reusability**: Scripts can be run locally or in CI

## Environment Variables

The Python script receives these from the workflow environment:
- `CI=false` (set in workflow)
- `ESLINT_NO_DEV_ERRORS=true` (set in workflow)
- `GENERATE_SOURCEMAP=false` (set in workflow)

And these from command-line arguments (safer):
- `PUBLIC_URL` (via --public-url flag)
- `GITHUB_REF_NAME` (via --branch-name flag)
- `REACT_APP_GITHUB_REF_NAME` (set by script from --branch-name)

## Backward Compatibility

✅ **Fully Compatible**: The Python script calls `npm run build` exactly as before, just with:
- Enhanced logging
- Input validation
- Artifact generation

❌ **No Breaking Changes**: Build output remains identical, deployable to gh-pages

## Testing Plan

1. **Local Testing**: Run scripts locally before committing
2. **PR Testing**: Test in this PR's workflow run
3. **Validation**: Verify artifacts are generated and downloadable
4. **Rollback**: If issues occur, revert workflow changes (scripts remain)

## Rollback Procedure

If any issues occur:

```bash
# Quick rollback - restore original workflow
git checkout HEAD~1 -- .github/workflows/branch-deployment.yml
git commit -m "Rollback: Restore original build workflow"
git push
```

The Python scripts remain and can be improved without workflow changes.

## Approval Needed

Before implementing these changes:
- [ ] @litlfred reviews proposed modifications
- [ ] Security approach confirmed
- [ ] Artifact retention period confirmed (90 days)
- [ ] Explicit permission granted to modify workflow

---

**Status**: Ready to implement upon approval
**Risk Level**: Medium (modifying critical workflow)
**Mitigation**: Tested scripts, detailed rollback plan, no breaking changes
