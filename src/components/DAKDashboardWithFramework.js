import React from 'react';
import DAKDashboard from './DAKDashboard';
import { PageLayout } from './framework';

const DAKDashboardWithFramework = (props) => {
  return (
    <PageLayout title="DAK Dashboard">
      <DAKDashboard {...props} />
    </PageLayout>
  );
};

export default DAKDashboardWithFramework;