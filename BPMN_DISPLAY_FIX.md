# BPMN Diagram Display Fix

## Issue Description

When viewing BPMN diagrams in the SGeX Workbench, the BPMN viewer/editor would sometimes fail to display correctly on initial load. The viewport matrix could remain all zeros (`matrix(0 0 0 0 0 0)`), causing the diagram to be invisible even though the BPMN XML was successfully imported. This occurred because `setTimeout(..., 0)` or `setTimeout(..., 50)` didn't guarantee that the browser had painted the container with computed dimensions before attempting viewport operations.

## Root Cause Analysis

### Technical Details

The issue was caused by a timing problem in how viewport fitting operations were sequenced:

1. **Initial Load**: The BPMN XML is successfully imported via `viewerRef.current.importXML(bpmnXml)`
2. **Zoom Operation**: The canvas is fitted to viewport using `canvas.zoom('fit-viewport')`
3. **Timing Gap**: `setTimeout` doesn't guarantee the browser has painted the container and computed dimensions
4. **Zero Dimensions**: When zoom is called with `container.offsetWidth: 0` and `container.offsetHeight: 0`, the viewport matrix becomes all zeros
5. **Invisible Diagram**: The viewport transform `matrix(0 0 0 0 0 0)` causes the diagram to be invisible

### Why setTimeout Wasn't Reliable

`setTimeout(..., 0)` or even `setTimeout(..., 50)` schedules a callback to run after a minimum delay, but:
- Does NOT guarantee the browser has completed layout and paint cycles
- Does NOT ensure container dimensions are computed and available
- Does NOT provide any feedback about when rendering is actually complete

## Solution Implemented

### Fix Strategy Using requestAnimationFrame

The fix uses **nested `requestAnimationFrame` calls** instead of `setTimeout` to ensure proper timing:

1. **First RAF**: Ensures browser has completed layout pass and container is painted
2. **Dimension Validation**: Checks that container has non-zero dimensions
3. **Waiting Mechanism**: If dimensions are still zero, polls using RAF until they're available (up to 50 cycles ≈ 833ms at 60fps)
4. **Second RAF**: Ensures any dynamic content within the container is ready
5. **Execute Zoom**: Only then performs the viewport fit operation
6. **Diagnostic Logging**: Comprehensive logging of viewport transform state before and after zoom
7. **Failure Detection**: Checks for `matrix(0 0 0 0 0 0)` transform and attempts recovery

### Code Changes

#### BPMNViewer.js
```javascript
// Helper function to check if container has valid dimensions
const hasValidDimensions = (container) => {
  if (!container) return false;
  const rect = container.getBoundingClientRect();
  const width = rect.width || container.offsetWidth;
  const height = rect.height || container.offsetHeight;
  
  // Comprehensive diagnostic logging
  const computed = window.getComputedStyle(container);
  console.log('[BPMN Viewer] Container dimensions check:', {
    offsetWidth: container.offsetWidth,
    offsetHeight: container.offsetHeight,
    clientWidth: container.clientWidth,
    clientHeight: container.clientHeight,
    'boundingRect.width': rect.width,
    'boundingRect.height': rect.height,
    'computedStyle.width': computed.width,
    'computedStyle.height': computed.height,
    hasValidDimensions: width > 0 && height > 0
  });
  
  return width > 0 && height > 0;
};

// Use nested requestAnimationFrame to ensure browser has painted
requestAnimationFrame(() => {
  console.log('[BPMN Viewer] First RAF callback: layout should be painted');
  
  if (!hasValidDimensions(container)) {
    // Wait for valid dimensions using RAF polling
    waitForValidDimensions(container, () => {
      requestAnimationFrame(executeViewportFit);
    });
  } else {
    // Second RAF to ensure dynamic content is ready
    requestAnimationFrame(() => {
      executeViewportFit();
    });
  }
});
```

#### BPMNViewerEnhanced.js
Same pattern applied after diagram bounds calculation and viewbox setting.

#### BPMNPreview.js
Enhanced with RAF-based timing, dimension validation, and transform monitoring.

## Testing Recommendations

To verify this fix works correctly:

1. **Open a BPMN diagram**: Navigate to any business process in the viewer
2. **Observe initial load**: The diagram should appear immediately without any mouse interaction
3. **Check browser console**: Review the diagnostic logs showing:
   - Container dimensions (should be non-zero)
   - RAF callback execution sequence
   - Viewport transform before and after zoom (should NOT be all zeros)
