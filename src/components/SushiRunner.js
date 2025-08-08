import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import githubService from '../services/githubService';
import sushiWasmService from '../services/sushiWasmService';
import { WasmLoader, performanceMonitor } from '../utils/wasmLoader';
import SushiErrorBoundary from './SushiErrorBoundary';
import './SushiRunner.css';

const SushiRunner = ({ repository, selectedBranch, profile, stagingFiles = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('logs');
  const [logLevelToggles, setLogLevelToggles] = useState({
    info: true,
    success: true,
    warning: true,
    error: true
  });
  const [searchText, setSearchText] = useState('');
  const [sushiConfig, setSushiConfig] = useState(null);
  const [fshFiles, setFshFiles] = useState([]);
  const [includeStagingFiles, setIncludeStagingFiles] = useState(false);
  const [error, setError] = useState(null);
  const [executionMode, setExecutionMode] = useState('auto'); // 'auto', 'wasm', 'javascript'
  const [wasmSupported, setWasmSupported] = useState(false);
  const [wasmInitialized, setWasmInitialized] = useState(false);

  const owner = repository.owner?.login || repository.full_name.split('/')[0];
  const repoName = repository.name;

  const addLog = useCallback((message, type = 'info') => {
    setLogs(prev => [...prev, {
      id: Date.now() + Math.random(),
      message,
      type,
      timestamp: new Date().toISOString()
    }]);
  }, []);

  // Check WebAssembly support on component mount
  useEffect(() => {
    const checkWasmSupport = async () => {
      const supported = WasmLoader.isSupported();
      setWasmSupported(supported);
      
      if (supported) {
        addLog('🚀 WebAssembly support detected', 'success');
        
        // Initialize WASM service
        try {
          await sushiWasmService.initialize();
          setWasmInitialized(true);
          addLog('✅ SUSHI WebAssembly service initialized', 'success');
        } catch (err) {
          addLog(`⚠️ WASM initialization failed, falling back to JavaScript: ${err.message}`, 'warning');
        }
      } else {
        addLog('⚠️ WebAssembly not supported, using JavaScript fallback', 'warning');
      }
    };

    checkWasmSupport();
  }, [addLog]);

  const fetchRepositoryFiles = async () => {
    try {
      addLog('🔍 Fetching sushi-config.yaml...', 'info');
      
      let config = null;
      try {
        const configContent = await githubService.getFileContent(
          owner, 
          repoName, 
          'sushi-config.yaml', 
          selectedBranch
        );
        config = configContent;
        setSushiConfig(config);
        addLog('✅ Found sushi-config.yaml', 'success');
      } catch (err) {
        addLog('⚠️ sushi-config.yaml not found in repository', 'warning');
      }

      addLog('🔍 Scanning input/fsh directory recursively...', 'info');
      
      const fshFiles = [];
      try {
        // Recursively scan for FSH files
        const scanDirectory = async (dirPath, depth = 0) => {
          const maxDepth = 5; // Prevent infinite recursion
          if (depth > maxDepth) {
            addLog(`⚠️ Maximum directory depth reached for ${dirPath}`, 'warning');
            return;
          }

          try {
            const contents = await githubService.getDirectoryContents(
              owner,
              repoName,
              dirPath,
              selectedBranch
            );
            
            for (const item of contents) {
              if (item.type === 'file' && item.name.endsWith('.fsh')) {
                try {
                  const fileContent = await githubService.getFileContent(
                    owner,
                    repoName,
                    item.path,
                    selectedBranch
                  );
                  fshFiles.push({
                    name: item.name,
                    path: item.path,
                    content: fileContent
                  });
                  addLog(`📄 Found ${item.path}`, 'success');
                } catch (err) {
                  addLog(`❌ Failed to fetch ${item.path}: ${err.message}`, 'error');
                }
              } else if (item.type === 'dir') {
                // Recursively scan subdirectories
                addLog(`📁 Scanning subdirectory: ${item.path}`, 'info');
                await scanDirectory(item.path, depth + 1);
              }
            }
          } catch (err) {
            addLog(`⚠️ Could not scan directory ${dirPath}: ${err.message}`, 'warning');
          }
        };

        await scanDirectory('input/fsh');
      } catch (err) {
        addLog('⚠️ input/fsh directory not found or empty', 'warning');
      }

      setFshFiles(fshFiles);
      addLog(`📊 Found ${fshFiles.length} FSH files in repository`, 'info');
      
      return { config, fshFiles };
    } catch (err) {
      addLog(`❌ Error fetching repository files: ${err.message}`, 'error');
      throw err;
    }
  };

  const integrateStagingFiles = (repoFshFiles) => {
    // Start with repository files
    const integratedFiles = [...repoFshFiles];
    
    // Override/add staging files
    stagingFiles.forEach(stagingFile => {
      if (stagingFile.path && stagingFile.path.endsWith('.fsh')) {
        const fileName = stagingFile.path.split('/').pop();
        const existingIndex = integratedFiles.findIndex(f => f.name === fileName);
        
        if (existingIndex >= 0) {
          // Override existing file
          integratedFiles[existingIndex] = {
            ...integratedFiles[existingIndex],
            content: stagingFile.content,
            isFromStaging: true
          };
          addLog(`🔄 Overriding ${fileName} with staging version`, 'info');
        } else {
          // Add new file from staging
          integratedFiles.push({
            name: fileName,
            path: stagingFile.path,
            content: stagingFile.content,
            isFromStaging: true
          });
          addLog(`➕ Adding ${fileName} from staging`, 'info');
        }
      }
    });

    return integratedFiles;
  };

  const runSushiInBrowser = async (config, files) => {
    try {
      // Determine execution mode
      const useWasm = executionMode === 'wasm' || 
                     (executionMode === 'auto' && wasmSupported && wasmInitialized);
      
      const mode = useWasm ? 'WebAssembly' : 'JavaScript';
      addLog(`🚀 Starting FHIR Shorthand compilation using ${mode}...`, 'info');
      
      // Start performance monitoring
      performanceMonitor.startTiming('sushi-compilation', useWasm ? 'wasm' : 'js');
      
      let result;
      
      if (useWasm) {
        addLog('🔧 Using WebAssembly SUSHI engine...', 'info');
        result = await runSushiWithWasm(config, files);
      } else {
        addLog('⚙️ Using JavaScript fallback engine...', 'info');
        result = await runSushiWithJavaScript(config, files);
      }
      
      // End performance monitoring
      const duration = performanceMonitor.endTiming('sushi-compilation', useWasm ? 'wasm' : 'js');
      addLog(`⏱️ Compilation completed in ${duration.toFixed(2)}ms using ${mode}`, 'success');
      
      return result;
      
    } catch (err) {
      addLog(`❌ Compilation failed: ${err.message}`, 'error');
      
      // If WASM failed, try JavaScript fallback
      if (executionMode === 'auto' && wasmSupported) {
        addLog('🔄 Attempting JavaScript fallback...', 'info');
        try {
          return await runSushiWithJavaScript(config, files);
        } catch (fallbackErr) {
          addLog(`❌ JavaScript fallback also failed: ${fallbackErr.message}`, 'error');
          throw fallbackErr;
        }
      }
      
      throw err;
    }
  };

  const runSushiWithWasm = async (config, files) => {
    try {
      addLog('📦 Preparing WebAssembly execution environment...', 'info');
      
      // Use the WASM service
      const result = await sushiWasmService.runSushi(config, files);
      
      if (result.success) {
        addLog(`✅ WebAssembly compilation successful`, 'success');
        addLog(`📊 Generated ${result.files.length} FHIR resources`, 'success');
        
        // Convert WASM output to the expected format
        const generatedResources = result.files.map(file => ({
          type: file.resourceType,
          filename: file.path,
          content: file.content,
          id: file.path.split('.')[0],
          resourceType: file.resourceType
        }));
        
        setGeneratedFiles(generatedResources);
        
        // Log any warnings
        result.warnings.forEach(warning => {
          addLog(`⚠️ ${warning}`, 'warning');
        });
        
        return {
          success: true,
          resourceCount: result.files.length,
          warnings: result.warnings,
          errors: result.errors,
          generatedFiles: generatedResources
        };
      } else {
        // Log errors from WASM compilation
        result.errors.forEach(error => {
          addLog(`❌ ${error}`, 'error');
        });
        
        throw new Error(`WASM compilation failed: ${result.errors.join(', ')}`);
      }
      
    } catch (err) {
      addLog(`💥 WebAssembly execution failed: ${err.message}`, 'error');
      throw err;
    }
  };

  const runSushiWithJavaScript = async (config, files) => {
    try {
      addLog('🚀 Starting FHIR Shorthand compilation...', 'info');
      
      addLog('ℹ️ Using JavaScript FSH processor with enhanced crash prevention', 'info');
      
      // Enhanced memory monitoring with hard limits
      const checkMemoryUsage = () => {
        if (performance.memory && performance.memory.usedJSHeapSize) {
          const memoryMB = (performance.memory.usedJSHeapSize / 1024 / 1024);
          const memoryLimitMB = 100; // Hard limit: 100MB
          const memoryWarningMB = 75; // Warning at 75MB
          
          if (memoryMB > memoryLimitMB) {
            throw new Error(`Memory limit exceeded: ${memoryMB.toFixed(1)}MB > ${memoryLimitMB}MB. Please reduce file count or size.`);
          }
          
          if (memoryMB > memoryWarningMB) {
            addLog(`⚠️ High memory usage: ${memoryMB.toFixed(1)}MB (approaching ${memoryLimitMB}MB limit)`, 'warning');
          }
          
          return memoryMB;
        }
        return 0;
      };
      
      const initialMemory = checkMemoryUsage();
      addLog(`💾 Initial memory usage: ${initialMemory.toFixed(1)} MB`, 'info');
      
      // Implement strict file size limits to prevent crashes
      const maxFileSize = 2 * 1024 * 1024; // 2MB hard limit per file
      const maxTotalSize = 10 * 1024 * 1024; // 10MB total size limit
      const maxFiles = 20; // Maximum 20 files to process
      
      let totalSize = 0;
      const validFiles = [];
      
      for (const file of files.slice(0, maxFiles)) {
        const fileSize = file.content ? file.content.length : 0;
        
        if (fileSize > maxFileSize) {
          addLog(`❌ Skipping ${file.name}: too large (${(fileSize / 1024 / 1024).toFixed(1)}MB > 2MB limit)`, 'error');
          continue;
        }
        
        if (totalSize + fileSize > maxTotalSize) {
          addLog(`⚠️ Stopping file processing: total size limit reached (${(totalSize / 1024 / 1024).toFixed(1)}MB)`, 'warning');
          break;
        }
        
        totalSize += fileSize;
        validFiles.push(file);
      }
      
      if (files.length > maxFiles) {
        addLog(`⚠️ Limited to first ${maxFiles} files (${files.length} total) to prevent crashes`, 'warning');
      }
      
      addLog(`📊 Processing ${validFiles.length} files (${(totalSize / 1024 / 1024).toFixed(1)}MB total)`, 'info');
      
      addLog('📦 Loading YAML processing library...', 'info');
      const yaml = await import('js-yaml');
      addLog('✅ Libraries loaded successfully', 'success');
      
      addLog('📝 Processing configuration...', 'info');
      
      // Prepare configuration
      let configObj = null;
      if (config) {
        try {
          configObj = typeof config === 'string' ? yaml.default.load(config) : config;
          addLog(`📋 Package: ${configObj.name || 'Unknown'}`, 'success');
          addLog(`📋 Version: ${configObj.version || 'Unknown'}`, 'success');
          addLog(`📋 FHIR Version: ${configObj.fhirVersion || 'Unknown'}`, 'success');
        } catch (err) {
          addLog(`⚠️ Could not parse config: ${err.message}`, 'warning');
        }
      } else {
        // Create a default configuration
        configObj = {
          name: 'browser-generated-ig',
          version: '1.0.0',
          fhirVersion: '4.0.1',
          id: 'browser.generated.ig',
          canonical: 'http://example.org/fhir/ig/browser-generated',
          status: 'draft'
        };
        addLog('📋 Using default configuration', 'info');
      }

      addLog(`🔍 Analyzing ${validFiles.length} FSH files with crash prevention...`, 'info');
      
      const generatedResources = [];
      let processedCount = 0;
      const maxResourcesPerFile = 5; // Strict limit: max 5 resources per file
      const maxTotalResources = 50; // Hard limit: max 50 total resources
      
      // Process files in smaller chunks to prevent memory buildup
      const chunkSize = 2; // Process 2 files at a time
      
      for (let i = 0; i < validFiles.length; i += chunkSize) {
        const chunk = validFiles.slice(i, i + chunkSize);
        
        for (const file of chunk) {
          addLog(`📄 Processing ${file.name} (${processedCount + 1}/${validFiles.length})...`, 'info');
          
          // Enhanced memory check before processing each file
          const currentMemory = checkMemoryUsage();
          
          // Stop if we're approaching memory limits
          if (currentMemory > 80) { // 80MB threshold
            addLog(`⚠️ Stopping processing due to high memory usage (${currentMemory.toFixed(1)}MB)`, 'warning');
            break;
          }
          
          // Stop if we've reached resource limits
          if (generatedResources.length >= maxTotalResources) {
            addLog(`⚠️ Reached maximum resource limit (${maxTotalResources}), stopping processing`, 'warning');
            break;
          }
          
          const content = file.content;
          
          // Enhanced FSH parsing with stricter limits
          const extractFSHDefinitions = (content) => {
            try {
              const definitions = {
                profiles: [],
                instances: [],
                valueSets: [],
                codeSystems: [],
                extensions: []
              };
              
              // Check for empty or invalid content
              if (!content || typeof content !== 'string') {
                return definitions;
              }
              
              // Much stricter line processing limit to prevent memory issues
              const lines = content.split('\n');
              const maxLinesToProcess = 1000; // Reduced from 10k to 1k lines per file
              
              if (lines.length > maxLinesToProcess) {
                addLog(`  ⚠️ File is large (${lines.length} lines). Processing first ${maxLinesToProcess} lines only.`, 'warning');
              }
              
              const linesToProcess = lines.slice(0, Math.min(lines.length, maxLinesToProcess));
              
              let currentDefinition = null;
              let currentType = null;
              let definitionCount = 0;
              const maxDefinitionsPerFile = 10; // Limit definitions per file
              
              for (let i = 0; i < linesToProcess.length && definitionCount < maxDefinitionsPerFile; i++) {
                const line = linesToProcess[i].trim();
                
                // Skip empty lines and comments to improve performance
                if (!line || line.startsWith('//') || line.startsWith('/*')) {
                  continue;
                }
                
                // Detect definition types
                if (line.startsWith('Profile:')) {
                  if (definitionCount >= maxDefinitionsPerFile) break;
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
                  definitionCount++;
                } else if (line.startsWith('Instance:')) {
                  if (definitionCount >= maxDefinitionsPerFile) break;
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
                  definitionCount++;
                } else if (line.startsWith('ValueSet:')) {
                  if (definitionCount >= maxDefinitionsPerFile) break;
                  currentType = 'valueSets';
                  currentDefinition = {
                    name: line.substring(9).trim(),
                    type: 'ValueSet',
                    id: null,
                    title: null,
                    description: null,
                    rules: []
                  };
                  definitionCount++;
                } else if (line.startsWith('CodeSystem:')) {
                  if (definitionCount >= maxDefinitionsPerFile) break;
                  currentType = 'codeSystems';
                  currentDefinition = {
                    name: line.substring(11).trim(),
                    type: 'CodeSystem',
                    id: null,
                    title: null,
                    description: null,
                    rules: []
                  };
                  definitionCount++;
                } else if (line.startsWith('Extension:')) {
                  if (definitionCount >= maxDefinitionsPerFile) break;
                  currentType = 'extensions';
                  currentDefinition = {
                    name: line.substring(10).trim(),
                    type: 'Extension',
                    id: null,
                    title: null,
                    description: null,
                    rules: []
                  };
                  definitionCount++;
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
                    // Much stricter rule limit to prevent memory issues
                    if (currentDefinition.rules.length < 10) {
                      currentDefinition.rules.push(line.substring(2).trim());
                    }
                  }
                  
                  // If we hit a new definition or end of content, save current one
                  if ((line.includes(':') && !line.startsWith('* ') && 
                       !line.startsWith('Parent:') && !line.startsWith('InstanceOf:') &&
                       !line.startsWith('Usage:') && !line.startsWith('Id:') &&
                       !line.startsWith('Title:') && !line.startsWith('Description:')) ||
                      i === linesToProcess.length - 1) {
                    
                    if (currentDefinition && currentType && currentDefinition.name) {
                      definitions[currentType].push(currentDefinition);
                    }
                    currentDefinition = null;
                    currentType = null;
                    i--; // Re-process this line for the new definition
                  }
                }
              }
              
              if (definitionCount >= maxDefinitionsPerFile) {
                addLog(`  ⚠️ Limited to ${maxDefinitionsPerFile} definitions per file to prevent memory issues`, 'warning');
              }
              
              return definitions;
            } catch (err) {
              addLog(`  ❌ Error parsing FSH content: ${err.message}`, 'error');
              return {
                profiles: [],
                instances: [],
                valueSets: [],
                codeSystems: [],
                extensions: []
              };
            }
          };
          
          const definitions = extractFSHDefinitions(content);
          
          // Generate FHIR resources with strict memory management
          let resourcesFromThisFile = 0;
          const remainingResourceSlots = maxTotalResources - generatedResources.length;
          const maxFromThisFile = Math.min(maxResourcesPerFile, remainingResourceSlots);
          
          // Process profiles with strict limits
          for (const profile of definitions.profiles.slice(0, Math.min(2, maxFromThisFile - resourcesFromThisFile))) {
            if (resourcesFromThisFile >= maxFromThisFile) break;
            
            try {
              const profileId = profile.id || profile.name.toLowerCase().replace(/\s+/g, '-');
              const structureDefinition = {
                resourceType: 'StructureDefinition',
                id: profileId,
                url: `${configObj.canonical}/StructureDefinition/${profileId}`,
                name: profile.name,
                title: profile.title || profile.name,
                status: 'draft',
                fhirVersion: configObj.fhirVersion || '4.0.1',
                kind: 'resource',
                abstract: false,
                type: profile.parent === 'Patient' ? 'Patient' : 
                       profile.parent === 'Observation' ? 'Observation' :
                       profile.parent || 'DomainResource',
                baseDefinition: `http://hl7.org/fhir/StructureDefinition/${profile.parent || 'DomainResource'}`,
                derivation: 'constraint',
                description: profile.description || `Profile for ${profile.name}`
              };
              
              // Limit differential elements to prevent memory issues
              if (profile.rules.length > 0) {
                structureDefinition.differential = {
                  element: profile.rules.slice(0, 3).map((rule, index) => ({ // Reduced to 3 elements max
                    id: `${structureDefinition.type}.${rule.split(' ')[0]}`,
                    path: `${structureDefinition.type}.${rule.split(' ')[0]}`,
                    short: `Rule: ${rule}`
                  }))
                };
              }
              
              generatedResources.push({
                type: 'StructureDefinition',
                filename: `StructureDefinition-${profileId}.json`,
                content: JSON.stringify(structureDefinition, null, 2),
                id: profileId,
                name: profile.name,
                title: structureDefinition.title,
                url: structureDefinition.url
              });
              
              resourcesFromThisFile++;
              addLog(`  📊 Generated StructureDefinition: ${profile.name}`, 'success');
            } catch (err) {
              addLog(`  ❌ Error generating StructureDefinition for ${profile.name}: ${err.message}`, 'error');
            }
          }
          
          // Process instances with strict limits
          for (const instance of definitions.instances.slice(0, Math.min(2, maxFromThisFile - resourcesFromThisFile))) {
            if (resourcesFromThisFile >= maxFromThisFile) break;
            
            try {
              const instanceId = instance.name.toLowerCase().replace(/\s+/g, '-');
              const resourceType = instance.instanceOf === 'Patient' ? 'Patient' :
                                 instance.instanceOf === 'Observation' ? 'Observation' :
                                 'Patient'; // Default fallback
                                 
              const fhirInstance = {
                resourceType: resourceType,
                id: instanceId,
                meta: {
                  profile: instance.instanceOf ? [`${configObj.canonical}/StructureDefinition/${instance.instanceOf}`] : undefined
                }
              };
              
              // Add minimal properties to reduce memory usage
              if (resourceType === 'Patient') {
                fhirInstance.name = [{
                  family: instance.name.split(' ').pop(),
                  given: instance.name.split(' ').slice(0, -1)
                }];
              }
              
              generatedResources.push({
                type: resourceType,
                filename: `${instanceId}.json`,
                content: JSON.stringify(fhirInstance, null, 2),
                id: instanceId,
                resourceType: resourceType
              });
              
              resourcesFromThisFile++;
              addLog(`  📊 Generated ${resourceType} instance: ${instance.name}`, 'success');
            } catch (err) {
              addLog(`  ❌ Error generating instance for ${instance.name}: ${err.message}`, 'error');
            }
          }
          
          // Process ValueSets and CodeSystems with even stricter limits
          for (const vs of definitions.valueSets.slice(0, Math.min(1, maxFromThisFile - resourcesFromThisFile))) {
            if (resourcesFromThisFile >= maxFromThisFile) break;
            
            try {
              const vsId = vs.id || vs.name.toLowerCase().replace(/\s+/g, '-');
              const valueSet = {
                resourceType: 'ValueSet',
                id: vsId,
                url: `${configObj.canonical}/ValueSet/${vsId}`,
                name: vs.name,
                title: vs.title || vs.name,
                status: 'draft',
                description: vs.description || `ValueSet for ${vs.name}`,
                compose: {
                  include: [{
                    system: 'http://example.org/codes',
                    concept: [
                      { code: 'example1', display: 'Example Code 1' }
                    ]
                  }]
                }
              };
              
              generatedResources.push({
                type: 'ValueSet',
                filename: `ValueSet-${vsId}.json`,
                content: JSON.stringify(valueSet, null, 2),
                id: vsId,
                name: vs.name,
                title: valueSet.title,
                url: valueSet.url
              });
              
              resourcesFromThisFile++;
              addLog(`  📊 Generated ValueSet: ${vs.name}`, 'success');
            } catch (err) {
              addLog(`  ❌ Error generating ValueSet for ${vs.name}: ${err.message}`, 'error');
            }
          }
          
          if (file.isFromStaging) {
            addLog(`  🏗️ File from staging ground`, 'info');
          }
          
          processedCount++;
          
          // Clear file content from memory immediately after processing
          file.content = null;
          
          // Force garbage collection more frequently
          if (window.gc && typeof window.gc === 'function') {
            window.gc();
          }
        }
        
        // Yield control for longer periods between chunks to prevent blocking
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay between chunks
        
        // Enhanced memory monitoring after each chunk
        const memoryAfterChunk = checkMemoryUsage();
        addLog(`💾 Memory after chunk: ${memoryAfterChunk.toFixed(1)} MB (processed ${Math.min(i + chunkSize, validFiles.length)}/${validFiles.length})`, 'info');
        
        // Break if memory is getting too high
        if (memoryAfterChunk > 80) {
          addLog(`⚠️ Stopping processing due to high memory usage`, 'warning');
          break;
        }
      }

      // Set generated files
      setGeneratedFiles(generatedResources);
      
      // Final memory check
      const finalMemory = checkMemoryUsage();
      addLog(`💾 Final memory usage: ${finalMemory.toFixed(1)} MB`, 'info');
      
      addLog('✨ FSH compilation completed with crash prevention!', 'success');
      addLog(`📦 Generated ${generatedResources.length} FHIR resources total (limited for stability)`, 'success');
      
      // Check for staging files
      const stagingCount = validFiles.filter(f => f.isFromStaging).length;
      if (stagingCount > 0) {
        addLog(`🏗️ ${stagingCount} file(s) from staging ground included`, 'info');
      }
      
      // Handle edge cases
      if (validFiles.length === 0) {
        addLog('⚠️ No FSH files found or all files too large to process safely', 'warning');
      }
      
      if (!config) {
        addLog('⚠️ No sushi-config.yaml found - used default configuration', 'warning');
      }
      
      // Safety warnings
      if (generatedResources.length >= maxTotalResources) {
        addLog(`⚠️ Output limited to ${maxTotalResources} resources to prevent browser crashes`, 'warning');
      }
      
      if (validFiles.length < files.length) {
        addLog(`⚠️ ${files.length - validFiles.length} files skipped due to size limits`, 'warning');
      }

      return {
        success: true,
        resourceCount: generatedResources.length,
        warnings: [],
        errors: [],
        generatedFiles: generatedResources
      };
      
    } catch (err) {
      addLog(`❌ Compilation failed: ${err.message}`, 'error');
      
      // Log additional error details if available
      if (err.stack) {
        console.error('Compilation error stack:', err.stack);
      }
      
      throw err;
    }
  };

  const handleRunSushi = async (withStagingFiles = false) => {
    setIsRunning(true);
    setShowModal(true);
    setLogs([]);
    setGeneratedFiles([]);
    setActiveTab('logs');
    setError(null);
    setIncludeStagingFiles(withStagingFiles);

    try {
      addLog('🏁 Starting SUSHI client-side execution...', 'info');
      
      if (withStagingFiles && stagingFiles.length > 0) {
        addLog(`🗂️ Including ${stagingFiles.length} staging files`, 'info');
      }

      // Fetch repository files
      const { config, fshFiles: repoFiles } = await fetchRepositoryFiles();
      
      // Integrate staging files if requested
      const finalFiles = withStagingFiles ? 
        integrateStagingFiles(repoFiles) : 
        repoFiles;

      if (withStagingFiles) {
        addLog(`📊 Final file count: ${finalFiles.length} FSH files`, 'info');
      }

      // Run SUSHI
      await runSushiInBrowser(config, finalFiles);
      
      addLog('🎉 SUSHI execution completed successfully!', 'success');
      
    } catch (err) {
      setError(err.message);
      addLog(`💥 Execution failed: ${err.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const toggleLogLevel = useCallback((level) => {
    setLogLevelToggles(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setGeneratedFiles([]);
    setActiveTab('logs');
    setLogLevelToggles({
      info: true,
      success: true,
      warning: true,
      error: true
    });
    setSearchText('');
  }, []);

  const copyAllLogs = useCallback(async () => {
    const logText = logs.map(log => 
      `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`
    ).join('\n');
    
    try {
      await navigator.clipboard.writeText(logText);
    } catch (err) {
      console.error('Failed to copy logs:', err);
    }
  }, [logs]);

  const copyLogMessage = useCallback(async (message) => {
    try {
      await navigator.clipboard.writeText(message);
    } catch (err) {
      console.error('Failed to copy log message:', err);
    }
  }, []);

  // Function to detect and create links for files mentioned in log messages
  const parseLogMessage = useCallback((message, logId) => {
    // More precise regex to find valid file paths - must be preceded by whitespace or start of line
    // and must be a complete path (not part of a longer word)
    const filePathRegex = /(?:^|\s)((?:input\/fsh\/[a-zA-Z0-9_/-]*\/)?[a-zA-Z0-9_.-]+\.(?:fsh|yaml|yml|json))(?=\s|$|[.,!])/g;
    const matches = [...message.matchAll(filePathRegex)];
    
    if (matches.length === 0) {
      return <span>{message}</span>;
    }
    
    let lastIndex = 0;
    const elements = [];
    let elementCounter = 0; // Add counter for unique keys
    
    matches.forEach((match, index) => {
      const fullMatch = match[0];
      const filePath = match[1];
      const matchIndex = match.index;
      
      // Add text before the match
      if (matchIndex > lastIndex) {
        elements.push(
          <span key={`${logId}-text-${elementCounter++}`}>
            {message.substring(lastIndex, matchIndex)}
          </span>
        );
      }
      
      // Add the leading whitespace if present
      const leadingWhitespace = fullMatch.substring(0, fullMatch.indexOf(filePath));
      if (leadingWhitespace) {
        elements.push(
          <span key={`${logId}-ws-${elementCounter++}`}>
            {leadingWhitespace}
          </span>
        );
      }
      
      // Determine link type based on file location and validate the file exists
      const createFileLink = (path, text, keyIndex) => {
        // Check if file exists in our known file lists to avoid creating invalid links
        const isKnownRepoFile = fshFiles.some(f => f.path === path);
        const isFromStaging = stagingFiles.some(f => f.path && (f.path === path || f.path.endsWith(`/${path.split('/').pop()}`)));
        const isSushiConfig = path === 'sushi-config.yaml';
        
        // Only create links for files we know exist
        if (!isKnownRepoFile && !isFromStaging && !isSushiConfig) {
          // File not found in our known files, return as plain text
          return (
            <span key={`${logId}-text-${keyIndex}`} className="file-mention">
              {text}
            </span>
          );
        }
        
        if (isFromStaging) {
          // Link to staging ground
          return (
            <span key={`${logId}-staging-${keyIndex}`} className="file-link staging-link" title="File from Staging Ground">
              📝 {text}
            </span>
          );
        } else if (path.startsWith('input/fsh/')) {
          // Determine DAK component based on directory structure
          const getDakComponentLink = (fshPath) => {
            const pathParts = fshPath.split('/');
            if (pathParts.length > 2) {
              const subDir = pathParts[2];
              switch (subDir) {
                case 'profiles':
                  return { component: 'Profiles', icon: '👤' };
                case 'examples':
                  return { component: 'Examples', icon: '📋' };
                case 'valuesets':
                  return { component: 'ValueSets', icon: '📊' };
                case 'codesystems':
                  return { component: 'CodeSystems', icon: '🔢' };
                case 'extensions':
                  return { component: 'Extensions', icon: '🔧' };
                default:
                  return { component: 'FSH Files', icon: '📄' };
              }
            }
            return { component: 'FSH Files', icon: '📄' };
          };
          
          const dakInfo = getDakComponentLink(path);
          return (
            <span key={`${logId}-dak-${keyIndex}`} className="file-link dak-link" title={`View in DAK ${dakInfo.component}`}>
              {dakInfo.icon} {text}
            </span>
          );
        } else {
          // Link to GitHub source for valid repository files
          const githubUrl = `https://github.com/${owner}/${repoName}/blob/${selectedBranch}/${path}`;
          return (
            <a 
              key={`${logId}-github-${keyIndex}`}
              href={githubUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="file-link github-link"
              title="Open in GitHub"
            >
              🔗 {text}
            </a>
          );
        }
      };
      
      elements.push(createFileLink(filePath, filePath, elementCounter++));
      lastIndex = matchIndex + fullMatch.length;
    });
    
    // Add remaining text
    if (lastIndex < message.length) {
      elements.push(
        <span key={`${logId}-text-end-${elementCounter++}`}>
          {message.substring(lastIndex)}
        </span>
      );
    }
    
    return <span>{elements}</span>;
  }, [owner, repoName, selectedBranch, stagingFiles, fshFiles]);

  // Optimized filtered logs with useMemo to prevent unnecessary re-computations
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Filter by log level toggles
      const isLevelEnabled = logLevelToggles[log.type];
      
      // Filter by search text
      const matchesSearch = searchText === '' || 
        log.message.toLowerCase().includes(searchText.toLowerCase());
      
      return isLevelEnabled && matchesSearch;
    });
  }, [logs, logLevelToggles, searchText]);

  // Separate component for log controls to prevent re-renders
  const LogControls = React.memo(({ 
    logLevelToggles, 
    onToggleLogLevel, 
    searchText, 
    onSearchChange, 
    filteredCount, 
    totalCount 
  }) => {
    const handleSearchChange = useCallback((e) => {
      onSearchChange(e.target.value);
    }, [onSearchChange]);

    return (
      <div className="log-controls">
        <div className="log-level-toggles">
          <label className="toggle-group-label">Show levels:</label>
          <div className="toggle-buttons">
            {[
              { key: 'info', label: 'Info', icon: 'ℹ️' },
              { key: 'success', label: 'Success', icon: '✅' },
              { key: 'warning', label: 'Warning', icon: '⚠️' },
              { key: 'error', label: 'Error', icon: '❌' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                className={`log-toggle-btn ${logLevelToggles[key] ? 'active' : 'inactive'}`}
                onClick={() => onToggleLogLevel(key)}
                title={`Toggle ${label} messages`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="log-search-group">
          <label htmlFor="log-search">Search logs:</label>
          <input
            id="log-search"
            type="text"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Search log messages..."
            className="log-search-input"
          />
        </div>
        
        <div className="log-stats">
          {searchText || Object.values(logLevelToggles).some(v => !v) ? (
            <span>Showing {filteredCount} of {totalCount} logs</span>
          ) : (
            <span>{totalCount} logs</span>
          )}
        </div>
      </div>
    );
  });

  const handleSearchChange = useCallback((value) => {
    setSearchText(value);
  }, []);

  const viewFile = useCallback((file) => {
    setSelectedFile(file);
    setShowFileViewer(true);
  }, []);

  const closeFileViewer = useCallback(() => {
    setShowFileViewer(false);
    setSelectedFile(null);
  }, []);

  const getResourceTypeIcon = (type) => {
    switch (type) {
      case 'StructureDefinition': return '🏗️';
      case 'Patient': return '👤';
      case 'ValueSet': return '📊';
      case 'CodeSystem': return '🔢';
      case 'Organization': return '🏢';
      case 'Practitioner': return '👨‍⚕️';
      case 'Observation': return '📋';
      default: return '📄';
    }
  };

  const FileViewerModal = () => {
    if (!selectedFile) return null;

    return (
      <div className="file-viewer-overlay">
        <div className="file-viewer-modal">
          <div className="file-viewer-header">
            <h3>
              {getResourceTypeIcon(selectedFile.type)} {selectedFile.filename}
            </h3>
            <div className="file-viewer-actions">
              <button
                onClick={() => navigator.clipboard.writeText(selectedFile.content)}
                className="copy-file-btn"
                title="Copy file content to clipboard"
              >
                📋 Copy
              </button>
              <button
                onClick={closeFileViewer}
                className="close-file-viewer-btn"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="file-viewer-content">
            <SyntaxHighlighter
              language="json"
              style={oneLight}
              showLineNumbers={true}
              wrapLines={true}
              customStyle={{
                fontSize: '14px',
                lineHeight: '1.4',
                maxHeight: '70vh',
                overflow: 'auto'
              }}
            >
              {selectedFile.content}
            </SyntaxHighlighter>
          </div>
          <div className="file-viewer-footer">
            <span className="file-info">
              Resource Type: {selectedFile.type} | 
              Size: {(selectedFile.content.length / 1024).toFixed(1)} KB
            </span>
          </div>
        </div>
      </div>
    );
  };

  const LogModal = () => (
    <div className="sushi-modal-overlay">
      <div className="sushi-modal">
        <div className="sushi-modal-header">
          <h3>
            🍣 SUSHI Client-Side Execution 
            {includeStagingFiles && <span className="staging-badge">+ Staging</span>}
          </h3>
          <div className="modal-actions">
            <button 
              onClick={copyAllLogs}
              className="copy-all-btn"
              disabled={logs.length === 0}
              title="Copy all logs to clipboard"
            >
              📋 Copy All
            </button>
            <button 
              onClick={clearLogs}
              className="clear-logs-btn"
              disabled={isRunning}
            >
              🗑️ Clear
            </button>
            <button 
              onClick={() => setShowModal(false)}
              className="close-modal-btn"
            >
              ✕
            </button>
          </div>
        </div>
        
        <LogControls
          logLevelToggles={logLevelToggles}
          onToggleLogLevel={toggleLogLevel}
          searchText={searchText}
          onSearchChange={handleSearchChange}
          filteredCount={filteredLogs.length}
          totalCount={logs.length}
        />
        
        {generatedFiles.length > 0 && (
          <div className="modal-section-toggle">
            <div className="toggle-options">
              <button 
                className={`toggle-btn ${activeTab === 'logs' ? 'active' : ''}`}
                onClick={() => setActiveTab('logs')}
              >
                📄 Logs & Messages
              </button>
              <button 
                className={`toggle-btn ${activeTab === 'files' ? 'active' : ''}`}
                onClick={() => setActiveTab('files')}
              >
                📦 Generated Resources
              </button>
            </div>
            <div className="section-info">
              {activeTab === 'logs' ? (
                <span className="info-text">{logs.length} log entries • Use toggles to filter by level</span>
              ) : (
                <span className="info-text">{generatedFiles.length} FHIR resources generated</span>
              )}
            </div>
          </div>
        )}
        
        <div className="sushi-modal-content">
          {(activeTab === 'logs' || generatedFiles.length === 0) && (
            <div className="log-container">
              {filteredLogs.map(log => (
                <div key={log.id} className={`log-entry log-${log.type}`}>
                  <span className="log-timestamp">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="log-message">
                    {parseLogMessage(log.message, log.id)}
                  </span>
                  <button 
                    onClick={() => copyLogMessage(log.message)}
                    className="copy-log-btn"
                    title="Copy this message to clipboard"
                  >
                    📋
                  </button>
                </div>
              ))}
              
              {isRunning && (
                <div className="log-entry log-running">
                  <span className="log-timestamp">
                    {new Date().toLocaleTimeString()}
                  </span>
                  <span className="log-message">
                    <span className="spinner">⏳</span> Processing...
                  </span>
                  <div className="copy-log-btn-placeholder"></div>
                </div>
              )}
              
              {filteredLogs.length === 0 && !isRunning && logs.length > 0 && (
                <div className="log-placeholder">
                  No logs match the current filter criteria...
                </div>
              )}
              
              {logs.length === 0 && !isRunning && (
                <div className="log-placeholder">
                  Logs will appear here during SUSHI execution...
                </div>
              )}
              
              {error && (
                <div className="error-summary">
                  <h4>❌ Execution Error</h4>
                  <p>{error}</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'files' && generatedFiles.length > 0 && (
            <div className="generated-files-container">
              <div className="generated-files-section">
                <h4>📦 Generated FHIR Resources ({generatedFiles.length})</h4>
                <div className="generated-files-grid">
                  {generatedFiles.map((file, index) => (
                    <div key={index} className="generated-file-card">
                      <div className="file-card-header">
                        <span className="file-icon">{getResourceTypeIcon(file.type)}</span>
                        <span className="file-name">{file.filename}</span>
                      </div>
                      <div className="file-card-details">
                        <span className="file-type">{file.type}</span>
                        <span className="file-size">
                          {(file.content.length / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <div className="file-card-actions">
                        <button
                          onClick={() => viewFile(file)}
                          className="view-file-btn"
                          title="View resource content"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(file.content)}
                          className="copy-file-btn"
                          title="Copy to clipboard"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="fhir-viewer-suggestions">
                  <h5>💡 Enhanced FHIR Viewing Options</h5>
                  <p>For better FHIR resource visualization, consider these viewers:</p>
                  <ul>
                    <li><strong>FHIR Tree Viewer:</strong> <code>npm install @types/fhir</code> + custom tree renderer</li>
                    <li><strong>FHIR Path Viewer:</strong> <code>npm install fhirpath</code> for interactive querying</li>
                    <li><strong>FHIR UI:</strong> <code>npm install @asymmetrik/fhir-kit-client</code> with UI components</li>
                    <li><strong>HL7 FHIR Viewer:</strong> Integration with official HL7 FHIR viewers</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="sushi-modal-footer">
          <div className="execution-info">
            {isRunning ? (
              <span className="status-running">🔄 Running SUSHI...</span>
            ) : logs.length > 0 ? (
              <span className="status-complete">✅ Execution complete</span>
            ) : (
              <span className="status-ready">🍣 Ready to run SUSHI</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <SushiErrorBoundary>
      <div className="sushi-runner-section">
        <div 
          className={`sushi-status-bar ${isExpanded ? 'expanded' : 'collapsed'}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="status-bar-header">
            <span className="status-icon">🍣</span>
            <span className="status-title">SUSHI (FHIR Shorthand)</span>
            <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
          </div>
          
          {!isExpanded && (
            <div className="status-summary">
              Client-side FHIR Implementation Guide compilation
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="sushi-controls">
            <div className="sushi-description">
              <p>
                Run SUSHI (FHIR Shorthand) compilation directly in your browser to generate 
                FHIR Implementation Guide resources from FSH files.
              </p>
            </div>

            <div className="execution-options">
              <div className="execution-mode-selector">
                <h4>⚙️ Execution Mode</h4>
                <div className="mode-options">
                  <label className="mode-option">
                    <input 
                      type="radio" 
                      name="executionMode" 
                      value="auto" 
                      checked={executionMode === 'auto'}
                      onChange={(e) => setExecutionMode(e.target.value)}
                    />
                    <span className="mode-label">
                      🤖 Auto (WebAssembly when available)
                      {wasmSupported && wasmInitialized && <span className="wasm-badge">WASM Ready</span>}
                    </span>
                  </label>
                  
                  {wasmSupported && (
                    <label className="mode-option">
                      <input 
                        type="radio" 
                        name="executionMode" 
                        value="wasm" 
                        checked={executionMode === 'wasm'}
                        onChange={(e) => setExecutionMode(e.target.value)}
                        disabled={!wasmInitialized}
                      />
                      <span className="mode-label">
                        🚀 WebAssembly (High Performance)
                        {!wasmInitialized && <span className="loading-badge">Initializing...</span>}
                      </span>
                    </label>
                  )}
                  
                  <label className="mode-option">
                    <input 
                      type="radio" 
                      name="executionMode" 
                      value="javascript" 
                      checked={executionMode === 'javascript'}
                      onChange={(e) => setExecutionMode(e.target.value)}
                    />
                    <span className="mode-label">
                      ⚙️ JavaScript (Fallback)
                    </span>
                  </label>
                </div>
                
                {!wasmSupported && (
                  <div className="wasm-not-supported">
                    <p>⚠️ WebAssembly is not supported in this browser. JavaScript fallback will be used.</p>
                  </div>
                )}
              </div>

              <div className="option-group">
                <h4>📂 Repository Files Only</h4>
                <p>
                  Compile using sushi-config.yaml and input/fsh files from the GitHub repository ({selectedBranch} branch).
                </p>
                <button
                  className="run-sushi-btn primary"
                  onClick={() => handleRunSushi(false)}
                  disabled={isRunning}
                >
                  {isRunning ? '⏳ Running...' : '🚀 Run SUSHI'}
                </button>
              </div>

              {stagingFiles.length > 0 && (
                <div className="option-group">
                  <h4>🏗️ Repository + Staging Files</h4>
                  <p>
                    Compile using repository files, with staging ground files ({stagingFiles.length} files) 
                    overriding any repository files with the same name.
                  </p>
                  <button
                    className="run-sushi-btn secondary"
                    onClick={() => handleRunSushi(true)}
                    disabled={isRunning}
                  >
                    {isRunning ? '⏳ Running...' : '🚀 Run SUSHI + Staging'}
                  </button>
                </div>
              )}
            </div>

            <div className="sushi-status">
              <div className="status-item">
                <span className="label">Execution:</span>
                <span className="value">
                  {wasmSupported && wasmInitialized ? '🚀 WebAssembly Ready' : '⚙️ JavaScript'}
                </span>
              </div>
              <div className="status-item">
                <span className="label">Config:</span>
                <span className="value">{sushiConfig ? '✅ Found' : '❓ Unknown'}</span>
              </div>
              <div className="status-item">
                <span className="label">FSH Files:</span>
                <span className="value">{fshFiles.length} in repository</span>
              </div>
              {stagingFiles.length > 0 && (
                <div className="status-item">
                  <span className="label">Staging:</span>
                  <span className="value">{stagingFiles.filter(f => f.path && f.path.endsWith('.fsh')).length} FSH files</span>
                </div>
              )}
            </div>
          </div>
        )}

        {showModal && <LogModal />}
        {showFileViewer && <FileViewerModal />}
      </div>
    </SushiErrorBoundary>
  );
};

export default SushiRunner;