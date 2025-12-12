# SGEX Routing Migration and Testing Plan

## Overview

This document outlines the step-by-step migration plan for implementing the enhanced SGEX routing solution. It provides detailed testing procedures, rollback strategies, and deployment guidelines to ensure a smooth transition with minimal user impact.

## Migration Strategy

### Phase 1: Foundation Setup (Week 1)

#### Day 1-2: Configuration Enhancement
**Objective**: Replace hardcoded configurations with dynamic detection

**Tasks**:
1. **Backup Current System**
   ```bash
   # Create backup branches
   git checkout -b routing-backup-v1
   git push origin routing-backup-v1
   
   # Backup critical files
   cp public/404.html public/404-legacy.html
   cp public/routeConfig.js public/routeConfig-legacy.js
   ```

2. **Deploy Enhanced routeConfig.js**
   - Implement dynamic deployment detection
   - Add component discovery mechanisms
   - Add context preservation functions
   - Maintain backward compatibility

3. **Testing**
   ```bash
   # Test configuration loading
   npm test -- --testPathPattern=routeConfig
   
   # Test deployment detection
   npm run test:deployment-detection
   ```

#### Day 3-4: 404.html Simplification
**Objective**: Replace complex 404.html with simple, reliable version

**Tasks**:
1. **Implement New 404.html**
   - Simple pattern matching logic
   - Comprehensive error handling
   - Redirect loop prevention
   - Context extraction and storage

2. **A/B Testing Setup**
   ```html
   <!-- Feature flag for testing -->
   <script>
     var useEnhancedRouting = sessionStorage.getItem('sgex:enhanced-routing') === 'true';
     if (useEnhancedRouting) {
       // Load new routing logic
     } else {
       // Load legacy routing logic  
     }
   </script>
   ```

3. **Testing**
   ```bash
   # Test 404 routing scenarios
   npm run test:404-routing
   
   # Test redirect loop prevention
   npm run test:redirect-loops
   ```

#### Day 5: React App Foundation
**Objective**: Prepare React app for enhanced routing

**Tasks**:
1. **Update App.js**
   - Add context restoration logic
   - Enhanced route generation
   - Error boundary improvements

2. **Update useDAKUrlParams Hook**
   - Add context restoration support
   - Improve error handling
   - Add fallback mechanisms

3. **Testing**
   ```bash
   # Test context restoration
   npm test -- --testPathPattern=useDAKUrlParams
   
   # Test app initialization
   npm test -- --testPathPattern=App
   ```

### Phase 2: Core Implementation (Week 2)

#### Day 6-7: URL Context System
**Objective**: Implement comprehensive URL context preservation

**Tasks**:
1. **Context Extraction Functions**
   ```javascript
   // Add to utils/routingUtils.js
   export function extractUrlContext(pathSegments, search, hash, basePath) {
     // Implementation from technical guide
   }
   
   export function storeUrlContext(context) {
     // Implementation from technical guide
   }
   
   export function restoreUrlContext() {
     // Implementation from technical guide
   }
   ```

2. **Session Storage Management**
   - Implement namespaced storage keys
   - Add cleanup mechanisms
   - Preserve backward compatibility

3. **Testing**
   ```bash
   # Test context extraction
   npm test -- --testPathPattern=routingUtils
   
   # Test session storage integration
   npm test -- --testPathPattern=contextStorage
   ```

#### Day 8-9: Component Integration
**Objective**: Update components to support direct URL entry

**Tasks**:
1. **Update DAK Components**
   - Add context restoration in DAKDashboard
   - Update other DAK components
   - Preserve URL fragments and query parameters

2. **Update Navigation Components**
   - Ensure navigation preserves context
   - Update link generation
   - Handle fallback scenarios

3. **Testing**
   ```bash
   # Test component context handling
   npm test -- --testPathPattern=DAKDashboard
   
   # Test navigation preservation
   npm test -- --testPathPattern=navigation
   ```

#### Day 10: Integration Testing
**Objective**: Test complete routing workflow

