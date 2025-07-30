import React from 'react';

const BPMNSource = ({ bpmnXml }) => {
  return (
    <div className="bpmn-source">
      <h2>BPMN Source</h2>
      <div className="source-viewer">
        <pre>
          <code>{bpmnXml || '<!-- BPMN XML source will be displayed here -->'}</code>
        </pre>
      </div>
      <div className="source-actions">
        <button>Copy Source</button>
        <button>Download</button>
        <button>Validate</button>
      </div>
    </div>
  );
};

export default BPMNSource;