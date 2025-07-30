import React from 'react';

const BPMNViewerTestComponent = () => {
  const testCases = [
    { id: 1, name: 'Basic Process', description: 'Test basic BPMN process rendering' },
    { id: 2, name: 'Complex Workflow', description: 'Test complex workflow with gateways' },
    { id: 3, name: 'Error Handling', description: 'Test error boundary and error handling' }
  ];

  const runTest = (testId) => {
    console.log(`Running test ${testId}`);
  };

  return (
    <div className="bpmn-viewer-test">
      <h2>BPMN Viewer Test Component</h2>
      <div className="test-cases">
        {testCases.map(test => (
          <div key={test.id} className="test-case">
            <h3>{test.name}</h3>
            <p>{test.description}</p>
            <button onClick={() => runTest(test.id)}>Run Test</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BPMNViewerTestComponent;