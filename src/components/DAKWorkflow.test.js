import React from 'react';
import { render, screen } from '@testing-library/react';
import RepositoryConfigEditor from '../components/workflow/RepositoryConfigEditor';
import SushiConfigEditor from '../components/workflow/SushiConfigEditor';
import IgIniEditor from '../components/workflow/IgIniEditor';

describe('DAK Workflow Components', () => {
  const mockProfile = {
    login: 'test-user',
    name: 'Test User',
    avatar_url: 'test.png'
  };

  describe('RepositoryConfigEditor', () => {
    test('renders repository configuration form', () => {
      const mockConfig = {
        name: '',
        description: '',
        private: false,
        topics: ['who', 'smart-guidelines', 'dak']
      };

      render(
        <RepositoryConfigEditor
          config={mockConfig}
          setConfig={jest.fn()}
          errors={{}}
          profile={mockProfile}
          onValidate={jest.fn()}
        />
      );

      expect(screen.getByText('Repository Configuration')).toBeInTheDocument();
      expect(screen.getByLabelText(/Repository Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Make repository private/)).toBeInTheDocument();
    });
  });

  describe('SushiConfigEditor', () => {
    test('renders SUSHI configuration form', () => {
      const mockConfig = {
        id: '',
        canonical: '',
        name: '',
        title: '',
        description: '',
        version: '0.1.0',
        status: 'draft',
        publisher: '',
        dependencies: [],
        pages: {}
      };

      render(
        <SushiConfigEditor
          config={mockConfig}
          setConfig={jest.fn()}
          errors={{}}
          profile={mockProfile}
          onValidate={jest.fn()}
        />
      );

      expect(screen.getByText('SUSHI Configuration')).toBeInTheDocument();
      expect(screen.getByLabelText(/Implementation Guide ID/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Canonical URL/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Technical Name/)).toBeInTheDocument();
    });
  });

  describe('IgIniEditor', () => {
    test('renders IG configuration form', () => {
      const mockConfig = {
        ig: 'sushi-config.yaml',
        template: 'fhir.base.template#current'
      };

      render(
        <IgIniEditor
          config={mockConfig}
          setConfig={jest.fn()}
          errors={{}}
          profile={mockProfile}
          onValidate={jest.fn()}
        />
      );

      expect(screen.getByText('IG Configuration')).toBeInTheDocument();
      expect(screen.getByLabelText(/IG Configuration File/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Template/)).toBeInTheDocument();
    });
  });
});