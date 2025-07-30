import React from 'react';

const TestDashboard = () => {
  const tests = [
    { id: 1, name: 'Component Tests', status: 'passing', count: 42 },
    { id: 2, name: 'Integration Tests', status: 'failing', count: 12 },
    { id: 3, name: 'E2E Tests', status: 'pending', count: 8 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'passing': return '#28a745';
      case 'failing': return '#dc3545';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <div className="test-dashboard">
      <h2>Test Dashboard</h2>
      <div className="test-summary">
        {tests.map(test => (
          <div key={test.id} className="test-group">
            <h3>{test.name}</h3>
            <div className="test-stats">
              <span 
                className="test-status" 
                style={{ color: getStatusColor(test.status) }}
              >
                {test.status}
              </span>
              <span className="test-count">{test.count} tests</span>
            </div>
          </div>
        ))}
      </div>
      <button className="run-all-tests">Run All Tests</button>
    </div>
  );
};

export default TestDashboard;