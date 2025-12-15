@echo off
REM Public/Docs Consolidation - Move developer docs to docs/

setlocal EnableDelayedExpansion

set BASE=%~dp0
set PUBLIC_DOCS=%BASE%public\docs
set DOCS=%BASE%docs

echo ================================================================================
echo SGEX WORKBENCH - PUBLIC/DOCS CONSOLIDATION
echo ================================================================================
echo.
echo This script will move developer-facing documentation from public/docs/ to docs/
echo.
echo Files to move: 28
echo - Architecture docs: 6 files
echo - Development docs: 8 files
echo - Deployment docs: 3 files
echo - Security docs: 2 files
echo - Feature docs: 7 files
echo - Historical docs: 5 files
echo.
echo Files will STAY in public/docs/: 18 (user-facing docs, MCP, workflows, schemas)
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo.
echo ================================================================================
echo PHASE 1: Moving Architecture Documentation
echo ================================================================================
echo.

set MOVED=0
set SKIPPED=0

REM Helper macro for moving files
set "MOVEFILE=call :MoveFile"

REM Architecture Documentation
echo [1/6] Architecture Documentation...
%MOVEFILE% "%PUBLIC_DOCS%\framework-developer-guide.md" "%DOCS%\04-development\framework-developer-guide.md"
%MOVEFILE% "%PUBLIC_DOCS%\fixed-height-layout-requirements.md" "%DOCS%\03-architecture\fixed-height-layout.md"
%MOVEFILE% "%PUBLIC_DOCS%\page-inventory.md" "%DOCS%\03-architecture\page-inventory.md"
%MOVEFILE% "%PUBLIC_DOCS%\UI_STYLING_REQUIREMENTS.md" "%DOCS%\03-architecture\ui-styling-requirements.md"
%MOVEFILE% "%PUBLIC_DOCS%\CSS_VARIABLES_REFERENCE.md" "%DOCS%\04-development\css-variables-reference.md"

echo.
echo ================================================================================
echo PHASE 2: Moving Feature Documentation
echo ================================================================================
echo.

echo [2/6] Feature Documentation...
%MOVEFILE% "%PUBLIC_DOCS%\asset-management.md" "%DOCS%\07-features\asset-management.md"
%MOVEFILE% "%PUBLIC_DOCS%\bookmark-system.md" "%DOCS%\07-features\bookmark-system.md"
%MOVEFILE% "%PUBLIC_DOCS%\bpmn-integration.md" "%DOCS%\07-features\bpmn-integration.md"
%MOVEFILE% "%PUBLIC_DOCS%\decision-table-editor.md" "%DOCS%\07-features\decision-table-editor.md"
%MOVEFILE% "%PUBLIC_DOCS%\profile-subscription-system.md" "%DOCS%\07-features\profile-subscription.md"
%MOVEFILE% "%PUBLIC_DOCS%\tutorial-framework.md" "%DOCS%\07-features\tutorial-framework.md"
%MOVEFILE% "%PUBLIC_DOCS%\custom-formats-documentation.md" "%DOCS%\07-features\custom-formats.md"

echo.
echo ================================================================================
echo PHASE 3: Moving Development Documentation
echo ================================================================================
echo.

echo [3/6] Development Documentation...
%MOVEFILE% "%PUBLIC_DOCS%\runtime-validation.md" "%DOCS%\04-development\runtime-validation.md"
%MOVEFILE% "%PUBLIC_DOCS%\runtime-validation-integration.md" "%DOCS%\04-development\runtime-validation-integration.md"
%MOVEFILE% "%PUBLIC_DOCS%\typescript-documentation-index.md" "%DOCS%\04-development\typescript-documentation-index.md"
%MOVEFILE% "%PUBLIC_DOCS%\schema-generation-configuration.md" "%DOCS%\04-development\schema-generation.md"

echo.
echo ================================================================================
echo PHASE 4: Moving Deployment Documentation
echo ================================================================================
echo.

echo [4/6] Deployment Documentation...
%MOVEFILE% "%PUBLIC_DOCS%\multi-branch-deployment-requirements.md" "%DOCS%\05-deployment\multi-branch-requirements.md"
%MOVEFILE% "%PUBLIC_DOCS%\branch-specific-pr-workflow.md" "%DOCS%\05-deployment\branch-pr-workflow.md"
%MOVEFILE% "%PUBLIC_DOCS%\build-process-integration.md" "%DOCS%\05-deployment\build-process-integration.md"

echo.
echo ================================================================================
echo PHASE 5: Moving Security Documentation
echo ================================================================================
echo.

echo [5/6] Security Documentation...
%MOVEFILE% "%PUBLIC_DOCS%\security-headers.md" "%DOCS%\06-security\security-headers.md"
%MOVEFILE% "%PUBLIC_DOCS%\WHO_CORS_WORKAROUND.md" "%DOCS%\06-security\who-cors-workaround.md"

echo.
echo ================================================================================
echo PHASE 6: Moving Historical Documentation
echo ================================================================================
echo.

echo [6/6] Historical Documentation...
%MOVEFILE% "%PUBLIC_DOCS%\dak-publication-api-implementation-summary.md" "%DOCS%\08-development-history\implementation-summaries\feature-implementations\dak-publication-api.md"
%MOVEFILE% "%PUBLIC_DOCS%\dak-publication-implementation-summary.md" "%DOCS%\08-development-history\implementation-summaries\feature-implementations\dak-publication.md"
%MOVEFILE% "%PUBLIC_DOCS%\dak-publication-options-analysis.md" "%DOCS%\08-development-history\technical-analysis\other-analysis\dak-publication-options.md"
%MOVEFILE% "%PUBLIC_DOCS%\dak-publication-technical-spec.md" "%DOCS%\08-development-history\technical-analysis\other-analysis\dak-publication-spec.md"
%MOVEFILE% "%PUBLIC_DOCS%\dak-publication-wysiwyg-analysis.md" "%DOCS%\08-development-history\technical-analysis\other-analysis\dak-publication-wysiwyg.md"

echo.
echo ================================================================================
echo CONSOLIDATION COMPLETE!
echo ================================================================================
echo.
echo Files moved successfully: %MOVED%
echo Files skipped (not found): %SKIPPED%
echo.
echo Remaining in public/docs/:
echo   ✓ Core documentation (project-plan, requirements, solution-architecture, etc.)
echo   ✓ MCP services documentation (mcp/)
echo   ✓ Workflow diagrams (workflows/)
echo   ✓ Runtime schemas (schemas/)
echo   ✓ Images (*.png)
echo   ✓ Static HTML (dak-faq-documentation.html)
echo.
echo Next steps:
echo 1. Update public/docs/README.md to reflect new structure
echo 2. Update links in moved documents
echo 3. Update docs/INDEX.md with new files
echo 4. Test all documentation links
echo 5. Commit changes to version control:
echo    git add -A
echo    git commit -m "docs: consolidate developer docs from public/docs to docs/"
echo    git push
echo.
echo Press any key to exit...
pause >nul
goto :EOF

:MoveFile
if exist "%~1" (
    move "%~1" "%~2" >nul 2>&1
    if errorlevel 1 (
        echo   ✗ FAILED: %~nx1
    ) else (
        echo   ✓ %~nx1 → %~nx2
        set /a MOVED+=1
    )
) else (
    echo   ⊘ SKIPPED: %~nx1 ^(not found^)
    set /a SKIPPED+=1
)
goto :EOF