4. **Test multiple diagrams**: Try different BPMN files to ensure consistency
5. **Test in different browsers**: Chrome, Firefox, Safari, Edge
6. **Test on different screen sizes**: Desktop, tablet, mobile viewports
7. **Test with demo files**: Verify demo BPMN generation also displays correctly
8. **Test with real GitHub files**: Ensure actual repository BPMN files render properly

## Alternative Approaches Considered

### 1. setTimeout with longer delays
```javascript
setTimeout(() => {
  canvas.zoom('fit-viewport');
}, 100);
```
**Why not used**: Still doesn't guarantee the browser has painted; could still fail with slow DOM operations or dynamic content loading.

### 2. Immediate force repaint without RAF
```javascript
canvas.zoom('fit-viewport');
canvas.zoom(canvas.zoom());  // Immediate
```
**Why not used**: Too fast; the container may not have dimensions yet when zoom is called.

### 3. MutationObserver
Watching for DOM changes and triggering zoom when SVG elements are added.
**Why not used**: Overly complex; RAF polling is simpler and more predictable.

### 4. CSS-only fix
Attempting to use CSS animations or transitions to force repaints.
**Why not used**: Doesn't address the root cause (zero dimensions during zoom).

### 5. Single requestAnimationFrame
```javascript
requestAnimationFrame(() => {
  canvas.zoom('fit-viewport');
});
```
**Why not used**: Testing showed that nested RAF (two cycles) is more reliable for ensuring both layout and paint are complete.

## Diagnostic Logging

The implementation includes comprehensive diagnostic logging at every step:

```javascript
[BPMN Viewer] Container dimensions check: {
  offsetWidth: 1160,
  offsetHeight: 240,
  clientWidth: 1160,
  clientHeight: 240,
  boundingRect.width: 1160,
  boundingRect.height: 240,
  computedStyle.width: "1160px",
  computedStyle.height: "240px",
  hasValidDimensions: true
}
[BPMN Viewer] First RAF callback: layout should be painted
[BPMN Viewer] Container dimensions valid, proceeding with callback
[BPMN Viewer] Second RAF callback: executing zoom
[BPMN Viewer] Viewport transform before zoom: matrix(1 0 0 1 0 0)
[BPMN Viewer] Viewport transform after zoom: matrix(0.85 0 0 0.85 100 50)
```

This logging helps diagnose:
- When and why dimension checks fail
- How many RAF cycles are needed
- Whether viewport transform becomes all zeros (failure indicator)
- Whether manual recovery is attempted and succeeds

## Related Issues

This fix addresses similar issues that might occur with other diagram viewers:
- DMN viewer (if it uses dmn-js)
- Any other bpmn-js-based components in the application

## Performance Considerations

- **RAF Cycles**: Typically requires 1-2 RAF cycles (16-32ms at 60fps) when container is already painted
- **Maximum Wait Time**: If dimensions aren't ready, waits up to 50 RAF cycles (≈833ms at 60fps) before giving up
- **Canvas Operations**: The `viewbox()` and `zoom()` calls are lightweight operations in bpmn-js
- **No Additional Network Requests**: All operations are client-side DOM manipulations
- **Memory Impact**: Minimal; no additional objects are created or retained
- **User Experience**: The delay is imperceptible in normal cases (under 33ms is generally unnoticeable)

## Future Improvements

If this issue recurs or similar problems appear:

1. **Event-based approach**: Listen to bpmn-js lifecycle events like `import.done` or `canvas.viewbox.changed`
2. **Library upgrade**: Check if newer versions of bpmn-js have addressed this internally
3. **Generalized utility**: Create a shared utility function for consistent diagram rendering across all viewers
4. **Performance monitoring**: Add timing metrics to detect slow render cycles
5. **ResizeObserver**: Use ResizeObserver API to watch for container size changes as an alternative to RAF polling

## References

- bpmn-js documentation: https://github.com/bpmn-io/bpmn-js
- Canvas API: https://github.com/bpmn-io/diagram-js/blob/master/lib/core/Canvas.js
- WHO SMART Guidelines: https://www.who.int/teams/digital-health-and-innovation/smart-guidelines
- requestAnimationFrame timing: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
- Browser rendering pipeline: https://developers.google.com/web/fundamentals/performance/rendering
