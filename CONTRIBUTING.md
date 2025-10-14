# Contributing to SGEX Workbench

Thank you for your interest in contributing to the WHO SMART Guidelines Exchange (SGEX) Workbench!

## Getting Started

1. **Set up your development environment** - Follow the [Development Setup](README.md#development-setup) instructions in the README
2. Fork the repository
3. Create a feature branch from `main`
4. Make your changes
5. Test your changes locally using `npm start` and `npm run build`
6. Submit a pull request

## Guidelines

- Follow WHO SMART Guidelines branding and terminology
- Ensure all changes maintain accessibility standards
- Keep documentation up to date
- Write clear commit messages

### TypeScript-First Development

**SGEX Workbench uses TypeScript as the default for all code:**
- ✅ **New code must be TypeScript**: Use `.ts` for modules, `.tsx` for React components
- ⚠️ **JavaScript requires approval**: Any new JavaScript files (`.js`, `.jsx`) require explicit written approval from a code maintainer (@litlfred)
- 📝 **Document exceptions**: If JavaScript is necessary (rare), document the technical reason
- 🔄 **Migration in progress**: Existing JavaScript files are being migrated to TypeScript
- 📊 **JSON Schema required**: All TypeScript types must be exported and have corresponding JSON Schema validation
- 📋 **OpenAPI documentation**: All API endpoints and services must be documented with OpenAPI specifications

**Before adding JavaScript code:**
1. Consider if TypeScript can be used instead
2. Document why JavaScript is technically required
3. Request approval from @litlfred in your PR or issue
4. Add a code comment explaining the exception

**When writing TypeScript code:**
1. Export all types and interfaces for JSON Schema generation
2. Add JSDoc comments with `@example` tags for documentation
3. Run `npm run generate-schemas` after modifying types
4. Use `RuntimeValidationService` for data validation
5. Document API methods with OpenAPI JSDoc annotations
6. Include request/response examples in documentation

See [TYPESCRIPT_MIGRATION_PLAN.md](TYPESCRIPT_MIGRATION_PLAN.md) for the complete migration plan and approval process.

## Pull Requests

- Use the provided PR template
- Link related issues
- Ensure all checks pass
- Request review from maintainers

## Issues

- Use the appropriate issue template
- Provide clear reproduction steps for bugs
- Include use cases for feature requests

## Code of Conduct

Please be respectful and professional in all interactions.

## Questions?

For questions about contributing, please open an issue or contact the maintainers.