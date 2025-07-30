# SGEX Workbench

**WHO SMART Guidelines Exchange - Collaborative Development Platform**

SGEX Workbench is a comprehensive web-based platform for creating, editing, and managing WHO SMART Guidelines. It provides collaborative tools for health informaticians, clinicians, and developers to work together on clinical decision support systems.

## 🚀 Features

- **BPMN Editor**: Visual business process modeling for clinical workflows
- **Decision Table Editor**: Intuitive interface for clinical decision logic
- **GitHub Integration**: Seamless version control and collaboration
- **Multi-language Support**: Internationalization for global accessibility
- **Real-time Collaboration**: Multi-user editing capabilities
- **Quality Assurance**: Automated testing and compliance checking

## 🏗️ Architecture

This application is built using modern web technologies:
- **Frontend**: React.js with Material-UI components
- **Build System**: Create React App with custom scripts
- **Testing**: Jest and React Testing Library
- **Deployment**: GitHub Pages with multi-branch support
- **CI/CD**: GitHub Actions for automated testing and deployment

## 📋 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone https://github.com/litlfred/sgex.git
cd sgex

# Install dependencies
npm install

# Start development server
npm start
```

### Building for Production
```bash
# Build the application
npm run build

# Build for multi-branch deployment
npm run build:multi-branch
```

## 🧪 Quality Assurance

The project includes comprehensive QA tools:

```bash
# Run tests
npm test

# Check framework compliance
npm run check-framework-compliance

# Generate QA report
node scripts/generate-qa-report.js

# Analyze GitHub issues
node scripts/analyze-github-issues.js
```

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- [Requirements](docs/requirements.md) - Project requirements and specifications
- [Architecture](docs/solution-architecture.md) - Technical architecture overview
- [Components](docs/dak-components.md) - Component documentation
- [BPMN Integration](docs/bpmn-integration.md) - BPMN editor integration
- [Internationalization](docs/internationalization.md) - Multi-language support

## 🌍 Deployment

The application is deployed using GitHub Pages with multi-branch support:

- **Production**: [https://litlfred.github.io/sgex/](https://litlfred.github.io/sgex/)
- **Development Branches**: Available at `https://litlfred.github.io/sgex/sgex/[branch-name]/`

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and follow the WHO SMART Guidelines framework standards.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and compliance checks
5. Submit a pull request

## 📄 License

This project is part of the WHO SMART Guidelines initiative. Please see the [WHO SMART Guidelines License](https://smart.who.int/) for usage terms.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/litlfred/sgex/issues)
- **Discussions**: [GitHub Discussions](https://github.com/litlfred/sgex/discussions)
- **WHO SMART Guidelines**: [https://smart.who.int/](https://smart.who.int/)

## 🏥 WHO SMART Guidelines

This project is developed in accordance with the WHO SMART Guidelines technical specifications for digital health interventions. It supports the development of evidence-based clinical decision support systems.

---

**Built with ❤️ for global health by the WHO SMART Guidelines community**