**Tasks**:
1. **End-to-End Testing**
   ```javascript
   // cypress/integration/routing.spec.js
   describe('Enhanced Routing', () => {
     it('handles direct URL entry with context preservation', () => {
       cy.visit('/sgex/main/dashboard/litlfred/smart-ips#components?debug=true');
       cy.url().should('include', '#components');
       cy.url().should('include', 'debug=true');
       // Verify component loads with correct context
     });
   });
   ```

2. **Cross-Browser Testing**
   - Test on Chrome, Firefox, Safari, Edge
   - Test on mobile browsers
   - Test on older browser versions

### Phase 3: Deployment Scenarios (Week 3)

#### Day 11-12: GitHub Pages Testing
**Objective**: Test all GitHub Pages deployment scenarios

**Tasks**:
1. **Landing Page Testing**
   ```bash
   # Deploy to GitHub Pages deploy branch
   git checkout deploy
   git merge routing-enhanced
   git push origin deploy
   
   # Test landing page routing
   curl -I https://litlfred.github.io/sgex/
   curl -I https://litlfred.github.io/sgex/docs
   ```

2. **Main Branch Testing**
   ```bash
   # Deploy to main branch
   git checkout main
   git merge routing-enhanced
   git push origin main
   
   # Test main deployment routing
   curl -I https://litlfred.github.io/sgex/main/
   curl -I https://litlfred.github.io/sgex/main/dashboard/litlfred/smart-ips
   ```

3. **Feature Branch Testing**
   ```bash
   # Test feature branch deployment
   git checkout -b test-routing-feature
   git push origin test-routing-feature
   
   # Test feature branch routing (if deployed)
   curl -I https://litlfred.github.io/sgex/test-routing-feature/
   ```

#### Day 13-14: Fallback Testing
**Objective**: Test fallback mechanisms and error handling

**Tasks**:
1. **Branch Not Deployed Testing**
   ```javascript
   // Test accessing non-existent branch deployment
   testUrl('https://litlfred.github.io/sgex/non-existent-branch/dashboard/user/repo');
   // Should fallback to main deployment
   ```

2. **Component Not Found Testing**
   ```javascript
   // Test accessing invalid component
   testUrl('https://litlfred.github.io/sgex/main/invalid-component/user/repo');
   // Should fallback to dashboard or show error
   ```

3. **Repository Access Testing**
   ```javascript
   // Test accessing private/non-existent repository
   testUrl('https://litlfred.github.io/sgex/main/dashboard/invalid/repository');
   // Should show appropriate error message
   ```

#### Day 15: Performance and Monitoring
**Objective**: Verify performance and set up monitoring

**Tasks**:
1. **Performance Testing**
   ```bash
   # Test routing performance
   lighthouse https://litlfred.github.io/sgex/main/dashboard/litlfred/smart-ips
   
   # Test redirect chain length
   curl -v https://litlfred.github.io/sgex/main/dashboard/litlfred/smart-ips 2>&1 | grep "< Location"
   ```

2. **Monitoring Setup**
   ```javascript
   // Add performance monitoring
   window.performance.mark('routing-start');
   // ... routing logic ...
   window.performance.mark('routing-end');
   window.performance.measure('routing-duration', 'routing-start', 'routing-end');
   ```

## Testing Procedures

### Automated Testing

#### 1. Unit Tests
```bash
# Test individual routing functions
npm test src/utils/routingUtils.test.js
npm test src/hooks/useDAKUrlParams.test.js
npm test src/services/routingService.test.js

# Test 404.html logic (using jsdom)
npm test scripts/test-404-routing.js
```

#### 2. Integration Tests
```bash
# Test React Router integration
npm test src/tests/routing/routingIntegration.test.js

# Test component context restoration
npm test src/tests/routing/contextRestoration.test.js

# Test navigation preservation
npm test src/tests/routing/navigationPreservation.test.js
```

#### 3. End-to-End Tests
```bash
# Cypress tests for full user journeys
npm run cypress:run --spec "cypress/integration/routing/**"

# Test direct URL entry scenarios
npm run test:e2e:direct-urls

# Test bookmark functionality
npm run test:e2e:bookmarks
```

### Manual Testing Checklist

