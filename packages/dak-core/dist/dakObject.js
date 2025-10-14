"use strict";
/**
 * DAK Object
 * Represents a repository instance of a DAK
 * Provides access to all 9 component objects
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAKObject = void 0;
const types_1 = require("./types");
const components_1 = require("./components");
/**
 * DAK Object - represents a repository instance of a DAK
 * Provides access to all component objects (currently 3, will be 9)
 */
class DAKObject {
    constructor(repository, sourceResolver, stagingGroundService, dak) {
        this.repository = repository;
        this.sourceResolver = sourceResolver;
        this.stagingGroundService = stagingGroundService;
        this.dak = dak || this.createEmptyDAK();
        this.componentObjects = new Map();
        this.initializeComponents();
    }
    /**
     * Get component object for a specific component type
     */
    getComponent(componentType) {
        const component = this.componentObjects.get(componentType);
        if (!component) {
            throw new Error(`Component not found: ${componentType}`);
        }
        return component;
    }
    /**
     * Convenience getter for personas component
     */
    get personas() {
        return this.getComponent(types_1.DAKComponentType.PERSONAS);
    }
    /**
     * Convenience getter for data elements component
     */
    get dataElements() {
        return this.getComponent(types_1.DAKComponentType.DATA_ELEMENTS);
    }
    /**
     * Convenience getter for business processes component
     */
    get businessProcesses() {
        return this.getComponent(types_1.DAKComponentType.BUSINESS_PROCESSES);
    }
    /**
     * Get DAK metadata
     */
    getMetadata() {
        return {
            id: this.dak.id,
            name: this.dak.name,
            title: this.dak.title,
            description: this.dak.description,
            version: this.dak.version,
            status: this.dak.status,
            publicationUrl: this.dak.publicationUrl,
            license: this.dak.license,
            copyrightYear: this.dak.copyrightYear,
            publisher: this.dak.publisher
        };
    }
    /**
     * Update DAK metadata
     */
    async updateMetadata(metadata) {
        this.dak = { ...this.dak, ...metadata };
        await this.saveDakJson();
    }
    /**
     * Export to dak.json format
     */
    toJSON() {
        // Collect sources from all components
        const dakJson = {
            ...this.dak,
            resourceType: 'DAK'
        };
        // Add sources from each component
        for (const [componentType, component] of this.componentObjects) {
            const sources = component.getSources();
            if (sources.length > 0) {
                // Map component type to DAK property name
                const propertyName = this.getDAKPropertyName(componentType);
                dakJson[propertyName] = sources;
            }
        }
        return dakJson;
    }
    /**
     * Save dak.json to staging ground
     */
    async saveDakJson() {
        const dakJson = this.toJSON();
        await this.stagingGroundService.updateFile('dak.json', JSON.stringify(dakJson, null, 2), {
            message: 'Update DAK metadata',
            componentType: 'metadata'
        });
    }
    /**
     * Internal method to update component sources (called by components)
     */
    async updateComponentSources(componentType, sources) {
        // Update internal DAK structure
        const propertyName = this.getDAKPropertyName(componentType);
        this.dak[propertyName] = sources;
        // Save to staging ground
        await this.saveDakJson();
    }
    initializeComponents() {
        // Create component objects - currently 3 implemented, will be 9
        this.componentObjects.set(types_1.DAKComponentType.PERSONAS, new components_1.GenericPersonaComponent(this.repository, this.sourceResolver, this.stagingGroundService, (sources) => this.updateComponentSources(types_1.DAKComponentType.PERSONAS, sources)));
        this.componentObjects.set(types_1.DAKComponentType.DATA_ELEMENTS, new components_1.CoreDataElementComponent(this.repository, this.sourceResolver, this.stagingGroundService, (sources) => this.updateComponentSources(types_1.DAKComponentType.DATA_ELEMENTS, sources)));
        this.componentObjects.set(types_1.DAKComponentType.BUSINESS_PROCESSES, new components_1.BusinessProcessWorkflowComponent(this.repository, this.sourceResolver, this.stagingGroundService, (sources) => this.updateComponentSources(types_1.DAKComponentType.BUSINESS_PROCESSES, sources)));
        // Load existing sources into components
        this.loadSourcesIntoComponents();
    }
    loadSourcesIntoComponents() {
        // Load sources from dak into component objects
        if (this.dak.personas) {
            const component = this.componentObjects.get(types_1.DAKComponentType.PERSONAS);
            if (component) {
                component.initializeSources(this.dak.personas);
            }
        }
        if (this.dak.dataElements) {
            const component = this.componentObjects.get(types_1.DAKComponentType.DATA_ELEMENTS);
            if (component) {
                component.initializeSources(this.dak.dataElements);
            }
        }
        if (this.dak.businessProcesses) {
            const component = this.componentObjects.get(types_1.DAKComponentType.BUSINESS_PROCESSES);
            if (component) {
                component.initializeSources(this.dak.businessProcesses);
            }
        }
    }
    createEmptyDAK() {
        return {
            resourceType: 'DAK',
            id: this.repository.owner + '.' + this.repository.repo,
            name: this.repository.repo,
            title: this.repository.repo,
            description: '',
            version: '0.1.0',
            status: 'draft',
            publicationUrl: '',
            license: 'CC-BY-4.0',
            copyrightYear: new Date().getFullYear().toString(),
            publisher: { name: this.repository.owner, url: '' }
        };
    }
    getDAKPropertyName(componentType) {
        const map = {
            [types_1.DAKComponentType.HEALTH_INTERVENTIONS]: 'healthInterventions',
            [types_1.DAKComponentType.PERSONAS]: 'personas',
            [types_1.DAKComponentType.USER_SCENARIOS]: 'userScenarios',
            [types_1.DAKComponentType.BUSINESS_PROCESSES]: 'businessProcesses',
            [types_1.DAKComponentType.DATA_ELEMENTS]: 'dataElements',
            [types_1.DAKComponentType.DECISION_LOGIC]: 'decisionLogic',
            [types_1.DAKComponentType.INDICATORS]: 'indicators',
            [types_1.DAKComponentType.REQUIREMENTS]: 'requirements',
            [types_1.DAKComponentType.TEST_SCENARIOS]: 'testScenarios'
        };
        return map[componentType];
    }
}
exports.DAKObject = DAKObject;
//# sourceMappingURL=dakObject.js.map