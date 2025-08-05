# WebAssembly Integration for FHIR Sushi in React Applications

## Overview

WebAssembly (WASM) provides an excellent solution for integrating complex, computationally intensive libraries like FHIR Sushi into React applications. This document outlines the approach for integrating WASM modules into the current React-based SGEX architecture.

## Current Implementation vs. WebAssembly Approach

### Current Browser-based Implementation

The current prototype implementation runs FHIR Sushi directly in the browser using:
- JavaScript-based FSH parsing
- Client-side file system simulation
- Browser-compatible FHIR validation
- Real-time logging and feedback

### WebAssembly Benefits

1. **Performance**: Near-native execution speed for complex parsing and validation tasks
2. **Full Feature Support**: Access to complete SUSHI functionality without browser limitations
3. **Consistent Behavior**: Identical results to server-side SUSHI execution
4. **Security**: Sandboxed execution environment
5. **Language Flexibility**: Can compile existing SUSHI codebase (TypeScript/Node.js) to WASM

## Integration Architecture

### 1. WASM Module Structure

```
sushi-wasm/
├── sushi.wasm          # Compiled SUSHI module
├── sushi.js            # WASM loader and JavaScript bindings
├── sushi.d.ts          # TypeScript definitions
└── filesystem.js      # Virtual filesystem implementation
```

### 2. React Integration Points

#### A. Module Loading
```javascript
// Async loading of WASM module
const SushiWASM = React.lazy(() => import('./wasm/sushi-wasm'));

// Component-level integration
const SushiRunner = () => {
  const [wasmModule, setWasmModule] = useState(null);
  
  useEffect(() => {
    loadSushiWASM().then(setWasmModule);
  }, []);
  
  // Use wasmModule for SUSHI operations
};
```

#### B. File System Interface
```javascript
// Virtual filesystem for WASM module
class VirtualFileSystem {
  constructor() {
    this.files = new Map();
  }
  
  writeFile(path, content) {
    this.files.set(path, new TextEncoder().encode(content));
  }
  
  readFile(path) {
    const data = this.files.get(path);
    return data ? new TextDecoder().decode(data) : null;
  }
  
  // Interface with WASM module filesystem
  mountToWASM(wasmModule) {
    wasmModule.FS.writeFile = this.writeFile.bind(this);
    wasmModule.FS.readFile = this.readFile.bind(this);
  }
}
```

#### C. Execution Interface
```javascript
class SushiWASMRunner {
  constructor(wasmModule) {
    this.wasm = wasmModule;
    this.fs = new VirtualFileSystem();
    this.fs.mountToWASM(wasmModule);
  }
  
  async runSushi(config, fshFiles) {
    // Write files to virtual filesystem
    this.fs.writeFile('sushi-config.yaml', config);
    fshFiles.forEach(file => {
      this.fs.writeFile(`input/fsh/${file.name}`, file.content);
    });
    
    // Execute SUSHI via WASM
    const result = this.wasm.ccall(
      'runSushi',           // Function name
      'string',             // Return type
      ['string'],           // Parameter types
      ['/workspace']        // Parameters
    );
    
    return JSON.parse(result);
  }
}
```

### 3. Current React Component Integration

The existing `SushiRunner` component can be enhanced to support WASM:

```javascript
const SushiRunner = ({ repository, selectedBranch, profile, stagingFiles }) => {
  const [executionMode, setExecutionMode] = useState('javascript'); // 'javascript' | 'wasm'
  const [wasmModule, setWasmModule] = useState(null);
  
  // Load WASM module on component mount
  useEffect(() => {
    if (executionMode === 'wasm') {
      loadSushiWASM().then(setWasmModule);
    }
  }, [executionMode]);
  
  const runSushiInBrowser = async (config, files) => {
    if (executionMode === 'wasm' && wasmModule) {
      return runSushiWithWASM(wasmModule, config, files);
    } else {
      return runSushiWithJavaScript(config, files);
    }
  };
  
  // Rest of component remains the same
};
```

## Implementation Steps

### Phase 1: WASM Module Creation
1. **Set up Emscripten toolchain** for compiling SUSHI to WASM
2. **Create WASM bindings** for essential SUSHI functions
3. **Implement virtual filesystem** for file operations
4. **Build and test** WASM module independently

### Phase 2: React Integration
1. **Create WASM loader utility** for async module loading
2. **Extend SushiRunner component** with WASM execution mode
3. **Implement error handling** for WASM-specific issues
4. **Add performance monitoring** to compare JavaScript vs WASM execution

### Phase 3: Optimization
1. **Implement streaming** for large file processing
2. **Add web worker support** for background processing
3. **Implement progressive loading** for faster startup
4. **Add caching** for compiled WASM modules

## File Structure Changes

```
src/
├── components/
│   ├── SushiRunner.js           # Enhanced with WASM support
│   └── SushiRunner.css          # Updated styles
├── services/
│   ├── sushiWasmService.js      # WASM module management
│   └── virtualFileSystem.js    # Virtual FS implementation
├── wasm/
│   ├── sushi.wasm               # Compiled SUSHI module
│   ├── sushi.js                 # WASM loader
│   └── bindings.js              # JavaScript/WASM bindings
└── utils/
    ├── wasmLoader.js            # Async WASM loading utilities
    └── performanceMonitor.js    # Performance comparison tools
```

## Benefits for SGEX

1. **Enhanced Performance**: Complex FSH parsing and FHIR validation at near-native speeds
2. **Complete SUSHI Support**: Access to full SUSHI functionality without limitations
3. **Better User Experience**: Faster compilation times and more responsive UI
4. **Scalability**: Handle larger FHIR Implementation Guides efficiently
5. **Offline Capability**: Full SUSHI functionality without server dependency

## Considerations

### Technical Challenges
- **Bundle Size**: WASM modules can be large (2-10MB for complex applications)
- **Loading Time**: Initial WASM compilation has overhead
- **Browser Support**: Ensure compatibility across target browsers
- **Debugging**: WASM debugging is more complex than JavaScript

### Solutions
- **Lazy Loading**: Load WASM only when needed
- **Progressive Enhancement**: Fall back to JavaScript implementation
- **Caching**: Cache compiled WASM modules in browser storage
- **Error Boundaries**: Robust error handling for WASM failures

## Migration Strategy

1. **Parallel Implementation**: Keep both JavaScript and WASM implementations
2. **Feature Flag**: Allow users to choose execution mode
3. **Performance Monitoring**: Compare execution times and success rates
4. **Gradual Rollout**: Enable WASM for power users first
5. **Fallback Support**: Automatic fallback to JavaScript on WASM failure

## Conclusion

WebAssembly integration would significantly enhance the SUSHI client-side execution capabilities in SGEX, providing users with a powerful, fast, and complete FHIR Implementation Guide compilation experience directly in their browser. The modular approach ensures compatibility with the existing React architecture while opening doors for advanced features and better performance.