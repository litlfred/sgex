# SGEX Workbench (WHO SMART Guidelines Exchange)

This repository contains the source code, schemas, and documentation for the SGEX Workbench—a browser-based, standards-compliant collaborative editor for WHO SMART Guidelines Digital Adaptation Kits (DAKs).

## About

The SGEX Workbench is a browser-based, static web application for collaborative editing of WHO SMART Guidelines Digital Adaptation Kits (DAKs) content stored in GitHub repositories.

- All UI schemas are rendered using [JSON Forms](https://jsonforms.io/) for standards compliance and accessibility.
- All schemas and documentation follow the terminology and branding of [WHO SMART Guidelines](https://www.who.int/teams/digital-health-and-innovation/smart-guidelines).

## WHO SMART Guidelines DAK Components

The SGEX Workbench supports editing of the **8 core Digital Adaptation Kit (DAK) components** as defined by the WHO SMART Guidelines framework. These components are organized into two levels:

### Level 2: Business Logic & Processes
1. **Business Processes** - BPMN workflows and business process definitions
2. **Decision Support Logic** - DMN decision tables and clinical decision support 
3. **Indicators & Measures** - Performance indicators and measurement definitions
4. **Data Entry Forms** - Structured data collection forms and questionnaires

### Level 3: Technical Implementation  
5. **Terminology** - Code systems, value sets, and concept maps
6. **FHIR Profiles** - FHIR resource profiles and structure definitions
7. **FHIR Extensions** - Custom FHIR extensions and data elements
8. **Test Data & Examples** - Sample data and test cases for validation

*Note: Scheduling tables are considered a special case of decision tables and are included within the Decision Support Logic component.*

For more information on DAK authoring, see the [WHO SMART Guidelines IG Starter Kit](https://smart.who.int/ig-starter-kit/l2_dak_authoring.html).

## Deployment

This app is designed for deployment on **GitHub Pages** in the gh-pages branch of the smart-base repo. Currently the gh-pages branch deploys to https://worldhealthorganization.github.io/smart-base/ when in draft and http://smart.who.int when published. Publishing is handled by the IG publisher https://github.com/HL7/fhir-ig-publisher

## Documentation

All project documentation is located in the `docs/` directory:

- [Project Plan](docs/project-plan.md) - Overall project planning and milestones
- [Requirements](docs/requirements.md) - Detailed functional and non-functional requirements
- [Solution Architecture](docs/solution-architecture.md) - Technical architecture and design decisions
- [DAK Components](docs/dak-components.md) - Comprehensive guide to the 8 WHO SMART Guidelines DAK components

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## References

- [WHO SMART Guidelines](https://www.who.int/teams/digital-health-and-innovation/smart-guidelines)
- [JSON Forms](https://jsonforms.io/)
- [bpmn-js](https://github.com/bpmn-io/bpmn-js)
- [dmn-js](https://github.com/bpmn-io/dmn-js)
- [Octokit](https://github.com/octokit/rest.js)
- [GitHub REST API](https://docs.github.com/en/rest)