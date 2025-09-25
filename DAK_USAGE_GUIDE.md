# DAK Object Usage Guide

This guide demonstrates how to use the DAK object with three storage interfaces: GitHub remote repositories, Git local directories, and staging ground storage.

## Module/Package Dependencies

The DAK architecture follows this dependency hierarchy:

```
@sgex/dak-core (pure business logic, no dependencies)
├── @sgex/utils (lazy loading, factories)
├── @sgex/storage-services (caching, bookmarks, local storage) 
├── @sgex/vcs-services (GitHub operations)
└── @sgex/web-services (React UI components)
```

### Package Roles:

- **@sgex/dak-core**: Core DAK business logic, validation, WHO SMART Guidelines integration
- **@sgex/storage-services**: Browser localStorage, caching, bookmark management
- **@sgex/vcs-services**: Git/GitHub operations, authentication, repository management
- **@sgex/utils**: Lazy loading, factory patterns, performance optimization

## DAK Object Lifecycle Example

### Scenario: Working with BPMN Asset `input/bpmn/example.bpmn`

```typescript
import { DAKService, DAKRepository, DAKAssetType } from '@sgex/dak-core';
import { RepositoryCacheService, LocalStorageService } from '@sgex/storage-services';
import { GitHubRepositoryService } from '@sgex/vcs-services';

// 1. INITIALIZATION
const dakService = new DAKService();
const cacheService = new RepositoryCacheService();
const localStorage = new LocalStorageService();
const githubService = new GitHubRepositoryService();

// Asset we want to work with
const myAsset = "input/bpmn/example.bpmn";
const updateMessage = "i like this better";

// 2. STORAGE INTERFACE CONFIGURATIONS

// Interface 1: GitHub Remote Repository
const gitHubDAK: DAKRepository = dakService.fromGitHubRepository(
  'WorldHealthOrganization', 
  'smart-immunizations', 
  'main'
);

// Interface 2: Git Local Directory  
const localDAK: DAKRepository = await dakService.fromLocalRepository(
  '/path/to/local/immunizations-dak'
);

// Interface 3: Staging Ground (browser localStorage)
const stagingDAK: DAKRepository = dakService.fromGitHubRepository(
  'my-org',
  'my-dak-fork',
  'feature-branch'
);

async function fullLifecycleExample() {
  console.log("=== DAK Object Full Lifecycle Example ===");
  
  // 3. INITIALIZATION AND VALIDATION
  console.log("1. Initializing DAK objects...");
  
  // Initialize validation for each storage type
  const [gitHubValidation, localValidation, stagingValidation] = await Promise.all([
    dakService.validateRepository(gitHubDAK),
    dakService.validateRepository(localDAK), 
    dakService.validateRepository(stagingDAK)
  ]);
  
  console.log("GitHub DAK valid:", gitHubValidation.isValid);
  console.log("Local DAK valid:", localValidation.isValid);
  console.log("Staging DAK valid:", stagingValidation.isValid);
  
  // 4. CHECK STAGING/STORAGE FOR EXISTING ASSET
  console.log("\n2. Checking for existing asset in storage...");
  
  // Check localStorage (staging ground)
  const stagedContent = localStorage.getLocalContent(myAsset);
  if (stagedContent) {
    console.log("✓ Found staged version in localStorage");
  }
  
  // Check repository cache
  const cachedRepo = cacheService.getRepository(stagingDAK.owner, stagingDAK.repo);
  if (cachedRepo) {
    console.log("✓ Found cached repository data");
  }
  
  // Check if asset exists in any of the DAK repositories
  const [gitHubAssets, localAssets, stagingAssets] = await Promise.all([
    dakService.getAssets(gitHubDAK, DAKAssetType.BPMN),
    dakService.getAssets(localDAK, DAKAssetType.BPMN),
    dakService.getAssets(stagingDAK, DAKAssetType.BPMN)
  ]);
  
  const assetExists = {
    github: gitHubAssets.includes(myAsset),
    local: localAssets.includes(myAsset), 
    staging: stagingAssets.includes(myAsset)
  };
  
  console.log("Asset exists in:", assetExists);
  
  // 5. RETRIEVE EXISTING ASSET (if found)
  let currentContent = null;
  
  if (stagedContent) {
    // Priority 1: Use staged content
    currentContent = stagedContent;
    console.log("Retrieved from staging ground");
  } else if (assetExists.local) {
    // Priority 2: Use local repository
    currentContent = await getFileContent(localDAK, myAsset);
    console.log("Retrieved from local repository");
  } else if (assetExists.github) {
    // Priority 3: Use GitHub repository
    currentContent = await githubService.getFileContent(
      gitHubDAK.owner, 
      gitHubDAK.repo, 
      myAsset, 
      gitHubDAK.branch
    );
    console.log("Retrieved from GitHub repository");
  }
  
  // 6. UPDATE ASSET WITH NEW CONTENT
  console.log("\n3. Updating asset...");
  
  // Simulate updating the BPMN content
  const updatedContent = updateBPMNContent(currentContent, updateMessage);
  
  // 7. VALIDATION SERVICES
  console.log("\n4. Validating updated content...");
  
  try {
    // Save to temporary file for validation
    const tempPath = `/tmp/${Date.now()}_example.bpmn`;
    await saveTemporaryFile(tempPath, updatedContent);
    
    // Validate the updated asset
    const validationResult = await dakService.validateComponentFile(
      stagingDAK,
      myAsset,
      DAKComponentType.BUSINESS_PROCESSES
    );
    
    if (!validationResult.isValid) {
      console.error("Validation failed:", validationResult.errors);
      throw new Error("Asset validation failed");
    }
    
    console.log("✓ Asset validation passed");
    
    // 8. SAVE TO STORAGE WITH ERROR HANDLING
    console.log("\n5. Saving to storage...");
    
    try {
      // Save to staging ground (localStorage)
      localStorage.saveLocal(myAsset, updatedContent, {
        repository: `${stagingDAK.owner}/${stagingDAK.repo}`,
        branch: stagingDAK.branch,
        lastModified: new Date().toISOString(),
        message: updateMessage
      });
      console.log("✓ Saved to staging ground");
      
      // Update repository cache
      cacheService.cacheRepository(stagingDAK.owner, stagingDAK.repo, {
        ...stagingDAK,
        lastUpdated: new Date(),
        modifiedFiles: [myAsset]
      });
      console.log("✓ Updated repository cache");
      
      // For local repository, write directly to file system
      if (assetExists.local) {
        await saveToLocalRepository(localDAK, myAsset, updatedContent);
        console.log("✓ Saved to local repository");
      }
      
      // For GitHub repository, this would require authentication and commit
      if (assetExists.github) {
        console.log("📝 GitHub save would require authentication and commit");
        // await githubService.updateFile(gitHubDAK.owner, gitHubDAK.repo, myAsset, updatedContent, updateMessage);
      }
      
    } catch (storageError) {
      console.error("Storage error:", storageError);
      
      // Error recovery strategies
      if (storageError.code === 'QUOTA_EXCEEDED') {
        // Clear old cache entries
        cacheService.clearExpiredEntries();
        // Retry save
        localStorage.saveLocal(myAsset, updatedContent);
      } else if (storageError.code === 'NETWORK_ERROR') {
        // Save locally and mark for later sync
        localStorage.saveLocal(myAsset, updatedContent, { 
          pendingSync: true,
          syncTarget: 'github'
        });
      } else {
        throw storageError; // Re-throw if we can't handle it
      }
    }
    
    // 9. FINAL VALIDATION AND SUMMARY
    console.log("\n6. Final validation...");
    
    const finalValidation = await dakService.validateRepository(stagingDAK);
    if (finalValidation.isValid) {
      console.log("✅ DAK repository remains valid after update");
    } else {
      console.warn("⚠️ DAK repository validation issues:", finalValidation.warnings);
    }
    
    // Get updated DAK summary
    const summary = await dakService.getSummary(stagingDAK);
    console.log("\nDAK Summary:", {
      components: summary.components.length,
      bpmnAssets: summary.assetCounts[DAKAssetType.BPMN],
      isValid: summary.isValid,
      lastValidated: summary.lastValidated
    });
    
  } catch (error) {
    console.error("Lifecycle error:", error);
    
    // Rollback staging changes if validation failed
    if (stagedContent) {
      localStorage.removeLocal(myAsset);
      console.log("🔄 Rolled back staged changes");
    }
    
    throw error;
  }
}

// Helper Functions

async function getFileContent(dakRepo: DAKRepository, filePath: string): Promise<string> {
  // Implementation depends on storage type
  if (dakRepo.owner === 'local') {
    const fs = await import('fs/promises');
    const path = await import('path');
    const fullPath = path.join(dakRepo.repo, filePath);
    return await fs.readFile(fullPath, 'utf-8');
  } else {
    // For remote repositories, use GitHub service
    const githubService = new GitHubRepositoryService();
    return await githubService.getFileContent(dakRepo.owner, dakRepo.repo, filePath, dakRepo.branch);
  }
}

function updateBPMNContent(existingContent: string | null, message: string): string {
  // Simple BPMN content update simulation
  const baseContent = existingContent || `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL">
  <bpmn:process id="example_process" isExecutable="false">
    <bpmn:startEvent id="start"/>
    <bpmn:endEvent id="end"/>
  </bpmn:process>
