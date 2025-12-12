# Development Guide

Developer documentation for contributing to SGEX Workbench, including setup, standards, and best practices.

## 📚 Documentation Contents

- **[TypeScript Migration](typescript-migration.md)** - TypeScript adoption guide and migration status
- **[Compliance Framework](compliance-framework.md)** - Compliance checking and validation
- **[Framework Hooks](framework-hooks.md)** - Using SGEX framework hooks
- **[Accessibility](accessibility.md)** - Accessibility standards and linting
- **Development Setup** *(Coming Soon)* - Setting up your development environment
- **Testing Guide** *(Coming Soon)* - Testing guidelines and practices
- **Code Standards** *(Coming Soon)* - Coding standards and conventions

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher
- Git
- Modern code editor (VS Code recommended)

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/litlfred/sgex.git
cd sgex

# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at `http://localhost:3000/sgex`

## 🏗️ Project Structure

```
sgex/
├── packages/              # Monorepo packages
│   ├── dak-core/         # Core business logic
│   ├── storage-services/ # Storage and caching
│   ├── vcs-services/     # GitHub integration
│   ├── utils/            # Shared utilities
│   └── web-services/     # Web-specific services
├── services/             # MCP services
│   ├── dak-faq-mcp/     # FAQ service
│   └── dak-publication-api/ # Publication API
├── src/                  # Main application source
│   ├── components/       # React components
│   ├── services/         # Application services
│   ├── hooks/           # Custom React hooks
│   ├── contexts/        # React contexts
│   └── styles/          # Global styles
├── public/              # Static assets
└── docs/                # Documentation
```

## 💻 Development Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Write code following our standards
- Add tests for new functionality
- Update documentation as needed

### 3. Run Tests
```bash
npm test
```

### 4. Lint Your Code
```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

### 5. Type Check (TypeScript)
```bash
npm run type-check
```

### 6. Commit Changes
```bash
git add .
git commit -m "feat: add new feature"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/) format.

### 7. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## 📜 Coding Standards

### TypeScript
- Use TypeScript for all new files
- See [TypeScript Migration Guide](typescript-migration.md)
- Enable strict mode
- Avoid `any` types

### React
- Use functional components with hooks
- Follow React best practices
- Use proper prop types
- Implement error boundaries

### File Naming
- Components: `PascalCase.tsx` or `PascalCase.jsx`
- Services: `camelCase.ts` or `camelCase.js`
- Utilities: `camelCase.ts` or `camelCase.js`
- Tests: `*.test.ts` or `*.test.js`

### Code Style
- Use ESLint configuration provided
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas in objects/arrays
- Semicolons required

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- ComponentName.test.js

# Run with coverage
npm test -- --coverage
```

### Writing Tests
```javascript
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Test Organization
- Unit tests alongside source files
- Integration tests in `src/tests/`
- E2E tests in `e2e/` (coming soon)

## ♿ Accessibility

### Requirements
- WCAG 2.1 Level AA compliance
- Semantic HTML elements
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility

### Linting
```bash
npm run lint:a11y  # Check accessibility issues
```

See [Accessibility Guide](accessibility.md) for details.

## 📦 Package Development

### Working with Packages
```bash
# Navigate to package
cd packages/dak-core

# Install dependencies
npm install

# Run package tests
npm test

# Build package
npm run build
```

### Creating New Packages
1. Create directory in `packages/`
2. Add `package.json` with proper metadata
3. Follow monorepo conventions
4. Add to root workspace configuration

## 🔧 Available Scripts

### Development
```bash
npm start              # Start development server
npm run build          # Production build
npm test              # Run tests
npm run lint          # Lint code
npm run lint:fix      # Fix lint issues
npm run type-check    # TypeScript type checking
```

### Advanced
```bash
npm run generate-schemas     # Generate JSON schemas
npm run check-framework-compliance  # Check compliance
npm run generate-service-table      # Generate service table
```

## 🎯 Framework Features

### Page Framework
Use the page framework for consistent page structure:
```javascript
import { PageLayout, PageHeader } from './components/framework';

function MyPage() {
  return (
    <PageLayout>
      <PageHeader title="My Page" />
      {/* Page content */}
    </PageLayout>
  );
}
```

See [Framework Hooks Guide](framework-hooks.md) for details.

### Compliance Framework
Integrate compliance checking:
```javascript
import { useCompliance } from './hooks/useCompliance';

function MyComponent() {
  const { checkCompliance, errors } = useCompliance();
  
  // Use compliance checking
}
```

See [Compliance Framework Guide](compliance-framework.md).

## 🔍 Code Quality

### ESLint Rules
- No unused variables
- Proper React hooks usage
- Accessibility rules enabled
- Security rules enabled
- TypeScript rules (when applicable)

### Pre-commit Hooks
- Automatically run on commit
- Lint staged files
- Run type checking
- Verify tests pass

## 📖 Documentation Standards

### Code Comments
```javascript
/**
 * Brief description of function
 * 
 * @param {string} param1 - Description of param1
 * @param {number} param2 - Description of param2
 * @returns {boolean} Description of return value
 */
function myFunction(param1, param2) {
  // Implementation
}
```

### Component Documentation
```javascript
/**
 * ComponentName - Brief description
 * 
 * @component
 * @example
 * <ComponentName prop1="value" />
 */
```

### README Files
- Every package needs a README
- Include usage examples
- Document API if applicable
- Link to related documentation

## 🐛 Debugging

### Browser DevTools
- Use React Developer Tools
- Check console for errors
- Use Network tab for API calls
- Profile performance with Profiler

### VS Code Debugging
```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Debug SGEX",
  "url": "http://localhost:3000/sgex",
  "webRoot": "${workspaceFolder}/src"
}
```

## 🔄 TypeScript Migration

The project is undergoing TypeScript migration. See [TypeScript Migration Guide](typescript-migration.md) for:
- Migration phases
- Best practices
- Type definitions
- Common patterns

## 🤝 Contributing

### Pull Request Process
1. Create feature branch
2. Make changes with tests
3. Update documentation
4. Pass all checks
5. Request review
6. Address feedback
7. Merge when approved

### Code Review Guidelines
- Be constructive and respectful
- Focus on code quality
- Check for test coverage
- Verify documentation updates
- Test manually when needed

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for full guidelines.

## 🔗 Related Documentation

- [Architecture](../03-architecture/) - System architecture
- [Deployment](../05-deployment/) - Deployment procedures
- [Security](../06-security/) - Security practices
- [Features](../07-features/) - Feature documentation

## 🔗 Quick Links

- [Back to Documentation Index](../INDEX.md)
- [Getting Started](../01-getting-started/)
- [Architecture](../03-architecture/)
- [Main README](../../README.md)

## 📞 Getting Help

- **Issues**: [GitHub Issues](https://github.com/litlfred/sgex/issues)
- **Discussions**: [GitHub Discussions](https://github.com/litlfred/sgex/discussions)
- **Documentation**: [Full Documentation Index](../INDEX.md)

---

**Last Updated**: December 2024  
**Maintained By**: SGEX Workbench Development Team