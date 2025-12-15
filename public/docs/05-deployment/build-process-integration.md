# Build Process Integration Guide

## Overview

This guide provides comprehensive documentation for integrating TypeScript validation and schema generation into CI/CD pipelines, deployment workflows, and error handling strategies for the SGEX Workbench project.

## Table of Contents

1. [CI/CD Integration](#cicd-integration)
2. [Deployment Pipeline Integration](#deployment-pipeline-integration)  
3. [Error Handling and Recovery](#error-handling-and-recovery)
4. [GitHub Actions Workflows](#github-actions-workflows)
5. [Performance Monitoring](#performance-monitoring)
6. [Troubleshooting Guide](#troubleshooting-guide)

## CI/CD Integration

### GitHub Actions Workflow for TypeScript Migration

Update `.github/workflows/typescript-validation.yml`:

```yaml
name: TypeScript Validation and Schema Generation

on:
  push:
    branches: [ main, develop, 'feature/**', 'copilot/**' ]
    paths:
      - 'src/**/*.ts'
      - 'src/**/*.tsx'
      - 'src/**/*.js'
      - 'src/**/*.jsx'
      - 'package.json'
      - 'package-lock.json'
      - 'tsconfig.json'
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'src/**/*.ts'
      - 'src/**/*.tsx'
      - 'src/**/*.js'
      - 'src/**/*.jsx'

env:
  NODE_VERSION: '18'
  CACHE_KEY_PREFIX: 'sgex-typescript-v1'

jobs:
  typescript-validation:
    name: TypeScript Type Checking and Validation
    runs-on: ubuntu-latest
    timeout-minutes: 15
    
    outputs:
      schemas-changed: ${{ steps.schema-check.outputs.changed }}
      validation-report: ${{ steps.validation.outputs.report-path }}
    
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 2  # Need previous commit for diff checking
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install Dependencies
        run: |
          npm ci --legacy-peer-deps
          npm ls --depth=0  # Verify installation
      
      - name: Cache TypeScript Build
        uses: actions/cache@v3
        with:
          path: |
            .tsbuildinfo
            public/docs/schemas/
          key: ${{ env.CACHE_KEY_PREFIX }}-${{ hashFiles('src/**/*.ts', 'tsconfig.json') }}
          restore-keys: |
            ${{ env.CACHE_KEY_PREFIX }}-
      
      - name: TypeScript Type Checking
        id: type-check
        run: |
          echo "::group::TypeScript Type Checking"
          npm run type-check 2>&1 | tee typescript-errors.log
          echo "::endgroup::"
          
          # Check if type checking passed
          if [ ${PIPESTATUS[0]} -ne 0 ]; then
            echo "type-check-failed=true" >> $GITHUB_OUTPUT
            echo "::error::TypeScript type checking failed"
            exit 1
          else
            echo "type-check-failed=false" >> $GITHUB_OUTPUT
          fi
      
      - name: Generate JSON Schemas
        id: schema-generation
        run: |
          echo "::group::Schema Generation"
          
          # Create schemas directory if it doesn't exist
          mkdir -p public/docs/schemas
          
          # Store pre-generation state
          if [ -f "public/docs/schemas/combined-schemas.json" ]; then
            cp public/docs/schemas/combined-schemas.json schemas-before.json
          fi
          
          # Generate schemas with error handling
          npm run generate-schemas 2>&1 | tee schema-generation.log
          
          if [ ${PIPESTATUS[0]} -ne 0 ]; then
            echo "schema-generation-failed=true" >> $GITHUB_OUTPUT
            echo "::warning::Schema generation had issues, but continuing..."
          else
            echo "schema-generation-failed=false" >> $GITHUB_OUTPUT
          fi
          
          echo "::endgroup::"
      
      - name: Check Schema Changes
        id: schema-check
        run: |
          if [ -f "schemas-before.json" ] && [ -f "public/docs/schemas/combined-schemas.json" ]; then
            if ! cmp -s schemas-before.json public/docs/schemas/combined-schemas.json; then
              echo "changed=true" >> $GITHUB_OUTPUT
              echo "::notice::Schemas have been updated"
            else
              echo "changed=false" >> $GITHUB_OUTPUT
            fi
          else
            echo "changed=true" >> $GITHUB_OUTPUT
            echo "::notice::New schemas generated"
          fi
      
      - name: Validate Generated Schemas
        id: schema-validation
        if: success() || steps.schema-generation.outputs.schema-generation-failed == 'false'
        run: |
          echo "::group::Schema Validation"
          
          # Run schema validation script
          node scripts/validateGeneratedSchemas.js 2>&1 | tee schema-validation.log
          
          if [ ${PIPESTATUS[0]} -ne 0 ]; then
            echo "schema-validation-failed=true" >> $GITHUB_OUTPUT
            echo "::error::Schema validation failed"
            exit 1
          else
            echo "schema-validation-failed=false" >> $GITHUB_OUTPUT
          fi
          
          echo "::endgroup::"
      
      - name: Runtime Validation Testing
        id: runtime-validation
        run: |
          echo "::group::Runtime Validation Testing"
          
          # Test runtime validation service
          npm test -- --testPathPattern="runtimeValidation" --verbose 2>&1 | tee runtime-validation.log
          
          if [ ${PIPESTATUS[0]} -ne 0 ]; then
            echo "runtime-validation-failed=true" >> $GITHUB_OUTPUT
            echo "::error::Runtime validation tests failed"
            exit 1
          else
            echo "runtime-validation-failed=false" >> $GITHUB_OUTPUT
          fi
          
          echo "::endgroup::"
      
      - name: Generate Validation Report
        id: validation
        if: always()
        run: |
          # Create comprehensive validation report
          mkdir -p validation-reports
          
          cat > validation-reports/typescript-validation-report.md << 'EOF'
          # TypeScript Validation Report
          
          **Generated:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
          **Commit:** ${{ github.sha }}
          **Branch:** ${{ github.ref_name }}
          
          ## Summary
          
          | Check | Status | Details |
          |-------|--------|---------|
          | Type Checking | ${{ steps.type-check.outputs.type-check-failed == 'false' && '✅ Passed' || '❌ Failed' }} | TypeScript compilation |
          | Schema Generation | ${{ steps.schema-generation.outputs.schema-generation-failed == 'false' && '✅ Passed' || '⚠️ Issues' }} | JSON schema generation |
          | Schema Validation | ${{ steps.schema-validation.outputs.schema-validation-failed == 'false' && '✅ Passed' || '❌ Failed' }} | Generated schema validation |
          | Runtime Validation | ${{ steps.runtime-validation.outputs.runtime-validation-failed == 'false' && '✅ Passed' || '❌ Failed' }} | Runtime validation tests |
          
          ## Schema Changes
          
          ${{ steps.schema-check.outputs.changed == 'true' && 'Schemas were updated in this build' || 'No schema changes detected' }}
          
          ## Artifacts
          
          - TypeScript errors: [typescript-errors.log](typescript-errors.log)
          - Schema generation: [schema-generation.log](schema-generation.log)
          - Schema validation: [schema-validation.log](schema-validation.log)
          - Runtime validation: [runtime-validation.log](runtime-validation.log)
          EOF
          
          echo "report-path=validation-reports/typescript-validation-report.md" >> $GITHUB_OUTPUT
      
      - name: Upload Validation Artifacts
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: typescript-validation-${{ github.sha }}
          path: |
            *.log
            validation-reports/
            public/docs/schemas/
          retention-days: 30
      
      - name: Comment on PR
        if: github.event_name == 'pull_request' && steps.schema-check.outputs.changed == 'true'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const reportPath = '${{ steps.validation.outputs.report-path }}';
            const report = fs.readFileSync(reportPath, 'utf8');
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## TypeScript Migration Validation Report\n\n${report}\n\n*This comment was automatically generated by the TypeScript validation workflow.*`
            });

  integration-tests:
    name: Integration Tests with TypeScript
    runs-on: ubuntu-latest
    needs: typescript-validation
    if: success()
    
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm ci --legacy-peer-deps
      
      - name: Download Schema Artifacts
        uses: actions/download-artifact@v3
        with:
          name: typescript-validation-${{ github.sha }}
          path: ./artifacts
      
      - name: Integration Tests
        run: |
          # Copy generated schemas
          cp -r artifacts/public/docs/schemas/* public/docs/schemas/ 2>/dev/null || true
          
          # Run integration tests
          npm test -- --testPathPattern="integration" --verbose
      
      - name: Test JavaScript/TypeScript Interoperability
        run: |
          # Test that existing JavaScript code can import TypeScript modules
          node -e "
          const logger = require('./src/utils/logger.ts');
          const testLogger = logger.getLogger('InteropTest');
          testLogger.info('JavaScript can import TypeScript modules');
          console.log('✅ Interoperability test passed');
          "

  performance-monitoring:
    name: Performance Impact Assessment
    runs-on: ubuntu-latest
    needs: typescript-validation
    if: success()
    
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm ci --legacy-peer-deps
      
      - name: Measure Build Performance
        run: |
          echo "::group::Build Performance Measurement"
          
          # Measure TypeScript compilation time
          time npm run type-check
          
          # Measure schema generation time
          time npm run generate-schemas
          
          # Measure full build time
          time npm run build
          
          echo "::endgroup::"
      
      - name: Bundle Size Analysis
        run: |
          npm run build
          
          # Analyze bundle size
          du -sh build/static/js/*.js | sort -hr > bundle-analysis.txt
          cat bundle-analysis.txt
          
          # Check for significant size increases
          if [ -f "previous-bundle-size.txt" ]; then
            echo "::group::Bundle Size Comparison"
            diff previous-bundle-size.txt bundle-analysis.txt || echo "Bundle size changed"
            echo "::endgroup::"
          fi
          
          cp bundle-analysis.txt previous-bundle-size.txt
```

### Docker Integration

Create `Dockerfile.typescript`:

```dockerfile
# Multi-stage build for TypeScript validation and deployment
FROM node:18-alpine AS typescript-builder

# Install build dependencies
RUN apk add --no-cache git python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY .npmrc ./

# Install dependencies with legacy peer deps support
RUN npm ci --legacy-peer-deps --production=false

# Copy TypeScript configuration
COPY tsconfig.json ./
COPY .eslintrc.js ./

# Copy source code
COPY src/ ./src/
COPY public/ ./public/

# TypeScript validation and schema generation
RUN npm run type-check
RUN npm run generate-schemas
RUN npm run lint

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built application
COPY --from=typescript-builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/sgex/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## Deployment Pipeline Integration

### GitHub Pages Deployment with TypeScript

Update `.github/workflows/branch-deployment.yml`:

```yaml
name: Branch Deployment with TypeScript Support

on:
  push:
    branches: [ main, develop ]
  workflow_dispatch:
    inputs:
      deploy_target:
        description: 'Deployment target'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

jobs:
  typescript-build:
    name: TypeScript Build and Validation
    runs-on: ubuntu-latest
    
    outputs:
      build-artifact: ${{ steps.build.outputs.artifact-name }}
      schemas-hash: ${{ steps.schemas.outputs.hash }}
    
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm ci --legacy-peer-deps
      
      - name: Environment-Specific Configuration
        run: |
          if [ "${{ github.ref_name }}" = "main" ]; then
            echo "NODE_ENV=production" >> $GITHUB_ENV
            echo "DEPLOYMENT_TARGET=production" >> $GITHUB_ENV
          else
            echo "NODE_ENV=staging" >> $GITHUB_ENV
            echo "DEPLOYMENT_TARGET=staging" >> $GITHUB_ENV
          fi
      
      - name: TypeScript Compilation and Validation
        run: |
          # Pre-build validation
          npm run type-check
          npm run lint
          
          # Generate schemas for deployment
          npm run generate-schemas
          
          # Validate schemas before deployment
          node scripts/validateGeneratedSchemas.js
      
      - name: Generate Schema Hash
        id: schemas
        run: |
          SCHEMA_HASH=$(find public/docs/schemas -name "*.json" -exec sha256sum {} \; | sha256sum | cut -d' ' -f1)
          echo "hash=$SCHEMA_HASH" >> $GITHUB_OUTPUT
          echo "Generated schema hash: $SCHEMA_HASH"
      
      - name: Build Application
        id: build
        env:
          CI: true
          GENERATE_SOURCEMAP: false
        run: |
          # Build with TypeScript support
          npm run build
          
          # Verify build artifacts
          ls -la build/
          
          # Create deployment package
          ARTIFACT_NAME="sgex-build-${{ github.sha }}-${{ env.DEPLOYMENT_TARGET }}"
          tar -czf "$ARTIFACT_NAME.tar.gz" -C build .
          echo "artifact-name=$ARTIFACT_NAME" >> $GITHUB_OUTPUT
      
      - name: Upload Build Artifact
        uses: actions/upload-artifact@v3
        with:
          name: ${{ steps.build.outputs.artifact-name }}
          path: ${{ steps.build.outputs.artifact-name }}.tar.gz
          retention-days: 30
      
      - name: Generate Deployment Manifest
        run: |
          cat > deployment-manifest.json << EOF
          {
            "buildId": "${{ github.sha }}",
            "branch": "${{ github.ref_name }}",
            "environment": "${{ env.DEPLOYMENT_TARGET }}",
            "buildTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
            "typeScriptVersion": "$(npm list typescript --depth=0 --json | jq -r '.dependencies.typescript.version')",
            "nodeVersion": "${{ env.NODE_VERSION }}",
            "schemaHash": "${{ steps.schemas.outputs.hash }}",
            "buildArtifact": "${{ steps.build.outputs.artifact-name }}.tar.gz"
          }
          EOF
          
          cat deployment-manifest.json
      
      - name: Upload Deployment Manifest
        uses: actions/upload-artifact@v3
        with:
          name: deployment-manifest-${{ github.sha }}
          path: deployment-manifest.json

  deploy-to-github-pages:
    name: Deploy to GitHub Pages
    runs-on: ubuntu-latest
    needs: typescript-build
    if: github.ref == 'refs/heads/main'
    
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    
    permissions:
      contents: read
      pages: write
      id-token: write
    
    steps:
      - name: Download Build Artifact
        uses: actions/download-artifact@v3
        with:
          name: ${{ needs.typescript-build.outputs.build-artifact }}
      
      - name: Download Deployment Manifest
        uses: actions/download-artifact@v3
        with:
          name: deployment-manifest-${{ github.sha }}
      
      - name: Extract Build Artifact
        run: |
          mkdir -p build
          tar -xzf ${{ needs.typescript-build.outputs.build-artifact }}.tar.gz -C build
          
          # Add deployment metadata
          cp deployment-manifest.json build/
      
      - name: Setup GitHub Pages
        uses: actions/configure-pages@v3
      
      - name: Upload to GitHub Pages
        uses: actions/upload-pages-artifact@v2
        with:
          path: './build'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
      
      - name: Deployment Notification
        run: |
          echo "🚀 Deployment successful!"
          echo "URL: ${{ steps.deployment.outputs.page_url }}"
          echo "Schema Hash: ${{ needs.typescript-build.outputs.schemas-hash }}"

  post-deployment-validation:
    name: Post-Deployment Validation
    runs-on: ubuntu-latest
    needs: [typescript-build, deploy-to-github-pages]
    if: success()
    
    steps:
      - name: Validate Deployment
        run: |
          DEPLOYMENT_URL="${{ steps.deployment.outputs.page_url || 'https://litlfred.github.io/sgex/' }}"
          
          echo "Validating deployment at: $DEPLOYMENT_URL"
          
          # Check if the site is accessible
          HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL")
          
          if [ "$HTTP_STATUS" -eq 200 ]; then
            echo "✅ Deployment is accessible"
          else
            echo "❌ Deployment failed - HTTP status: $HTTP_STATUS"
            exit 1
          fi
          
          # Check if schemas are accessible
          SCHEMAS_URL="${DEPLOYMENT_URL}docs/schemas/combined-schemas.json"
          SCHEMA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SCHEMAS_URL")
          
          if [ "$SCHEMA_STATUS" -eq 200 ]; then
            echo "✅ Schemas are accessible"
          else
            echo "⚠️ Schemas not accessible - HTTP status: $SCHEMA_STATUS"
          fi
      
      - name: Performance Check
        run: |
          # Basic performance validation
          DEPLOYMENT_URL="${{ steps.deployment.outputs.page_url || 'https://litlfred.github.io/sgex/' }}"
          
          LOAD_TIME=$(curl -w "@curl-format.txt" -o /dev/null -s "$DEPLOYMENT_URL")
          echo "Page load time: $LOAD_TIME seconds"
          
          # Create curl format file for timing
          cat > curl-format.txt << 'EOF'
          %{time_total}
          EOF
```

## Error Handling and Recovery

### Build Error Recovery Script

Create `scripts/buildErrorRecovery.js`:

```javascript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BuildErrorRecovery {
  constructor() {
    this.errorHandlers = new Map();
    this.setupErrorHandlers();
  }

  setupErrorHandlers() {
    // TypeScript compilation errors
    this.errorHandlers.set('typescript', {
      patterns: [
        /TS\d+:/,
        /Type '.*' is not assignable to type/,
        /Property '.*' does not exist on type/
      ],
      handler: this.handleTypeScriptErrors.bind(this)
    });

    // Schema generation errors
    this.errorHandlers.set('schema', {
      patterns: [
        /typescript-json-schema/,
        /ts-json-schema-generator/,
        /Schema generation failed/
      ],
      handler: this.handleSchemaErrors.bind(this)
    });

    // Build process errors
    this.errorHandlers.set('build', {
      patterns: [
        /npm ERR!/,
        /Build failed/,
        /Module not found/
      ],
      handler: this.handleBuildErrors.bind(this)
    });

    // Dependency errors
    this.errorHandlers.set('dependencies', {
      patterns: [
        /ERESOLVE/,
        /peer dep missing/,
        /Cannot resolve dependency/
      ],
      handler: this.handleDependencyErrors.bind(this)
    });
  }

  async handleBuildFailure(errorLog, context = {}) {
    console.log('🔧 Analyzing build failure...');
    
    const errorAnalysis = this.analyzeError(errorLog);
    const recoveryPlan = this.createRecoveryPlan(errorAnalysis);
    
    console.log('📋 Recovery plan:');
    recoveryPlan.steps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });

    if (context.autoRecover) {
      return await this.executeRecoveryPlan(recoveryPlan);
    }

    return recoveryPlan;
  }

  analyzeError(errorLog) {
    const errors = [];
    const lines = errorLog.split('\n');

    for (const [errorType, config] of this.errorHandlers.entries()) {
      for (const line of lines) {
        for (const pattern of config.patterns) {
          if (pattern.test(line)) {
            errors.push({
              type: errorType,
              line: line.trim(),
              handler: config.handler
            });
          }
        }
      }
    }

    return {
      errors,
      severity: this.calculateSeverity(errors),
      isRecoverable: this.isRecoverable(errors)
    };
  }

  createRecoveryPlan(errorAnalysis) {
    const plan = {
      steps: [],
      estimatedTime: 0,
      successProbability: 0
    };

    // Group errors by type and create recovery steps
    const errorsByType = new Map();
    errorAnalysis.errors.forEach(error => {
      if (!errorsByType.has(error.type)) {
        errorsByType.set(error.type, []);
      }
      errorsByType.get(error.type).push(error);
    });

    // Generate recovery steps based on error types
    for (const [errorType, errors] of errorsByType.entries()) {
      const handler = errors[0].handler;
      const steps = handler(errors);
      plan.steps.push(...steps);
    }

    // Calculate success probability and estimated time
    plan.successProbability = this.calculateSuccessProbability(errorAnalysis);
    plan.estimatedTime = plan.steps.length * 2; // 2 minutes per step estimate

    return plan;
  }

  handleTypeScriptErrors(errors) {
    const steps = [];
    
    // Check for common TypeScript issues
    const hasTypeImportErrors = errors.some(e => e.line.includes('Module not found'));
    const hasTypeDefinitionErrors = errors.some(e => e.line.includes('does not exist on type'));
    
    if (hasTypeImportErrors) {
      steps.push('Install missing TypeScript type definitions');
      steps.push('Run: npm install --save-dev @types/node @types/react');
    }
    
    if (hasTypeDefinitionErrors) {
      steps.push('Update TypeScript configuration for stricter type checking');
      steps.push('Add missing type annotations to source files');
    }
    
    steps.push('Run type checking in isolation: npm run type-check');
    
    return steps;
  }

  handleSchemaErrors(errors) {
    const steps = [];
    
    steps.push('Clear schema generation cache');
    steps.push('Verify TypeScript types are properly exported');
    steps.push('Check for circular type references');
    steps.push('Regenerate schemas with fallback tools');
    
    return steps;
  }

  handleBuildErrors(errors) {
    const steps = [];
    
    const hasModuleErrors = errors.some(e => e.line.includes('Module not found'));
    const hasMemoryErrors = errors.some(e => e.line.includes('out of memory'));
    
    if (hasModuleErrors) {
      steps.push('Clear node_modules and package-lock.json');
      steps.push('Reinstall dependencies: npm ci --legacy-peer-deps');
    }
    
    if (hasMemoryErrors) {
      steps.push('Increase Node.js memory limit: export NODE_OPTIONS="--max-old-space-size=4096"');
    }
    
    steps.push('Clear build cache');
    steps.push('Retry build with verbose logging');
    
    return steps;
  }

  handleDependencyErrors(errors) {
    const steps = [];
    
    steps.push('Clear npm cache: npm cache clean --force');
    steps.push('Remove node_modules and package-lock.json');
    steps.push('Install with legacy peer deps: npm install --legacy-peer-deps');
    steps.push('Verify .npmrc configuration');
    
    return steps;
  }

  async executeRecoveryPlan(plan) {
    console.log('🚀 Executing recovery plan...');
    
    const results = [];
    
    for (const [index, step] of plan.steps.entries()) {
      console.log(`  Executing step ${index + 1}/${plan.steps.length}: ${step}`);
      
      try {
        const result = await this.executeRecoveryStep(step);
        results.push({ step, success: true, result });
        console.log(`  ✅ Step ${index + 1} completed`);
      } catch (error) {
        results.push({ step, success: false, error: error.message });
        console.log(`  ❌ Step ${index + 1} failed: ${error.message}`);
        
        // Decide whether to continue or abort
        if (this.isCriticalStep(step)) {
          console.log('  🛑 Critical step failed, aborting recovery');
          break;
        }
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const successRate = successCount / results.length;
    
    console.log(`🏁 Recovery completed: ${successCount}/${results.length} steps successful (${(successRate * 100).toFixed(1)}%)`);
    
    return {
      success: successRate > 0.7,
      results,
      successRate,
      recommendation: this.getRecoveryRecommendation(successRate)
    };
  }

  async executeRecoveryStep(step) {
    // Map recovery steps to actual commands
    const commandMap = {
      'Clear npm cache: npm cache clean --force': 'npm cache clean --force',
      'Remove node_modules and package-lock.json': 'rm -rf node_modules package-lock.json',
      'Install with legacy peer deps: npm install --legacy-peer-deps': 'npm install --legacy-peer-deps',
      'Run type checking in isolation: npm run type-check': 'npm run type-check',
      'Clear build cache': 'rm -rf build .tsbuildinfo',
      'Clear schema generation cache': 'rm -rf public/docs/schemas/generated-*.json'
    };

    const command = commandMap[step];
    
    if (command) {
      const result = execSync(command, { encoding: 'utf8', timeout: 300000 });
      return result;
    } else {
      // Manual step - return instructions
      return `Manual step required: ${step}`;
    }
  }

  calculateSeverity(errors) {
    if (errors.length === 0) return 'none';
    if (errors.some(e => e.type === 'typescript')) return 'high';
    if (errors.some(e => e.type === 'build')) return 'medium';
    return 'low';
  }

  isRecoverable(errors) {
    // Some errors are not automatically recoverable
    const unrecoverablePatterns = [
      /syntax error/i,
      /permission denied/i,
      /disk full/i
    ];

    return !errors.some(error => 
      unrecoverablePatterns.some(pattern => pattern.test(error.line))
    );
  }

  calculateSuccessProbability(errorAnalysis) {
    if (!errorAnalysis.isRecoverable) return 0;
    
    let probability = 0.8; // Base probability
    
    // Adjust based on error types
    if (errorAnalysis.errors.some(e => e.type === 'dependencies')) {
      probability *= 0.9; // Dependency errors are usually recoverable
    }
    
    if (errorAnalysis.errors.some(e => e.type === 'typescript')) {
      probability *= 0.7; // TypeScript errors may require manual fixes
    }
    
    // Adjust based on error count
    probability *= Math.max(0.3, 1 - (errorAnalysis.errors.length * 0.1));
    
    return Math.round(probability * 100) / 100;
  }

  isCriticalStep(step) {
    const criticalSteps = [
      'Install with legacy peer deps',
      'Run type checking in isolation'
    ];
    
    return criticalSteps.some(critical => step.includes(critical));
  }

  getRecoveryRecommendation(successRate) {
    if (successRate > 0.8) {
      return 'Recovery successful. Retry the original build process.';
    } else if (successRate > 0.5) {
      return 'Partial recovery achieved. Manual intervention may be required.';
    } else {
      return 'Recovery failed. Please review errors manually and seek assistance.';
    }
  }

  generateRecoveryReport(errorAnalysis, recoveryResult) {
    const report = {
      timestamp: new Date().toISOString(),
      analysis: errorAnalysis,
      recovery: recoveryResult,
      nextSteps: this.getNextSteps(errorAnalysis, recoveryResult)
    };

    fs.writeFileSync('build-error-recovery-report.json', JSON.stringify(report, null, 2));
    
    return report;
  }

  getNextSteps(errorAnalysis, recoveryResult) {
    const steps = [];
    
    if (recoveryResult && recoveryResult.success) {
      steps.push('Retry the original build command');
      steps.push('Monitor build logs for recurring issues');
    } else {
      steps.push('Review error log manually');
      steps.push('Check GitHub Issues for similar problems');
      steps.push('Consider updating dependencies');
      steps.push('Seek help from the development team');
    }
    
    return steps;
  }
}

// CLI interface
if (require.main === module) {
  const recovery = new BuildErrorRecovery();
  
  const errorLog = process.argv[2] || fs.readFileSync('build-error.log', 'utf8');
  const autoRecover = process.argv.includes('--auto-recover');
  
  recovery.handleBuildFailure(errorLog, { autoRecover })
    .then(result => {
      console.log('Recovery process completed');
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error('Recovery process failed:', error);
      process.exit(1);
    });
}

module.exports = BuildErrorRecovery;
```

## GitHub Actions Workflows

### Comprehensive TypeScript CI Workflow

Create `.github/workflows/comprehensive-typescript-ci.yml`:

```yaml
name: Comprehensive TypeScript CI

on:
  push:
    branches: [ main, develop, 'feature/**', 'copilot/**' ]
  pull_request:
    branches: [ main, develop ]
  schedule:
    # Run daily at 2 AM UTC to catch dependency issues
    - cron: '0 2 * * *'

env:
  NODE_VERSION: '18'
  CACHE_VERSION: 'v2'

jobs:
  # Job 1: Matrix testing across Node versions
  matrix-test:
    name: Test Node ${{ matrix.node-version }}
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16, 18, 20]
        include:
          - node-version: 18
            run-full-suite: true
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm ci --legacy-peer-deps
      
      - name: TypeScript Check
        run: npm run type-check
      
      - name: Run Tests
        run: npm test -- --ci --coverage --watchAll=false
      
      - name: Full Integration Suite
        if: matrix.run-full-suite
        run: |
          npm run generate-schemas
          npm run build
  
  # Job 2: Security and Dependency Audit
  security-audit:
    name: Security and Dependency Audit
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm ci --legacy-peer-deps
      
      - name: Audit Dependencies
        run: |
          npm audit --audit-level moderate
          npm outdated || true
      
      - name: Check for Vulnerable Dependencies
        run: |
          npx audit-ci --config .audit-ci.json
      
      - name: License Compliance Check
        run: |
          npx license-checker --summary --excludePrivatePackages

  # Job 3: Code Quality Analysis
  code-quality:
    name: Code Quality Analysis
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for SonarCloud
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm ci --legacy-peer-deps
      
      - name: Run ESLint
        run: |
          npm run lint -- --format=json --output-file=eslint-report.json
          npm run lint  # Also output to console
      
      - name: Run TypeScript Strict Check
        run: |
          # Temporarily enable strict mode for quality check
          sed -i 's/"strict": false/"strict": true/' tsconfig.json
          npm run type-check || echo "Strict mode check completed with warnings"
          git checkout tsconfig.json  # Restore original
      
      - name: Calculate Code Metrics
        run: |
          # Install additional tools for code analysis
          npm install -g complexity-report
          
          # Generate complexity report
          cr --format json --output complexity-report.json src/
      
      - name: Upload Quality Reports
        uses: actions/upload-artifact@v3
        with:
          name: code-quality-reports
          path: |
            eslint-report.json
            complexity-report.json

  # Job 4: Performance Benchmarking
  performance-benchmark:
    name: Performance Benchmarking
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm ci --legacy-peer-deps
      
      - name: Build Performance Test
        run: |
          echo "::group::TypeScript Compilation Performance"
          time npm run type-check
          echo "::endgroup::"
          
          echo "::group::Schema Generation Performance"
          time npm run generate-schemas
          echo "::endgroup::"
          
          echo "::group::Build Performance"
          time npm run build
          echo "::endgroup::"
      
      - name: Bundle Size Analysis
        run: |
          npm run build
          
          # Create bundle size report
          cat > bundle-size-report.md << 'EOF'
          # Bundle Size Report
          
          ## JavaScript Files
          EOF
          
          find build/static/js -name "*.js" -exec ls -lh {} \; | sort -k5 -hr >> bundle-size-report.md
          
          echo "" >> bundle-size-report.md
          echo "## CSS Files" >> bundle-size-report.md
          find build/static/css -name "*.css" -exec ls -lh {} \; | sort -k5 -hr >> bundle-size-report.md
      
      - name: Upload Performance Reports
        uses: actions/upload-artifact@v3
        with:
          name: performance-reports
          path: bundle-size-report.md

  # Job 5: Documentation Validation
  documentation-validation:
    name: Documentation Validation
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm ci --legacy-peer-deps
      
      - name: Validate TypeScript Documentation
        run: |
          # Check if TypeScript migration docs exist and are up to date
          test -f TYPESCRIPT_MIGRATION.md
          test -f public/docs/runtime-validation.md
          test -f public/docs/runtime-validation-integration.md
          test -f public/docs/custom-formats-documentation.md
          test -f public/docs/schema-generation-configuration.md
      
      - name: Generate API Documentation
        run: |
          # Generate TypeScript API documentation
          npx typedoc src/types/core.ts --out docs/api --theme default
      
      - name: Validate Schema Documentation
        run: |
          npm run generate-schemas
          
          # Check if schemas are properly documented
          node -e "
          const fs = require('fs');
          const schemas = JSON.parse(fs.readFileSync('public/docs/schemas/combined-schemas.json', 'utf8'));
          const undocumentedSchemas = Object.entries(schemas.definitions)
            .filter(([name, schema]) => !schema.description)
            .map(([name]) => name);
          
          if (undocumentedSchemas.length > 0) {
            console.log('⚠️  Undocumented schemas:', undocumentedSchemas);
          } else {
            console.log('✅ All schemas are documented');
          }
          "

# Summary job that requires all others to pass
all-checks-passed:
  name: All Checks Passed
  runs-on: ubuntu-latest
  needs: [matrix-test, security-audit, code-quality, performance-benchmark, documentation-validation]
  if: always()
  
  steps:
    - name: Check All Jobs Status
      run: |
        echo "Matrix Test: ${{ needs.matrix-test.result }}"
        echo "Security Audit: ${{ needs.security-audit.result }}"
        echo "Code Quality: ${{ needs.code-quality.result }}"
        echo "Performance: ${{ needs.performance-benchmark.result }}"
        echo "Documentation: ${{ needs.documentation-validation.result }}"
        
        if [[ "${{ needs.matrix-test.result }}" == "success" && 
              "${{ needs.security-audit.result }}" == "success" && 
              "${{ needs.code-quality.result }}" == "success" && 
              "${{ needs.performance-benchmark.result }}" == "success" && 
              "${{ needs.documentation-validation.result }}" == "success" ]]; then
          echo "✅ All checks passed!"
        else
          echo "❌ Some checks failed"
          exit 1
        fi
```

## Performance Monitoring

### Build Performance Monitoring Script

Create `scripts/buildPerformanceMonitor.js`:

```javascript
const fs = require('fs');
const path = require('path');

class BuildPerformanceMonitor {
  constructor() {
    this.metrics = {
      typescript: {},
      schemas: {},
      build: {},
      overall: {}
    };
    
    this.thresholds = {
      typeCheck: 60000,      // 1 minute
      schemaGeneration: 120000, // 2 minutes
      build: 300000,         // 5 minutes
      overall: 480000        // 8 minutes
    };
  }

  startMonitoring() {
    this.startTime = Date.now();
    console.log('🔍 Starting build performance monitoring...');
  }

  recordTypeCheckStart() {
    this.metrics.typescript.start = Date.now();
  }

  recordTypeCheckEnd() {
    this.metrics.typescript.end = Date.now();
    this.metrics.typescript.duration = this.metrics.typescript.end - this.metrics.typescript.start;
    
    this.checkThreshold('typeCheck', this.metrics.typescript.duration);
  }

  recordSchemaGenerationStart() {
    this.metrics.schemas.start = Date.now();
  }

  recordSchemaGenerationEnd() {
    this.metrics.schemas.end = Date.now();
    this.metrics.schemas.duration = this.metrics.schemas.end - this.metrics.schemas.start;
    
    this.checkThreshold('schemaGeneration', this.metrics.schemas.duration);
  }

  recordBuildStart() {
    this.metrics.build.start = Date.now();
  }

  recordBuildEnd() {
    this.metrics.build.end = Date.now();
    this.metrics.build.duration = this.metrics.build.end - this.metrics.build.start;
    
    this.checkThreshold('build', this.metrics.build.duration);
  }

  finishMonitoring() {
    this.endTime = Date.now();
    this.metrics.overall.duration = this.endTime - this.startTime;
    
    this.checkThreshold('overall', this.metrics.overall.duration);
    
    return this.generateReport();
  }

  checkThreshold(phase, duration) {
    const threshold = this.thresholds[phase];
    const isSlowBuild = duration > threshold;
    
    if (isSlowBuild) {
      console.warn(`⚠️  ${phase} took ${this.formatDuration(duration)} (threshold: ${this.formatDuration(threshold)})`);
    } else {
      console.log(`✅ ${phase} completed in ${this.formatDuration(duration)}`);
    }
    
    return { phase, duration, threshold, isSlowBuild };
  }

  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      thresholds: this.thresholds,
      summary: this.generateSummary(),
      recommendations: this.generateRecommendations()
    };

    // Save report
    const reportPath = 'build-performance-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Build Performance Report:');
    console.log(`Overall build time: ${this.formatDuration(this.metrics.overall.duration)}`);
    console.log(`TypeScript check: ${this.formatDuration(this.metrics.typescript.duration || 0)}`);
    console.log(`Schema generation: ${this.formatDuration(this.metrics.schemas.duration || 0)}`);
    console.log(`Build process: ${this.formatDuration(this.metrics.build.duration || 0)}`);
    console.log(`\nReport saved to: ${reportPath}`);
    
    return report;
  }

  generateSummary() {
    const phases = ['typescript', 'schemas', 'build'];
    const phaseDurations = phases.map(phase => this.metrics[phase].duration || 0);
    const totalPhaseTime = phaseDurations.reduce((sum, duration) => sum + duration, 0);
    
    return {
      totalTime: this.metrics.overall.duration,
      phasesTime: totalPhaseTime,
      overhead: this.metrics.overall.duration - totalPhaseTime,
      slowestPhase: this.findSlowestPhase(),
      performance: this.assessPerformance()
    };
  }

  findSlowestPhase() {
    const phases = ['typescript', 'schemas', 'build'];
    let slowest = { phase: null, duration: 0 };
    
    phases.forEach(phase => {
      const duration = this.metrics[phase].duration || 0;
      if (duration > slowest.duration) {
        slowest = { phase, duration };
      }
    });
    
    return slowest;
  }

  assessPerformance() {
    const overallDuration = this.metrics.overall.duration;
    const threshold = this.thresholds.overall;
    
    if (overallDuration < threshold * 0.5) return 'excellent';
    if (overallDuration < threshold * 0.75) return 'good';
    if (overallDuration < threshold) return 'acceptable';
    return 'poor';
  }

  generateRecommendations() {
    const recommendations = [];
    const summary = this.generateSummary();
    
    // TypeScript performance recommendations
    if (this.metrics.typescript.duration > this.thresholds.typeCheck) {
      recommendations.push('Consider enabling incremental TypeScript compilation');
      recommendations.push('Use project references for large codebases');
      recommendations.push('Exclude unnecessary files from TypeScript compilation');
    }
    
    // Schema generation recommendations
    if (this.metrics.schemas.duration > this.thresholds.schemaGeneration) {
      recommendations.push('Implement schema generation caching');
      recommendations.push('Consider generating schemas for changed types only');
      recommendations.push('Optimize type definitions to reduce complexity');
    }
    
    // Build process recommendations
    if (this.metrics.build.duration > this.thresholds.build) {
      recommendations.push('Enable build caching');
      recommendations.push('Optimize webpack configuration');
      recommendations.push('Consider using swc or esbuild for faster compilation');
    }
    
    // Overall performance recommendations
    if (summary.performance === 'poor') {
      recommendations.push('Consider parallelizing build steps');
      recommendations.push('Use build machines with better specifications');
      recommendations.push('Implement more aggressive caching strategies');
    }
    
    return recommendations;
  }

  // Historical performance tracking
  updateHistoricalData(report) {
    const historicalFile = 'build-performance-history.json';
    let history = [];
    
    if (fs.existsSync(historicalFile)) {
      history = JSON.parse(fs.readFileSync(historicalFile, 'utf8'));
    }
    
    history.push({
      timestamp: report.timestamp,
      overallDuration: report.metrics.overall.duration,
      performance: report.summary.performance
    });
    
    // Keep only last 50 builds
    if (history.length > 50) {
      history = history.slice(-50);
    }
    
    fs.writeFileSync(historicalFile, JSON.stringify(history, null, 2));
    
    return this.analyzePerformanceTrend(history);
  }

  analyzePerformanceTrend(history) {
    if (history.length < 5) return { trend: 'insufficient_data' };
    
    const recent = history.slice(-5);
    const older = history.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, r) => sum + r.overallDuration, 0) / recent.length;
    const olderAvg = older.reduce((sum, r) => sum + r.overallDuration, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    let trend;
    if (change > 10) trend = 'degrading';
    else if (change < -10) trend = 'improving';
    else trend = 'stable';
    
    return {
      trend,
      change: change.toFixed(1),
      recentAverage: this.formatDuration(recentAvg),
      olderAverage: this.formatDuration(olderAvg)
    };
  }
}

module.exports = BuildPerformanceMonitor;
```

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue 1: TypeScript Compilation Failures

**Symptoms:**
- `TS2307: Cannot find module` errors
- `TS2304: Cannot find name` errors
- Build fails during type checking

**Diagnosis:**
```bash
# Check TypeScript configuration
npm run type-check

# Verify installed type definitions
npm list @types/

# Check for conflicting TypeScript versions
npm list typescript
```

**Solutions:**
1. Install missing type definitions:
   ```bash
   npm install --save-dev @types/node @types/react @types/react-dom
   ```

2. Update TypeScript configuration:
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true,
       "allowSyntheticDefaultImports": true
     }
   }
   ```

3. Add module declaration for untyped libraries:
   ```typescript
   // src/types/global.d.ts
   declare module 'untyped-library' {
     const content: any;
     export default content;
   }
   ```

#### Issue 2: Schema Generation Failures

**Symptoms:**
- Empty or incomplete schema files
- Circular reference errors
- Tool crashes during generation

**Diagnosis:**
```bash
# Test schema generation tools individually
npx typescript-json-schema tsconfig.json "GitHubUser" --out test-schema.json
npx ts-json-schema-generator --path src/types/core.ts --type GitHubUser --out test-schema2.json

# Check for circular references
node scripts/checkCircularReferences.js
```

**Solutions:**
1. Break circular references:
   ```typescript
   // Instead of direct circular reference
   export interface User {
     repositories: Repository[];
   }
   
   export interface Repository {
     owner: User;
   }
   
   // Use optional references or separate types
   export interface User {
     repositories?: RepositoryReference[];
   }
   
   export interface RepositoryReference {
     id: number;
     name: string;
   }
   ```

2. Exclude problematic types:
   ```typescript
   /** @schema-exclude */
   export interface InternalType {
     // This won't be included in schema generation
   }
   ```

#### Issue 3: Build Performance Issues

**Symptoms:**
- Slow build times (>10 minutes)
- High memory usage
- CI timeouts

**Diagnosis:**
```bash
# Monitor build performance
node scripts/buildPerformanceMonitor.js

# Check memory usage
npm run build -- --verbose

# Analyze bundle size
npm run build && npx webpack-bundle-analyzer build/static/js/*.js
```

**Solutions:**
1. Enable incremental compilation:
   ```json
   {
     "compilerOptions": {
       "incremental": true,
       "tsBuildInfoFile": ".tsbuildinfo"
     }
   }
   ```

2. Optimize TypeScript configuration:
   ```json
   {
     "compilerOptions": {
       "skipLibCheck": true,
       "skipDefaultLibCheck": true
     },
     "exclude": [
       "node_modules",
       "build",
       "**/*.test.ts"
     ]
   }
   ```

3. Use build caching:
   ```yaml
   # In GitHub Actions
   - name: Cache TypeScript Build
     uses: actions/cache@v3
     with:
       path: |
         .tsbuildinfo
         node_modules/.cache
       key: ${{ runner.os }}-ts-${{ hashFiles('**/*.ts', 'tsconfig.json') }}
   ```

This comprehensive build process integration guide provides the foundation for successfully integrating TypeScript validation and schema generation into production CI/CD workflows while maintaining reliability and performance.