#### Direct URL Entry Testing
- [ ] **GitHub Pages Landing**: `https://litlfred.github.io/sgex/`
- [ ] **GitHub Pages Docs**: `https://litlfred.github.io/sgex/docs`
- [ ] **GitHub Pages Main Dashboard**: `https://litlfred.github.io/sgex/main/dashboard/litlfred/smart-ips`
- [ ] **GitHub Pages Feature Branch**: `https://litlfred.github.io/sgex/feature-branch/dashboard/user/repo`
- [ ] **Standalone Dashboard**: `http://localhost:3000/dashboard/litlfred/smart-ips`

#### URL Fragment Preservation Testing
- [ ] **Hash Fragments**: URLs with `#components`, `#publishing`, `#dak-faq`
- [ ] **Query Parameters**: URLs with `?debug=true`, `?theme=dark`
- [ ] **Combined**: URLs with both fragments and query parameters

#### Context Preservation Testing
- [ ] **Session Storage**: Verify `sgex_selected_user`, `sgex_selected_repo`, `sgex_selected_branch`
- [ ] **Navigation**: Verify context preserved during component navigation
- [ ] **Refresh**: Verify context preserved after page refresh

#### Error Scenario Testing
- [ ] **Invalid URLs**: Test malformed URLs
- [ ] **Non-existent Repositories**: Test 404 repository access
- [ ] **Private Repositories**: Test unauthorized access
- [ ] **Invalid Branches**: Test non-existent branch access
- [ ] **Redirect Loops**: Test potential infinite redirect scenarios

#### Browser Compatibility Testing
- [ ] **Chrome**: Latest version
- [ ] **Firefox**: Latest version
- [ ] **Safari**: Latest version
- [ ] **Edge**: Latest version
- [ ] **Mobile Chrome**: iOS and Android
- [ ] **Mobile Safari**: iOS

### Performance Testing

#### Routing Performance Metrics
```javascript
// Add to application
function measureRoutingPerformance() {
  const metrics = {
    redirectTime: performance.getEntriesByType('navigation')[0].redirectEnd - performance.getEntriesByType('navigation')[0].redirectStart,
    domContentLoaded: performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd,
    routingResolution: performance.getEntriesByName('routing-duration')[0]?.duration
  };
  
  console.log('Routing Performance:', metrics);
  
  // Send to monitoring service
  if (window.gtag) {
    gtag('event', 'routing_performance', {
      redirect_time: metrics.redirectTime,
      dom_loaded: metrics.domContentLoaded,
      routing_duration: metrics.routingResolution
    });
  }
}
```

#### Performance Targets
- **Routing Resolution**: < 200ms
- **Page Load Time**: Not increased from baseline
- **Redirect Chain**: Maximum 2 redirects
- **Context Restoration**: < 50ms

## Rollback Procedures

### Emergency Rollback (< 5 minutes)

#### Step 1: Revert 404.html
```bash
# Quickly revert to legacy 404.html
git checkout main
cp public/404-legacy.html public/404.html
git add public/404.html
git commit -m "Emergency rollback: Revert to legacy 404.html"
git push origin main
```

#### Step 2: Disable Enhanced Routing
```javascript
// Add to routeConfig.js
window.SGEX_ENHANCED_ROUTING_DISABLED = true;

// Update 404.html to check flag
if (window.SGEX_ENHANCED_ROUTING_DISABLED) {
  // Use legacy routing logic
  loadLegacyRouting();
} else {
  // Use enhanced routing logic
  loadEnhancedRouting();
}
```

### Gradual Rollback (1-24 hours)

#### Step 1: Feature Flag Rollback
```javascript
// Gradually disable for user percentage
const rollbackPercentage = 50; // Start with 50%
const userHash = hashCode(sessionStorage.getItem('sgex_user_id') || 'anonymous');
const shouldUseEnhanced = (userHash % 100) >= rollbackPercentage;
```

#### Step 2: Component-by-Component Rollback
```javascript
// Rollback specific components
const disabledComponents = ['dashboard', 'docs']; // Add components as needed
if (disabledComponents.includes(componentName)) {
  return useLegacyRouting(componentName);
}
```

