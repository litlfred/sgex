/**
 * Example Tool - Repository Statistics Dashboard
 * 
 * This demonstrates how to create a dashboard tool using the new framework
 */

import React, { useState, useEffect } from 'react';
import { createDashboard } from '../framework';
import dataAccessLayer from '../../services/dataAccessLayer';
import userAccessService from '../../services/userAccessService';

// The dashboard component
const RepositoryStatsDashboard = ({ 
  toolDefinition, 
  pageParams, 
  toolState 
}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    loadStatistics();
    loadUserInfo();
  }, [pageParams.repository]);

  const loadStatistics = async () => {
    if (!pageParams.repository) return;

    try {
      setLoading(true);
      
      // In a real implementation, this would gather statistics
      // For demo purposes, we'll create mock statistics
      const mockStats = {
        totalAssets: 15,
        valuesSets: 8,
        actors: 3,
        businessProcesses: 4,
        lastModified: new Date().toISOString(),
        contributors: ['user1', 'user2', 'user3'],
        branches: ['main', 'develop', 'feature/new-guidelines'],
        recentChanges: [
          { file: 'input/vocabulary/ValueSet-anc-care-codes.json', type: 'modified', date: '2024-01-20' },
          { file: 'input/actors/Patient.json', type: 'added', date: '2024-01-19' },
          { file: 'input/bpmn/anc-workflow.bpmn', type: 'modified', date: '2024-01-18' }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserInfo = async () => {
    const userType = userAccessService.getUserType();
    const currentUser = userAccessService.getCurrentUser();
    const accessInfo = await dataAccessLayer.getAccessInfo(
      pageParams.repository?.owner?.login,
      pageParams.repository?.name,
      pageParams.branch
    );

    setUserInfo({
      type: userType,
      user: currentUser,
      access: accessInfo
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading Repository Statistics...</h2>
        <p>Analyzing {pageParams.repository?.name}...</p>
      </div>
    );
  }

  return (
    <div className="repository-stats-dashboard">
      <div className="dashboard-header">
        <h1>Repository Statistics</h1>
        <p>Statistics for {pageParams.repository?.full_name} (branch: {pageParams.branch})</p>
      </div>

      {/* User Access Information */}
      <div className="user-access-panel">
        <h2>Your Access Level</h2>
        <div className="access-info">
          <div className="user-type">
            <strong>User Type:</strong> {userInfo?.type}
            {userInfo?.type === 'demo' && <span className="demo-badge">DEMO MODE</span>}
          </div>
          <div className="access-level">
            <strong>Access:</strong> {userInfo?.access?.badge?.text}
            <span className={`access-icon ${userInfo?.access?.badge?.color}`}>
              {userInfo?.access?.badge?.icon}
            </span>
          </div>
          <div className="save-capabilities">
            <strong>Save Options:</strong>
            <ul>
              <li>Local Storage: {userInfo?.access?.saveOptions?.canSaveLocal ? '✅ Available' : '❌ Not Available'}</li>
              <li>GitHub: {userInfo?.access?.saveOptions?.canSaveGitHub ? '✅ Available' : '❌ Not Available'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Repository Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Assets</h3>
          <div className="stat-number">{stats.totalAssets}</div>
        </div>

        <div className="stat-card">
          <h3>Value Sets</h3>
          <div className="stat-number">{stats.valuesSets}</div>
        </div>

        <div className="stat-card">
          <h3>Actors</h3>
          <div className="stat-number">{stats.actors}</div>
        </div>

        <div className="stat-card">
          <h3>Business Processes</h3>
          <div className="stat-number">{stats.businessProcesses}</div>
        </div>
      </div>

      {/* Recent Changes */}
      <div className="recent-changes">
        <h2>Recent Changes</h2>
        <div className="changes-list">
          {stats.recentChanges.map((change, index) => (
            <div key={index} className="change-item">
              <div className="change-type">
                <span className={`change-badge ${change.type}`}>
                  {change.type}
                </span>
              </div>
              <div className="change-file">{change.file}</div>
              <div className="change-date">{change.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Branches */}
      <div className="branches-section">
        <h2>Available Branches</h2>
        <div className="branches-list">
          {stats.branches.map((branch, index) => (
            <span key={index} className={`branch-tag ${branch === pageParams.branch ? 'current' : ''}`}>
              {branch}
              {branch === pageParams.branch && ' (current)'}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .repository-stats-dashboard {
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .dashboard-loading {
          text-align: center;
          padding: 2rem;
        }

        .user-access-panel {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 2rem;
        }

        .access-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .demo-badge {
          background: #ffc107;
          color: #212529;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          margin-left: 0.5rem;
        }

        .access-icon {
          margin-left: 0.5rem;
        }

        .access-icon.green { color: #28a745; }
        .access-icon.blue { color: #007bff; }
        .access-icon.red { color: #dc3545; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .stat-card h3 {
          margin: 0 0 1rem 0;
          color: #6c757d;
          font-size: 0.9rem;
          text-transform: uppercase;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #495057;
        }

        .recent-changes {
          margin-bottom: 2rem;
        }

        .changes-list {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          overflow: hidden;
        }

        .change-item {
          display: grid;
          grid-template-columns: 100px 1fr 100px;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid #dee2e6;
          align-items: center;
        }

        .change-item:last-child {
          border-bottom: none;
        }

        .change-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: bold;
        }

        .change-badge.modified {
          background: #ffc107;
          color: #212529;
        }

        .change-badge.added {
          background: #28a745;
          color: white;
        }

        .change-badge.deleted {
          background: #dc3545;
          color: white;
        }

        .change-file {
          font-family: monospace;
          font-size: 0.9rem;
        }

        .change-date {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .branches-section {
          margin-bottom: 2rem;
        }

        .branches-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .branch-tag {
          background: #e9ecef;
          color: #495057;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .branch-tag.current {
          background: #007bff;
          color: white;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .change-item {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

// Create the dashboard tool using the framework
const RepositoryStatsDashboard_Tool = createDashboard({
  id: 'repository-stats',
  name: 'Repository Statistics',
  title: 'Repository Statistics Dashboard',
  description: 'View statistics and information about the current repository',
  dashboardComponent: RepositoryStatsDashboard,
  category: 'analytics',
  requiresAuth: false, // Available to all user types
  supportsDemo: true,
  
  // Hooks
  onInit: async (context) => {
    console.log('Repository Stats Dashboard initialized', context);
  },
  
  onError: (error, context) => {
    console.error('Repository Stats Dashboard error:', error, context);
  }
});

export default RepositoryStatsDashboard_Tool;