# SGEX Workbench (WHO SMART Guidelines Exchange)

This repository contains the source code, schemas, and documentation for the SGEX Workbench—a browser-based, standards-compliant collaborative editor for WHO SMART Guidelines Digital Adaptation Kits (DAKs).

## About

The SGEX Workbench is a browser-based, static web application for collaborative editing of WHO SMART Guidelines Digital Adaptation Kits (DAKs) content stored in GitHub repositories.

- All UI schemas are rendered using [JSON Forms](https://jsonforms.io/) for standards compliance and accessibility.
- All schemas and documentation follow the terminology and branding of [WHO SMART Guidelines](https://www.who.int/teams/digital-health-and-innovation/smart-guidelines).

## Deployment

This app is designed for deployment on **GitHub Pages** in the gh-pages branch of the smart-base repo. Currently the gh-pages branch deploys to https://worldhealthorganization.github.io/smart-base/ when in draft and http://smart.who.int when published. Publishing is handled by the IG publisher https://github.com/HL7/fhir-ig-publisher

## Documentation

All project documentation is located in the `docs/` directory:

- [Project Plan](docs/project-plan.md) - Overall project planning and milestones
- [Requirements](docs/requirements.md) - Detailed functional and non-functional requirements
- [Solution Architecture](docs/solution-architecture.md) - Technical architecture and design decisions

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## References

- [WHO SMART Guidelines](https://www.who.int/teams/digital-health-and-innovation/smart-guidelines)
- [JSON Forms](https://jsonforms.io/)
- [bpmn-js](https://github.com/bpmn-io/bpmn-js)
- [dmn-js](https://github.com/bpmn-io/dmn-js)
- [Octokit](https://github.com/octokit/rest.js)
- [GitHub REST API](https://docs.github.com/en/rest)