#### Step 3: Full System Rollback
```bash
# Revert entire routing enhancement
git revert <commit-hash-range>
git push origin main

# Update deployment
npm run build
npm run deploy
```

## Monitoring and Alerting

### Key Metrics to Monitor

#### Error Metrics
- **404 Error Rate**: Should not increase
- **Redirect Loop Errors**: Should be zero
- **Context Restoration Failures**: < 1%
- **JavaScript Errors**: Monitor routing-related errors

#### Performance Metrics
- **Page Load Time**: Monitor for regressions
- **Routing Resolution Time**: Target < 200ms
- **Time to Interactive**: Should not regress

#### User Experience Metrics
- **Direct URL Success Rate**: Target > 99%
- **Bookmark Success Rate**: Target > 99%
- **Navigation Success Rate**: Target > 99%

### Alerting Setup

#### Critical Alerts (Immediate Response)
```javascript
// Error rate > 5%
if (errorRate > 0.05) {
  sendAlert('CRITICAL: Routing error rate exceeded 5%');
}

// Redirect loops detected
if (redirectLoopCount > 0) {
  sendAlert('CRITICAL: Redirect loops detected');
}

// Page load time > 5 seconds
if (pageLoadTime > 5000) {
  sendAlert('CRITICAL: Page load time exceeded 5 seconds');
}
```

#### Warning Alerts (Response within 1 hour)
```javascript
// Context restoration failure rate > 1%
if (contextFailureRate > 0.01) {
  sendAlert('WARNING: Context restoration failure rate exceeded 1%');
}

// Performance regression > 20%
if (performanceRegression > 0.20) {
  sendAlert('WARNING: Performance regression exceeded 20%');
}
```

## Success Criteria

### Functional Requirements
- ✅ **100% Direct URL Success**: All direct URL entries work correctly
- ✅ **URL Fragment Preservation**: Hash fragments preserved during routing
- ✅ **Query Parameter Preservation**: Query parameters preserved during routing
- ✅ **Context Restoration**: User/repo/branch context correctly extracted and stored
- ✅ **Zero Redirect Loops**: No infinite redirect scenarios
- ✅ **Dynamic Configuration**: No hardcoded branch or component names

### Performance Requirements
- ⏱️ **Routing Resolution < 200ms**: Fast routing decisions
- ⏱️ **No Performance Regression**: Page load times maintained
- ⏱️ **Minimal Redirects**: Maximum 2 redirects per URL resolution

### Quality Requirements
- 🧪 **100% Test Coverage**: All routing logic covered by tests
- 🐛 **Zero Critical Bugs**: No critical routing issues
- 📊 **Comprehensive Monitoring**: All key metrics monitored
- 🔄 **Graceful Fallbacks**: Robust error handling and fallbacks

### User Experience Requirements
- 🔖 **Bookmark Compatibility**: All bookmarks continue to work
- 🔗 **Share Link Reliability**: Shared links work consistently
- 🧭 **Navigation Consistency**: Consistent navigation experience
- 📱 **Mobile Compatibility**: Works across all supported devices

## Post-Migration Activities

### Week 1 Post-Migration
1. **Intensive Monitoring**
   - Monitor all metrics every hour
   - Review error logs daily
   - Check user feedback channels

2. **Performance Optimization**
   - Optimize based on real-world performance data
   - Fine-tune caching strategies
   - Optimize redirect chains

### Week 2-4 Post-Migration
1. **Feature Enhancement**
   - Add advanced routing features based on user feedback
   - Optimize configuration loading
   - Enhance error messages

2. **Documentation Updates**
   - Update user documentation
   - Create troubleshooting guides
   - Update deployment documentation

### Month 2-3 Post-Migration
1. **Legacy Cleanup**
   - Remove legacy routing code
   - Clean up backward compatibility layers
   - Optimize codebase

2. **Advanced Features**
   - Add routing analytics
   - Implement advanced fallback strategies
   - Add deployment health checks

This comprehensive migration and testing plan ensures a smooth transition to the enhanced routing system while maintaining system reliability and user experience.