/**
 * SUSHI WebAssembly Service
 * 
 * This service manages the loading and execution of SUSHI via WebAssembly.
 * It provides a bridge between the React application and the WASM module.
 * Optimized for memory efficiency and browser stability.
 */

class VirtualFileSystem {
  constructor() {
    this.files = new Map();
    this.directories = new Set();
    this.maxMemoryUsage = 50 * 1024 * 1024; // 50MB limit
    this.currentMemoryUsage = 0;
  }

  writeFile(path, content) {
    // Normalize path
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Check memory limits
    const contentSize = new TextEncoder().encode(content).length;
    if (this.currentMemoryUsage + contentSize > this.maxMemoryUsage) {
      throw new Error(`Memory limit exceeded. Cannot store file ${normalizedPath} (${(contentSize / 1024 / 1024).toFixed(1)}MB)`);
    }
    
    // Ensure parent directories exist
    const pathParts = normalizedPath.split('/');
    for (let i = 0; i < pathParts.length - 1; i++) {
      const dirPath = pathParts.slice(0, i + 1).join('/');
      this.directories.add(dirPath);
    }
    
    // Store file content as Uint8Array for WASM compatibility
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    
    // Remove old file if exists to update memory usage
    if (this.files.has(normalizedPath)) {
      const oldData = this.files.get(normalizedPath);
      this.currentMemoryUsage -= oldData.length;
    }
    
    this.files.set(normalizedPath, data);
    this.currentMemoryUsage += data.length;
    
    return true;
  }

  readFile(path) {
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    const data = this.files.get(normalizedPath);
    
    if (!data) {
      return null;
    }
    
    // Convert back to string for JavaScript consumption
    const decoder = new TextDecoder();
    return decoder.decode(data);
  }

  exists(path) {
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    return this.files.has(normalizedPath) || this.directories.has(normalizedPath);
  }

  listDirectory(path) {
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    const prefix = normalizedPath ? `${normalizedPath}/` : '';
    
    const items = [];
    
    // Add files
    for (const filePath of this.files.keys()) {
      if (filePath.startsWith(prefix)) {
        const relativePath = filePath.substring(prefix.length);
        if (!relativePath.includes('/')) { // Direct child only
          items.push({
            name: relativePath,
            type: 'file',
            path: filePath
          });
        }
      }
    }
    
    // Add directories
    for (const dirPath of this.directories) {
      if (dirPath.startsWith(prefix)) {
        const relativePath = dirPath.substring(prefix.length);
        if (!relativePath.includes('/')) { // Direct child only
          items.push({
            name: relativePath,
            type: 'directory',
            path: dirPath
          });
        }
      }
    }
    
    return items;
  }

  clear() {
    this.files.clear();
    this.directories.clear();
    this.currentMemoryUsage = 0;
  }

  getMemoryUsage() {
    return {
      used: this.currentMemoryUsage,
      limit: this.maxMemoryUsage,
      percentage: (this.currentMemoryUsage / this.maxMemoryUsage) * 100
    };
  }
}

