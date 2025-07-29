import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from './framework';

const BPMNViewerTestComponent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate navigating to BPMN viewer with the same data as in the issue
    const testData = {
      profile: {
        login: 'test-user',
        avatar_url: 'https://github.com/test-user.png',
        name: 'Test User',
        isDemo: false
      },
      repository: {
        name: 'smart-immunizations',
        owner: { login: 'WorldHealthOrganization' },
        full_name: 'WorldHealthOrganization/smart-immunizations',
        permissions: { push: false },
        isDemo: false
      },
      selectedFile: {
        name: 'IMMZ.D.Administer Vaccine.bpmn',
        path: 'input/business-processes/IMMZ.D.Administer Vaccine.bpmn',
        size: 12345
      },
      selectedBranch: 'main',
      component: 'business-processes'
    };

    // Navigate to BPMN viewer with test data
    navigate('/bpmn-viewer', { state: testData });
  }, [navigate]);

  return (
    <PageLayout pageName="bpmn-viewer-test">
      <div>
        <h2>Navigating to BPMN Viewer...</h2>
        <p>This will test the container initialization fix.</p>
      </div>
    </PageLayout>
  );
};

export default BPMNViewerTestComponent;