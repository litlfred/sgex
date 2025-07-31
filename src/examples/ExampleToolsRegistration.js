/**
 * Example Tool Registration
 * 
 * This file shows how to register tools with the framework and add them to the app routing
 */

import { toolRegistry } from '../components/framework';
import ValueSetEditor from '../components/ExampleValueSetEditor';
import RepositoryStatsDashboard from '../components/ExampleStatsDashboard';

// Tools are automatically registered when imported, but you can also manually register them:

// Get a tool by ID
const valueSetEditor = toolRegistry.get('value-set-editor');
const statsDashboard = toolRegistry.get('repository-stats');

// Export the tools for use in routing
export { ValueSetEditor, RepositoryStatsDashboard };

// Example of how to add these to your App.js routing:
/*

import { ValueSetEditor, RepositoryStatsDashboard } from './examples/ExampleToolsRegistration';

// In your App.js Routes:
<Routes>
  {/* Existing routes... */}
  
  {/* Example tools using the framework */}
  <Route path="/value-set-editor/:user/:repo/:branch/:asset" element={<ValueSetEditor />} />
  <Route path="/repository-stats/:user/:repo" element={<RepositoryStatsDashboard />} />
  <Route path="/repository-stats/:user/:repo/:branch" element={<RepositoryStatsDashboard />} />
  
  {/* Other routes... */}
</Routes>

*/

// You can also get tools programmatically:
export const getToolsForAsset = (assetPath) => {
  return toolRegistry.getByAssetType(assetPath);
};

export const getAllTools = () => {
  return toolRegistry.getAll();
};

export const getAccessibleTools = async () => {
  return await toolRegistry.getAccessibleTools();
};

// Example usage in a component:
/*

import { getToolsForAsset, getAccessibleTools } from './examples/ExampleToolsRegistration';

const MyComponent = () => {
  const [availableTools, setAvailableTools] = useState([]);
  
  useEffect(() => {
    const loadTools = async () => {
      const tools = await getAccessibleTools();
      setAvailableTools(tools);
    };
    loadTools();
  }, []);
  
  const handleAssetEdit = (assetPath) => {
    const supportedTools = getToolsForAsset(assetPath);
    if (supportedTools.length > 0) {
      // Navigate to the first supported tool
      const tool = supportedTools[0];
      navigate(`/${tool.id}/${user}/${repo}/${branch}/${assetPath}`);
    }
  };
  
  return (
    <div>
      <h2>Available Tools</h2>
      {availableTools.map(tool => (
        <div key={tool.id}>
          <h3>{tool.title}</h3>
          <p>{tool.description}</p>
        </div>
      ))}
    </div>
  );
};

*/

console.log('Example tools registered:', {
  valueSetEditor: valueSetEditor?.title,
  statsDashboard: statsDashboard?.title,
  totalTools: toolRegistry.getAll().length
});