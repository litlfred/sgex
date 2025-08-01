import React, { useState } from 'react';
import CompactBranchSelector from './CompactBranchSelector';

// Mock the githubService for demo purposes
const mockGithubService = {
  getBranches: () => Promise.resolve([
    { name: 'main' },
    { name: 'develop' },
    { name: 'feature/user-management' },
    { name: 'feature/api-integration' },
    { name: 'bugfix/login-issue' },
    { name: 'hotfix/security-patch' },
    { name: 'release/v1.2.0' }
  ])
};

// Replace the real service with the mock for demo
jest.mock('../services/githubService', () => mockGithubService);

const BranchSelectorDemo = () => {
  const [selectedBranch, setSelectedBranch] = useState('main');

  const mockRepository = {
    name: 'demo-repository',
    owner: { login: 'demo-user' },
    default_branch: 'main'
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Compact Branch Selector Demo</h1>
      <div style={{ 
        background: '#f8f9fa', 
        padding: '15px', 
        border: '1px solid #dee2e6', 
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 'bold', color: '#006cbe' }}>demo-user</span>
          <span style={{ color: '#006cbe' }}>/</span>
          <span style={{ fontWeight: 'bold', color: '#006cbe' }}>demo-repository</span>
          <span style={{ color: '#006cbe' }}>@</span>
          <CompactBranchSelector
            repository={mockRepository}
            selectedBranch={selectedBranch}
            onBranchChange={setSelectedBranch}
          />
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Features Demonstrated:</h3>
        <ul>
          <li>✅ Compact dropdown interface</li>
          <li>✅ Alphabetical sorting of branches</li>
          <li>✅ Search/filter functionality</li>
          <li>✅ Default branch highlighting</li>
          <li>✅ Keyboard navigation support</li>
          <li>✅ Click outside to close</li>
          <li>✅ Responsive design</li>
        </ul>
        
        <p><strong>Selected Branch:</strong> <code>{selectedBranch}</code></p>
        
        <div style={{ 
          background: '#e3f2fd', 
          padding: '10px', 
          border: '1px solid #006cbe', 
          borderRadius: '4px',
          marginTop: '15px'
        }}>
          <strong>Try it:</strong> Click on the branch selector above to see the dropdown with search functionality!
        </div>
      </div>
    </div>
  );
};

export default BranchSelectorDemo;