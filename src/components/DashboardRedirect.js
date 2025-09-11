import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageLayout } from './framework';
import githubService from '../services/githubService';
import useThemeImage from '../hooks/useThemeImage';
import { ALT_TEXT_KEYS, getAltText } from '../utils/imageAltTextHelper';

/**
 * Component that helps users navigate to a DAK dashboard
 * Shows recent repositories and quick access options
 */
const DashboardRedirect = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [recentRepos, setRecentRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Theme-aware images
  const mascotImage = useThemeImage('sgex-mascot.png');
  const dashboardImage = useThemeImage('collaboration.png');

  useEffect(() => {
    const loadRecentRepositories = async () => {
      try {
        // Get recent repositories from localStorage or other sources
        const recent = JSON.parse(localStorage.getItem('sgex-recent-repositories') || '[]');
        setRecentRepos(recent.slice(0, 3)); // Show top 3 recent repos
      } catch (error) {
        console.warn('Could not load recent repositories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentRepositories();
  }, []);

  const handleQuickAccess = (user, repo, branch = 'main') => {
    // Save to recent repositories
    const recent = JSON.parse(localStorage.getItem('sgex-recent-repositories') || '[]');
    const newEntry = { user, repo, branch, timestamp: Date.now() };
    const updated = [newEntry, ...recent.filter(r => !(r.user === user && r.repo === repo))].slice(0, 10);
    localStorage.setItem('sgex-recent-repositories', JSON.stringify(updated));
    
    // Navigate to dashboard
    navigate(`/dashboard/${user}/${repo}/${branch}`);
  };

  const handleSelectRepository = () => {
    navigate('/dak-action');
  };

  return (
    <PageLayout pageName="dashboard-redirect">
      <div style={{
        background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
        minHeight: '100vh',
        padding: '2rem',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            <img 
              src={mascotImage}
              alt={getAltText(ALT_TEXT_KEYS.SGEX_MASCOT)}
              style={{
                width: '80px',
                height: '80px',
                marginBottom: '1rem'
              }}
            />
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              DAK Dashboard
            </h1>
            <p style={{
              fontSize: '1.2rem',
              opacity: 0.9,
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Access your WHO SMART Guidelines Digital Adaptation Kit dashboards. 
              Select a repository to view and edit DAK components.
            </p>
          </div>

          {/* Quick Access Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {/* Recent Repositories */}
            {recentRepos.length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '2rem',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🕒 Recent Repositories
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {recentRepos.map((repo, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAccess(repo.user, repo.repo, repo.branch)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem',
                        color: 'white',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '1rem'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>
                        {repo.user}/{repo.repo}
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                        Branch: {repo.branch}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* New Repository Access */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '2rem',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📊 Access Dashboard
              </h2>
              <p style={{
                marginBottom: '1.5rem',
                opacity: 0.9,
                lineHeight: 1.5
              }}>
                Select a DAK repository to access its dashboard and start editing components.
              </p>
              <button
                onClick={handleSelectRepository}
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: '#0078d4',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Select Repository
              </button>
            </div>

            {/* Quick Demo Access */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '2rem',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🚀 Demo Dashboard
              </h2>
              <p style={{
                marginBottom: '1.5rem',
                opacity: 0.9,
                lineHeight: 1.5
              }}>
                Try the demo dashboard with sample WHO SMART Guidelines data.
              </p>
              <button
                onClick={() => handleQuickAccess('litlfred', 'sgex', 'main')}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '8px',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                View Demo
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '2rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center'
          }}>
            <img 
              src={dashboardImage}
              alt={getAltText(ALT_TEXT_KEYS.COLLABORATION_FEATURE)}
              style={{
                width: '60px',
                height: '60px',
                marginBottom: '1rem',
                opacity: 0.8
              }}
            />
            <h3 style={{
              fontSize: '1.3rem',
              marginBottom: '0.5rem'
            }}>
              About DAK Dashboards
            </h3>
            <p style={{
              opacity: 0.9,
              lineHeight: 1.6,
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              DAK Dashboards provide a comprehensive view of your WHO SMART Guidelines Digital Adaptation Kit components. 
              Edit health interventions, manage business processes, configure decision support logic, and organize all 
              essential components according to WHO standards.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardRedirect;