/**
 * Tool Definition Framework
 * 
 * Provides a simple API for creating new tools in the SGEX Workbench.
 * Handles page setup, user access, data management, and UI integration.
 */

import React from 'react';
import { PageLayout, AssetEditorLayout } from './index';
import { usePageParams } from './usePageParams';
import userAccessService from '../../services/userAccessService';
import dataAccessLayer from '../../services/dataAccessLayer';

/**
 * Tool types supported by the framework
 */
export const TOOL_TYPES = {
  VIEWER: 'viewer',        // Read-only asset viewer
  EDITOR: 'editor',        // Asset editor with save capabilities
  DASHBOARD: 'dashboard',  // DAK-level dashboard
  UTILITY: 'utility'       // General utility tool
};

/**
 * Base tool definition interface
 */
export class ToolDefinition {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.title = config.title || config.name;
    this.description = config.description;
    this.type = config.type || TOOL_TYPES.UTILITY;
    this.route = config.route || `/${this.id}`;
    this.icon = config.icon;
    this.category = config.category || 'general';
    
    // Access requirements
    this.requiresAuth = config.requiresAuth !== false; // Default to true
    this.supportsDemo = config.supportsDemo !== false; // Default to true
    this.requiresDAK = config.requiresDAK || false;
    
    // Asset handling
    this.assetTypes = config.assetTypes || [];
    this.assetPattern = config.assetPattern;
    
    // UI components
    this.viewerComponent = config.viewerComponent;
    this.editorComponent = config.editorComponent;
    this.dashboardComponent = config.dashboardComponent;
    
    // Hooks
    this.onInit = config.onInit;
    this.onAssetLoad = config.onAssetLoad;
    this.onAssetSave = config.onAssetSave;
    this.onError = config.onError;
  }

  /**
   * Check if tool supports the given asset type
   */
  supportsAsset(assetPath) {
    if (!this.assetTypes?.length && !this.assetPattern) {
      return true; // Tool accepts any asset
    }
    
    if (this.assetPattern) {
      return new RegExp(this.assetPattern).test(assetPath);
    }
    
    return this.assetTypes.some(type => assetPath.includes(type));
  }

  /**
   * Check if current user can access this tool
   */
  async canAccess() {
    if (this.requiresAuth && userAccessService.isUnauthenticated()) {
      return false;
    }
    
    return true;
  }

  /**
   * Generate React component for this tool
   */
  createComponent() {
    const toolDef = this;
    
    return function ToolComponent(props) {
      return <ToolWrapper toolDefinition={toolDef} {...props} />;
    };
  }
}

/**
 * Wrapper component that handles framework integration
 */