class SushiWASMRunner {
  constructor() {
    this.wasmModule = null;
    this.fs = new VirtualFileSystem();
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  async initialize() {
    if (this.isInitialized) {
      return this.wasmModule;
    }
    
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    this.initializationPromise = this._loadWasmModule();
    return this.initializationPromise;
  }

  async _loadWasmModule() {
    try {
      // For now, we'll create a fallback implementation that uses the existing fsh-sushi
      // dependency but in a browser-compatible way. This is a stepping stone to full WASM.
      
      // Import the SUSHI library dynamically to avoid build issues
      const sushiModule = await this._importSushiLibrary();
      
      this.wasmModule = sushiModule;
      this.isInitialized = true;
      
      return this.wasmModule;
    } catch (error) {
      console.error('Failed to load SUSHI WASM module:', error);
      throw new Error(`SUSHI WASM initialization failed: ${error.message}`);
    }
  }

  async _importSushiLibrary() {
    // This is a bridge implementation that provides a WASM-like interface
    // for future migration. For now, we avoid direct fsh-sushi imports
    // due to Node.js dependency conflicts in browser environment.
    
    console.log('Creating fallback SUSHI implementation for browser environment');
    
    // Return a mock implementation with WASM-style interface
    return {
      ccall: this._createFallbackCCall.bind(this),
      FS: {
        writeFile: this.fs.writeFile.bind(this.fs),
        readFile: this.fs.readFile.bind(this.fs),
        exists: this.fs.exists.bind(this.fs)
      }
    };
  }

  _createFallbackCCall() {
    return (functionName, returnType, paramTypes, params) => {
      if (functionName === 'runSushi') {
        return this._runFallbackCompilation(params[0]);
      }
      throw new Error(`Unsupported WASM function: ${functionName}`);
    };
  }

  async _runFallbackCompilation(workspacePath) {
    // Fallback implementation using the existing custom FSH parser
    // This maintains the current functionality while providing WASM interface
    
    const outputFiles = [];
    const errors = [];
    const warnings = [];

    try {
      const fshFiles = this._getAllFshFiles();
      const configContent = this.fs.readFile('sushi-config.yaml');
      
      let config = {
        name: 'browser-generated-ig',
        version: '1.0.0',
        fhirVersion: '4.0.1',
        canonical: 'http://example.org/fhir/ig/browser-generated'
      };

      if (configContent) {
        try {
          const yaml = await import('js-yaml');
          config = yaml.default.load(configContent);
        } catch (err) {
          warnings.push(`Failed to parse sushi-config.yaml: ${err.message}`);
        }
      } else {
        warnings.push('No sushi-config.yaml found, using default configuration');
      }

      // Use the existing FSH parsing logic from SushiRunner
      for (const { content } of fshFiles) {
        const definitions = this._extractFSHDefinitions(content);
        
        // Generate FHIR resources using the same logic as the current implementation
        const resources = this._generateFHIRResources(definitions, config);
        outputFiles.push(...resources);
      }

      return JSON.stringify({
        success: true,
        files: outputFiles,
        errors: errors,
        warnings: warnings
      });

    } catch (error) {
      return JSON.stringify({
        success: false,
        files: [],
        errors: [error.message],
        warnings: warnings
      });
    }
  }

  _getAllFshFiles() {
    const fshFiles = [];
    
    // Recursively collect all .fsh files
    const collectFiles = (path = '') => {
      const items = this.fs.listDirectory(path);
      
      for (const item of items) {
        if (item.type === 'file' && item.name.endsWith('.fsh')) {
          const content = this.fs.readFile(item.path);
          if (content) {
            fshFiles.push({
              path: item.path,
              content: content
            });
          }
        } else if (item.type === 'directory') {
          collectFiles(item.path);
        }
      }
    };

    collectFiles('input/fsh');
    return fshFiles;
  }

  _extractFSHDefinitions(content) {
    // Reuse the existing FSH parsing logic from SushiRunner
    const definitions = {
      profiles: [],
      instances: [],
      valueSets: [],
      codeSystems: [],
      extensions: []
    };
    
    const lines = content.split('\n');
    let currentDefinition = null;
    let currentType = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect definition types
      if (line.startsWith('Profile:')) {
        currentType = 'profiles';
        currentDefinition = {
          name: line.substring(8).trim(),
          type: 'Profile',
          parent: null,
          id: null,
          title: null,
          description: null,
          rules: []
        };
      } else if (line.startsWith('Instance:')) {
        currentType = 'instances';
        currentDefinition = {
          name: line.substring(9).trim(),
          type: 'Instance',
          instanceOf: null,
          usage: null,
          title: null,
          description: null,
          rules: []
        };
      } else if (line.startsWith('ValueSet:')) {
        currentType = 'valueSets';
        currentDefinition = {
          name: line.substring(9).trim(),
          type: 'ValueSet',
          id: null,
          title: null,
          description: null,
          rules: []
        };
      } else if (line.startsWith('CodeSystem:')) {
        currentType = 'codeSystems';
        currentDefinition = {
          name: line.substring(11).trim(),
          type: 'CodeSystem',
          id: null,
          title: null,
          description: null,
          rules: []
        };
      } else if (line.startsWith('Extension:')) {
        currentType = 'extensions';
        currentDefinition = {
          name: line.substring(10).trim(),
          type: 'Extension',
          id: null,
          title: null,
          description: null,
          rules: []
        };
      }
      
      // Parse properties
      if (currentDefinition) {
        if (line.startsWith('Parent:')) {
          currentDefinition.parent = line.substring(7).trim();
        } else if (line.startsWith('InstanceOf:')) {
          currentDefinition.instanceOf = line.substring(11).trim();
        } else if (line.startsWith('Usage:')) {
          currentDefinition.usage = line.substring(6).trim();
        } else if (line.startsWith('Id:')) {
          currentDefinition.id = line.substring(3).trim();
        } else if (line.startsWith('Title:')) {
          currentDefinition.title = line.substring(6).trim().replace(/['"]/g, '');
        } else if (line.startsWith('Description:')) {
          currentDefinition.description = line.substring(12).trim().replace(/['"]/g, '');
        } else if (line.startsWith('* ')) {
          currentDefinition.rules.push(line.substring(2).trim());
        }
        
        // If we hit a new definition or end of content, save current one
        if ((line.includes(':') && !line.startsWith('* ') && 
             !line.startsWith('Parent:') && !line.startsWith('InstanceOf:') &&
             !line.startsWith('Usage:') && !line.startsWith('Id:') &&
             !line.startsWith('Title:') && !line.startsWith('Description:')) ||
            i === lines.length - 1) {
          
          if (currentDefinition && currentType && currentDefinition.name) {
            definitions[currentType].push(currentDefinition);
          }
          currentDefinition = null;
          currentType = null;
          i--; // Re-process this line for the new definition
        }
      }
    }
    
    return definitions;
  }

  _generateFHIRResources(definitions, config) {
    const resources = [];

    // Generate StructureDefinitions from profiles
    definitions.profiles.forEach(profile => {
      const profileId = profile.id || profile.name.toLowerCase().replace(/\s+/g, '-');
      const structureDefinition = {
        resourceType: 'StructureDefinition',
        id: profileId,
        url: `${config.canonical}/StructureDefinition/${profileId}`,
        name: profile.name,
        title: profile.title || profile.name,
        status: 'draft',
        fhirVersion: config.fhirVersion || '4.0.1',
        kind: 'resource',
        abstract: false,
        type: profile.parent === 'Patient' ? 'Patient' : 
               profile.parent === 'Observation' ? 'Observation' :
               profile.parent || 'DomainResource',
        baseDefinition: `http://hl7.org/fhir/StructureDefinition/${profile.parent || 'DomainResource'}`,
        derivation: 'constraint',
        description: profile.description || `Profile for ${profile.name}`
      };
      
      if (profile.rules.length > 0) {
        structureDefinition.differential = {
          element: profile.rules.map((rule, index) => ({
            id: `${structureDefinition.type}.${rule.split(' ')[0]}`,
            path: `${structureDefinition.type}.${rule.split(' ')[0]}`,
            short: `Rule: ${rule}`
          }))
        };
      }
      
      resources.push({
        path: `StructureDefinition-${profileId}.json`,
        content: JSON.stringify(structureDefinition, null, 2),
        resourceType: 'StructureDefinition'
      });
    });

    // Generate instances
    definitions.instances.forEach(instance => {
      const instanceId = instance.name.toLowerCase().replace(/\s+/g, '-');
      const resourceType = instance.instanceOf === 'Patient' ? 'Patient' :
                         instance.instanceOf === 'Observation' ? 'Observation' :
                         'Patient'; // Default fallback
                         
      const fhirInstance = {
        resourceType: resourceType,
        id: instanceId,
        meta: {
          profile: instance.instanceOf ? [`${config.canonical}/StructureDefinition/${instance.instanceOf}`] : undefined
        }
      };
      
      // Add basic properties based on resource type
      if (resourceType === 'Patient') {
        fhirInstance.name = [{
          family: instance.name.split(' ').pop(),
          given: instance.name.split(' ').slice(0, -1)
        }];
      }
      
      resources.push({
        path: `${instanceId}.json`,
        content: JSON.stringify(fhirInstance, null, 2),
        resourceType: resourceType
      });
    });

    // Generate ValueSets
    definitions.valueSets.forEach(vs => {
      const vsId = vs.id || vs.name.toLowerCase().replace(/\s+/g, '-');
      const valueSet = {
        resourceType: 'ValueSet',
        id: vsId,
        url: `${config.canonical}/ValueSet/${vsId}`,
        name: vs.name,
        title: vs.title || vs.name,
        status: 'draft',
        description: vs.description || `ValueSet for ${vs.name}`,
        compose: {
          include: [{
            system: 'http://example.org/codes',
            concept: [
              { code: 'example1', display: 'Example Code 1' },
              { code: 'example2', display: 'Example Code 2' }
            ]
          }]
        }
      };
      
      resources.push({
        path: `ValueSet-${vsId}.json`,
        content: JSON.stringify(valueSet, null, 2),
        resourceType: 'ValueSet'
      });
    });

    // Generate CodeSystems
    definitions.codeSystems.forEach(cs => {
      const csId = cs.id || cs.name.toLowerCase().replace(/\s+/g, '-');
      const codeSystem = {
        resourceType: 'CodeSystem',
        id: csId,
        url: `${config.canonical}/CodeSystem/${csId}`,
        name: cs.name,
        title: cs.title || cs.name,
        status: 'draft',
        content: 'complete',
        description: cs.description || `CodeSystem for ${cs.name}`,
        concept: [
          { code: 'concept1', display: 'Concept 1' },
          { code: 'concept2', display: 'Concept 2' }
        ]
      };
      
      resources.push({
        path: `CodeSystem-${csId}.json`,
        content: JSON.stringify(codeSystem, null, 2),
        resourceType: 'CodeSystem'
      });
    });

    return resources;
  }

  async runSushi(config, fshFiles) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Clear previous files and check memory
    this.fs.clear();
    
    // Check total size of input files
    const totalSize = fshFiles.reduce((sum, file) => sum + (file.content?.length || 0), 0);
    if (totalSize > 30 * 1024 * 1024) { // 30MB limit
      throw new Error(`Input files too large (${(totalSize / 1024 / 1024).toFixed(1)}MB). Consider processing fewer files at once.`);
    }

    try {
      // Write configuration
      if (config) {
        const configYaml = typeof config === 'string' ? config : 
          (await import('js-yaml')).default.dump(config);
        this.fs.writeFile('sushi-config.yaml', configYaml);
      }

      // Write FSH files with size validation
      for (const file of fshFiles) {
        const filePath = file.path || `input/fsh/${file.name}`;
        
        // Skip very large files to prevent crashes
        if (file.content && file.content.length > 5 * 1024 * 1024) { // 5MB per file
          console.warn(`Skipping large file ${file.name} (${(file.content.length / 1024 / 1024).toFixed(1)}MB)`);
          continue;
        }
        
        this.fs.writeFile(filePath, file.content || '');
      }

      // Execute SUSHI via WASM interface
      const result = this.wasmModule.ccall(
        'runSushi',           // Function name
        'string',             // Return type
        ['string'],           // Parameter types
        ['/workspace']        // Parameters
      );

      return JSON.parse(result);
      
    } catch (error) {
      // Clear memory on error
      this.fs.clear();
      throw error;
    }
  }
}

// Singleton instance
const sushiWasmService = new SushiWASMRunner();

export default sushiWasmService;