</bpmn:definitions>`;
  
  // Add comment with update message
  return baseContent.replace(
    '<bpmn:definitions',
    `<!-- Updated: ${message} at ${new Date().toISOString()} -->\n<bpmn:definitions`
  );
}

async function saveTemporaryFile(path: string, content: string): Promise<void> {
  const fs = await import('fs/promises');
  await fs.writeFile(path, content, 'utf-8');
}

async function saveToLocalRepository(dakRepo: DAKRepository, filePath: string, content: string): Promise<void> {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  const fullPath = path.join(dakRepo.repo, filePath);
  const dir = path.dirname(fullPath);
  
  // Ensure directory exists
  await fs.mkdir(dir, { recursive: true });
  
  // Write file
  await fs.writeFile(fullPath, content, 'utf-8');
}

// Export for usage
export { fullLifecycleExample, DAKService, DAKRepository, DAKAssetType };
```

## Storage Interface Details

### 1. GitHub Remote Repository

```typescript
// Configuration
const gitHubDAK = dakService.fromGitHubRepository('owner', 'repo', 'branch');

// Requires authentication for write operations
// Uses @sgex/vcs-services for GitHub API calls
// Automatic caching via @sgex/storage-services
```

### 2. Git Local Directory

```typescript
// Configuration  
const localDAK = await dakService.fromLocalRepository('/path/to/local/repo');

// Direct file system access
// No authentication required
// Immediate validation possible
```