const ToolWrapper = ({ toolDefinition, ...props }) => {
  const pageParams = usePageParams();
  const [toolState, setToolState] = React.useState({
    loading: true,
    error: null,
    canAccess: false,
    assets: [],
    content: null
  });

  const initializeTool = React.useCallback(async () => {
    try {
      setToolState(prev => ({ ...prev, loading: true, error: null }));

      // Check access
      const canAccess = await toolDefinition.canAccess();
      if (!canAccess) {
        throw new Error(`Access denied: This tool requires ${toolDefinition.requiresAuth ? 'authentication' : 'different user type'}`);
      }

      // Initialize data access layer if needed
      if (pageParams.repository) {
        await dataAccessLayer.initialize(pageParams.repository, pageParams.branch);
      }

      // Load assets if this is an asset tool
      let assets = [];
      let content = null;
      
      if (pageParams.asset && (toolDefinition.type === TOOL_TYPES.VIEWER || toolDefinition.type === TOOL_TYPES.EDITOR)) {
        if (toolDefinition.supportsAsset(pageParams.asset)) {
          const assetData = await dataAccessLayer.getAsset(
            pageParams.user,
            pageParams.repository?.name,
            pageParams.branch,
            pageParams.asset
          );
          assets = [{ path: pageParams.asset, ...assetData }];
          content = assetData.content;
        } else {
          throw new Error(`This tool does not support asset type: ${pageParams.asset}`);
        }
      }

      // Call tool's initialization hook
      if (toolDefinition.onInit) {
        await toolDefinition.onInit({
          pageParams,
          assets,
          content
        });
      }

      setToolState({
        loading: false,
        error: null,
        canAccess: true,
        assets,
        content
      });

    } catch (error) {
      console.error(`Error initializing tool ${toolDefinition.id}:`, error);
      setToolState({
        loading: false,
        error: error.message,
        canAccess: false,
        assets: [],
        content: null
      });

      // Call tool's error hook
      if (toolDefinition.onError) {
        toolDefinition.onError(error, { pageParams });
      }
    }
  }, [toolDefinition, pageParams]);

  React.useEffect(() => {
    initializeTool();
  }, [initializeTool]);

  const handleAssetSave = async (newContent, saveType) => {
    if (!pageParams.asset) return;

    try {
      let result;
      if (saveType === 'local') {
        result = await dataAccessLayer.saveAssetLocal(pageParams.asset, newContent);
      } else if (saveType === 'github') {
        // This should be called with commit message from UI
        throw new Error('GitHub save requires commit message - use handleGitHubSave instead');
      }

      // Call tool's save hook
      if (toolDefinition.onAssetSave) {
        await toolDefinition.onAssetSave({
          asset: pageParams.asset,
          content: newContent,
          saveType,
          result,
          pageParams
        });
      }

      return result;
    } catch (error) {
      console.error(`Error saving asset in tool ${toolDefinition.id}:`, error);
      throw error;
    }
  };

  const handleGitHubSave = async (newContent, commitMessage) => {
    if (!pageParams.asset) return;

    try {
      const result = await dataAccessLayer.saveAssetGitHub(
        pageParams.user,
        pageParams.repository?.name,
        pageParams.branch,
        pageParams.asset,
        newContent,
        commitMessage
      );

      // Call tool's save hook
      if (toolDefinition.onAssetSave) {
        await toolDefinition.onAssetSave({
          asset: pageParams.asset,
          content: newContent,
          saveType: 'github',
          result,
          commitMessage,
          pageParams
        });
      }

      return result;
    } catch (error) {
      console.error(`Error saving asset to GitHub in tool ${toolDefinition.id}:`, error);
      throw error;
    }
  };

  // Show loading state
  if (toolState.loading) {
    return (
      <PageLayout pageName={toolDefinition.id}>
        <div className="tool-loading">
          <h2>Loading {toolDefinition.title}...</h2>
          <p>Initializing tool and checking access permissions.</p>
        </div>
      </PageLayout>
    );
  }

  // Show error state
  if (toolState.error || !toolState.canAccess) {
    return (
      <PageLayout pageName={toolDefinition.id}>
        <div className="tool-error">
          <h2>Cannot Access {toolDefinition.title}</h2>
          <p>{toolState.error || 'Access denied'}</p>
          <button onClick={() => window.history.back()}>
            Go Back
          </button>
        </div>
      </PageLayout>
    );
  }

  // Render appropriate component based on tool type
  const renderToolContent = () => {
    const commonProps = {
      toolDefinition,
      pageParams,
      toolState,
      onAssetSave: handleAssetSave,
      onGitHubSave: handleGitHubSave,
      ...props
    };

    switch (toolDefinition.type) {
      case TOOL_TYPES.EDITOR:
        if (toolDefinition.editorComponent) {
          const EditorComponent = toolDefinition.editorComponent;
          
          if (pageParams.asset && toolState.assets.length > 0) {
            // Use AssetEditorLayout for asset editors
            return (
              <AssetEditorLayout
                pageName={toolDefinition.id}
                file={{ name: pageParams.asset, path: pageParams.asset }}
                repository={pageParams.repository}
                branch={pageParams.branch}
                content={toolState.content}
                originalContent={toolState.assets[0]?.content}
                hasChanges={false} // Will be managed by the editor component
                onSave={handleAssetSave}
                onContentChange={(content) => {
                  setToolState(prev => ({ ...prev, content }));
                }}
              >
                <EditorComponent {...commonProps} />
              </AssetEditorLayout>
            );
          } else {
            // General editor without specific asset
            return (
              <PageLayout pageName={toolDefinition.id}>
                <EditorComponent {...commonProps} />
              </PageLayout>
            );
          }
        }
        break;

      case TOOL_TYPES.VIEWER:
        if (toolDefinition.viewerComponent) {
          const ViewerComponent = toolDefinition.viewerComponent;
          return (
            <PageLayout pageName={toolDefinition.id}>
              <ViewerComponent {...commonProps} />
            </PageLayout>
          );
        }
        break;

      case TOOL_TYPES.DASHBOARD:
        if (toolDefinition.dashboardComponent) {
          const DashboardComponent = toolDefinition.dashboardComponent;
          return (
            <PageLayout pageName={toolDefinition.id}>
              <DashboardComponent {...commonProps} />
            </PageLayout>
          );
        }
        break;

      case TOOL_TYPES.UTILITY:
      default:
        // Use viewer component as fallback, or dashboard component
        const Component = toolDefinition.viewerComponent || 
                         toolDefinition.editorComponent || 
                         toolDefinition.dashboardComponent;
        
        if (Component) {
          return (
            <PageLayout pageName={toolDefinition.id}>
              <Component {...commonProps} />
            </PageLayout>
          );
        }
        break;
    }

    // Fallback if no component is provided
    return (
      <PageLayout pageName={toolDefinition.id}>
        <div className="tool-fallback">
          <h1>{toolDefinition.title}</h1>
          <p>{toolDefinition.description}</p>
          <p>No component defined for this tool.</p>
        </div>
      </PageLayout>
    );
  };

  return renderToolContent();
};

