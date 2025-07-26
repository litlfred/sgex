import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the DAKSelection component's scanning display
const ScanningStatusComponent = ({ scanProgress, currentlyScanningRepos = new Set() }) => {
  if (!scanProgress) return null;

  return (
    <div className="scanning-status">
      <div className="scanning-header">
        <div className="spinner"></div>
        <h3>Scanning repositories for SMART Guidelines compatibility...</h3>
      </div>
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${scanProgress.progress}%` }}
          ></div>
        </div>
        <div className="progress-info">
          {/* Show currently scanning repositories */}
          {currentlyScanningRepos.size > 0 && (
            <div className="currently-scanning-section">
              <div className="scanning-section-title">
                <span className="scanning-icon">🔍</span>
                <span>Currently Testing:</span>
              </div>
              <div className="currently-scanning-repos">
                {Array.from(currentlyScanningRepos).map((repoName) => (
                  <div key={repoName} className="scanning-repo-item">
                    <span className="repo-status-indicator">⚡</span>
                    <span className="scanning-repo-name">{repoName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Show most recent progress update */}
          <div className="current-repo-status">
            <span className="status-icon">
              {scanProgress.completed ? '✅' : '🔍'}
            </span>
            <span className="current-repo-name">
              {scanProgress.completed ? 'Completed' : 'Testing'}: <strong>{scanProgress.currentRepo}</strong>
            </span>
          </div>
          
          <div className="progress-stats">
            <span className="progress-text">
              {scanProgress.current}/{scanProgress.total} repositories
            </span>
            <span className="progress-percentage">{scanProgress.progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

describe('Enhanced DAK Scanning Display', () => {
  it('should display repository names prominently during scanning', () => {
    const mockScanProgress = {
      current: 2,
      total: 5,
      currentRepo: 'maternal-health-dak',
      progress: 40,
      completed: false
    };
    
    const currentlyScanning = new Set(['maternal-health-dak', 'immunization-dak']);
    
    render(
      <ScanningStatusComponent 
        scanProgress={mockScanProgress} 
        currentlyScanningRepos={currentlyScanning}
      />
    );
    
    // Check that the scanning header is present
    expect(screen.getByText('Scanning repositories for SMART Guidelines compatibility...')).toBeInTheDocument();
    
    // Check that the "Currently Testing" section is visible
    expect(screen.getByText('Currently Testing:')).toBeInTheDocument();
    
    // Check that repository names are prominently displayed in the scanning section
    expect(screen.getAllByText('maternal-health-dak')).toHaveLength(2); // Should appear twice: once in currently scanning, once in status
    expect(screen.getByText('immunization-dak')).toBeInTheDocument();
    
    // Check that progress information is displayed
    expect(screen.getByText('2/5 repositories')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('should show repository status with appropriate icons', () => {
    const mockScanProgress = {
      current: 3,
      total: 5,
      currentRepo: 'anc-dak',
      progress: 60,
      completed: true
    };
    
    render(<ScanningStatusComponent scanProgress={mockScanProgress} />);
    
    // Check that the check mark icon is present for completed
    expect(screen.getByText('✅')).toBeInTheDocument();
    
    // Check that the repository name is strongly emphasized
    expect(screen.getByText('anc-dak', { selector: 'strong' })).toBeInTheDocument();
  });

  it('should handle concurrent repository scanning display', () => {
    const mockScanProgress = {
      current: 1,
      total: 3,
      currentRepo: 'test-repo',
      progress: 33,
      completed: false
    };
    
    const currentlyScanning = new Set(['repo-1', 'repo-2', 'repo-3']);
    
    render(
      <ScanningStatusComponent 
        scanProgress={mockScanProgress} 
        currentlyScanningRepos={currentlyScanning}
      />
    );
    
    // All three repositories should be shown as currently being tested
    expect(screen.getByText('repo-1')).toBeInTheDocument();
    expect(screen.getByText('repo-2')).toBeInTheDocument();
    expect(screen.getByText('repo-3')).toBeInTheDocument();
    
    // Should show the lightning bolt indicators for active scanning
    expect(screen.getAllByText('⚡')).toHaveLength(3);
  });
});