### 3. Staging Ground (localStorage)

```typescript
// Configuration
const stagingDAK = dakService.fromGitHubRepository('org', 'repo', 'feature-branch');

// Uses browser localStorage for temporary storage
// Supports offline editing
// Automatic metadata tracking
// Error recovery mechanisms
```

## Error Handling Strategies

### Storage Quota Exceeded
```typescript
try {
  localStorage.saveLocal(asset, content);
} catch (error) {
  if (error.code === 'QUOTA_EXCEEDED') {
    cacheService.clearExpiredEntries();
    localStorage.saveLocal(asset, content); // Retry
  }
}
```

### Network Errors
```typescript
try {
  await githubService.updateFile(owner, repo, path, content);
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    // Save locally and mark for sync
    localStorage.saveLocal(asset, content, { pendingSync: true });
  }
}
```

### Validation Failures
```typescript
const validation = await dakService.validateComponentFile(dak, path, component);
if (!validation.isValid) {
  // Rollback changes
  localStorage.removeLocal(asset);
  throw new ValidationError(validation.errors);
}
```

## Performance Considerations

1. **Lazy Loading**: Assets are loaded on-demand using @sgex/utils
2. **Caching**: Repository data cached for 24 hours via @sgex/storage-services  
3. **Validation**: Only validate changed components to avoid overhead
4. **Staging**: Use localStorage for rapid prototyping before committing

This architecture provides a robust, scalable approach to DAK asset management across multiple storage interfaces while maintaining WHO SMART Guidelines compliance.