/**
 * Registry for managing tool definitions
 */
class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  /**
   * Register a new tool
   */
  register(config) {
    const tool = new ToolDefinition(config);
    this.tools.set(tool.id, tool);
    return tool;
  }

  /**
   * Get tool by ID
   */
  get(id) {
    return this.tools.get(id);
  }

  /**
   * Get all tools
   */
  getAll() {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by category
   */
  getByCategory(category) {
    return this.getAll().filter(tool => tool.category === category);
  }

  /**
   * Get tools that support a specific asset type
   */
  getByAssetType(assetPath) {
    return this.getAll().filter(tool => tool.supportsAsset(assetPath));
  }

  /**
   * Get tools accessible by current user
   */
  async getAccessibleTools() {
    const tools = this.getAll();
    const accessibleTools = [];

    for (const tool of tools) {
      if (await tool.canAccess()) {
        accessibleTools.push(tool);
      }
    }

    return accessibleTools;
  }
}

// Create singleton registry
const toolRegistry = new ToolRegistry();

/**
 * Helper function to create a simple tool
 */
export const createTool = (config) => {
  return toolRegistry.register(config);
};

/**
 * Helper function to create an asset editor tool
 */
export const createAssetEditor = (config) => {
  return createTool({
    ...config,
    type: TOOL_TYPES.EDITOR,
    requiresDAK: true
  });
};

/**
 * Helper function to create an asset viewer tool
 */
export const createAssetViewer = (config) => {
  return createTool({
    ...config,
    type: TOOL_TYPES.VIEWER,
    requiresDAK: true,
    requiresAuth: false // Viewers can be used by unauthenticated users
  });
};

/**
 * Helper function to create a dashboard tool
 */
export const createDashboard = (config) => {
  return createTool({
    ...config,
    type: TOOL_TYPES.DASHBOARD,
    requiresDAK: true
  });
};

export default toolRegistry;