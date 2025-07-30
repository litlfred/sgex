import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardRedirect from '../components/DashboardRedirect';

// Test to verify the dashboard redirect fix
describe('Dashboard Route Fix', () => {
  test('DashboardRedirect component renders without error', () => {
    expect(() => {
      render(
        <BrowserRouter>
          <DashboardRedirect />
        </BrowserRouter>
      );
    }).not.toThrow();
  });
});