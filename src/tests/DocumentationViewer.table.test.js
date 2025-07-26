import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DocumentationViewer from '../components/DocumentationViewer';

// Mock fetch to return our test markdown content
global.fetch = jest.fn();

const mockMarkdownWithTable = `# Test Document

## Additional Structured Knowledge Representations

The SGEX Workbench also supports additional knowledge types that complement the core DAK components:

| Knowledge Type | L2 Representation | L3 Representation |
|----------------|-------------------|-------------------|
| Terminology | Concept definitions and mappings | FHIR CodeSystem/ValueSet |
| FHIR Profiles | Data model specifications | FHIR StructureDefinition |
| Test Data & Examples | Test scenarios and sample data | FHIR Examples/test bundles |

## Another Section

Some additional content here.
`;

describe('DocumentationViewer Table Rendering', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders markdown tables as HTML tables correctly', async () => {
    // Mock successful fetch response
    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => mockMarkdownWithTable,
    });

    render(
      <MemoryRouter initialEntries={['/docs/test-doc']}>
        <DocumentationViewer />
      </MemoryRouter>
    );

    // Wait for the document to load
    await waitFor(() => {
      expect(screen.getByText('Test Document')).toBeInTheDocument();
    });

    // Check that the table is rendered as an HTML table
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(table).toHaveClass('doc-table');

    // Check table headers
    expect(screen.getByText('Knowledge Type')).toBeInTheDocument();
    expect(screen.getByText('L2 Representation')).toBeInTheDocument();
    expect(screen.getByText('L3 Representation')).toBeInTheDocument();

    // Check table data
    expect(screen.getByText('Terminology')).toBeInTheDocument();
    expect(screen.getByText('Concept definitions and mappings')).toBeInTheDocument();
    expect(screen.getByText('FHIR CodeSystem/ValueSet')).toBeInTheDocument();
    
    expect(screen.getByText('FHIR Profiles')).toBeInTheDocument();
    expect(screen.getByText('Data model specifications')).toBeInTheDocument();
    expect(screen.getByText('FHIR StructureDefinition')).toBeInTheDocument();

    expect(screen.getByText('Test Data & Examples')).toBeInTheDocument();
    expect(screen.getByText('Test scenarios and sample data')).toBeInTheDocument();
    expect(screen.getByText('FHIR Examples/test bundles')).toBeInTheDocument();
  });

  test('renders non-table markdown content correctly', async () => {
    const markdownWithoutTable = `# Simple Document

This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2

## Section 2

More content here.
`;

    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => markdownWithoutTable,
    });

    render(
      <MemoryRouter initialEntries={['/docs/simple-doc']}>
        <DocumentationViewer />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Simple Document')).toBeInTheDocument();
    });

    // Check that regular markdown elements are rendered correctly
    expect(screen.getByText(/This is a paragraph with/)).toBeInTheDocument();
    expect(screen.getByText('List item 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
    
    // Ensure no table is rendered when there shouldn't be one
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('handles malformed tables gracefully', async () => {
    const malformedTable = `# Document with Malformed Table

| Header 1 | Header 2
|----------|----------
| Cell 1 | Cell 2
| Cell 3

Regular content continues here.
`;

    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => malformedTable,
    });

    render(
      <MemoryRouter initialEntries={['/docs/malformed-doc']}>
        <DocumentationViewer />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Document with Malformed Table')).toBeInTheDocument();
    });

    // The malformed table should still be processed (our regex is quite forgiving)
    // or at least not break the rendering
    expect(screen.getByText('Regular content continues here.')).toBeInTheDocument();
  });
});