"use strict";
/**
 * DAK Validation Service
 * Core business logic for validating WHO SMART Guidelines DAK repositories and components
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAKValidationService = void 0;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yaml = __importStar(require("yaml"));
const types_1 = require("./types");
class DAKValidationService {
    constructor() {
        this.ajv = new ajv_1.default({ allErrors: true, verbose: true });
        (0, ajv_formats_1.default)(this.ajv);
        this.loadDAKSchema();
    }
    /**
     * Load the WHO SMART Guidelines DAK JSON Schema
     */
    loadDAKSchema() {
        try {
            const schemaPath = path.join(__dirname, '../schemas/dak.schema.json');
            if (fs.existsSync(schemaPath)) {
                this.dakSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
                this.ajv.addSchema(this.dakSchema, 'dak');
            }
            else {
                // Fallback schema for testing
                this.dakSchema = {
                    type: 'object',
                    properties: {
                        resourceType: { type: 'string', const: 'DAK' },
                        id: { type: 'string' },
                        name: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        version: { type: 'string' },
                        status: { type: 'string' },
                        publicationUrl: { type: 'string' },
                        license: { type: 'string' },
                        copyrightYear: { type: 'string' },
                        publisher: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                url: { type: 'string' }
                            }
                        }
                    },
                    required: ['resourceType', 'id', 'name', 'title', 'description', 'version', 'status']
                };
                this.ajv.addSchema(this.dakSchema, 'dak');
            }
        }
        catch (error) {
            // Create minimal fallback schema
            this.dakSchema = {
                type: 'object',
                properties: {
                    resourceType: { type: 'string' }
                }
            };
            this.ajv.addSchema(this.dakSchema, 'dak');
        }
    }
    /**
     * Validate if a repository is a valid WHO SMART Guidelines DAK
     * Based on presence and structure of sushi-config.yaml
     */
    async validateDAKRepository(repositoryPath) {
        const errors = [];
        const warnings = [];
        try {
            // Check for sushi-config.yaml
            const sushiConfigPath = path.join(repositoryPath, 'sushi-config.yaml');
            if (!fs.existsSync(sushiConfigPath)) {
                errors.push({
                    code: 'MISSING_SUSHI_CONFIG',
                    message: 'Repository must contain a sushi-config.yaml file in the root directory',
                    filePath: 'sushi-config.yaml'
                });
                return { isValid: false, errors, warnings, timestamp: new Date() };
            }
            // Parse sushi-config.yaml
            const sushiConfigContent = fs.readFileSync(sushiConfigPath, 'utf8');
            let sushiConfig;
            try {
                sushiConfig = yaml.parse(sushiConfigContent);
            }
            catch (yamlError) {
                errors.push({
                    code: 'INVALID_YAML',
                    message: `sushi-config.yaml contains invalid YAML: ${yamlError}`,
                    filePath: 'sushi-config.yaml'
                });
                return { isValid: false, errors, warnings, timestamp: new Date() };
            }
            // Check for dependencies section
            if (!sushiConfig.dependencies) {
                errors.push({
                    code: 'MISSING_DEPENDENCIES',
                    message: 'sushi-config.yaml must contain a dependencies section',
                    filePath: 'sushi-config.yaml'
                });
            }
            else {
                // Check for smart.who.int.base dependency
                if (!sushiConfig.dependencies['smart.who.int.base']) {
                    warnings.push({
                        code: 'MISSING_SMART_BASE_DEPENDENCY',
                        message: 'DAK should include smart.who.int.base dependency for WHO SMART Guidelines compliance',
                        filePath: 'sushi-config.yaml'
                    });
                }
            }
            // Validate required DAK metadata fields
            const requiredFields = ['id', 'name', 'title', 'description', 'version', 'status'];
            for (const field of requiredFields) {
                if (!sushiConfig[field]) {
                    errors.push({
                        code: 'MISSING_REQUIRED_FIELD',
                        message: `sushi-config.yaml must contain required field: ${field}`,
                        filePath: 'sushi-config.yaml'
                    });
                }
            }
            // Check for DAK component directories
            const componentDirs = this.getExpectedComponentDirectories();
            for (const [component, dirPaths] of Object.entries(componentDirs)) {
                let foundAny = false;
                for (const dirPath of dirPaths) {
                    const fullPath = path.join(repositoryPath, dirPath);
                    if (fs.existsSync(fullPath)) {
                        foundAny = true;
                        break;
                    }
                }
                if (!foundAny) {
                    warnings.push({
                        code: 'MISSING_COMPONENT_DIRECTORY',
                        message: `DAK component directory not found for ${component}. Expected one of: ${dirPaths.join(', ')}`,
                        component
                    });
                }
            }
        }
        catch (error) {
            errors.push({
                code: 'VALIDATION_ERROR',
                message: `Unexpected error during validation: ${error}`
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            timestamp: new Date()
        };
    }
    /**
     * Validate a DAK object against the WHO SMART Guidelines DAK schema
     */
    validateDAKObject(dak) {
        const errors = [];
        const warnings = [];
        try {
            const validate = this.ajv.getSchema('dak');
            if (!validate) {
                throw new Error('DAK schema not loaded');
            }
            const isValid = validate(dak);
            if (!isValid && validate.errors) {
                for (const error of validate.errors) {
                    errors.push({
                        code: 'SCHEMA_VALIDATION_ERROR',
                        message: `${error.instancePath || 'root'}: ${error.message}`,
                        component: error.instancePath?.split('/')[1]
                    });
                }
            }
        }
        catch (error) {
            errors.push({
                code: 'VALIDATION_ERROR',
                message: `Schema validation failed: ${error}`
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            timestamp: new Date()
        };
    }
    /**
     * Extract DAK metadata from sushi-config.yaml
     */
    extractDAKMetadata(repositoryPath) {
        try {
            const sushiConfigPath = path.join(repositoryPath, 'sushi-config.yaml');
            if (!fs.existsSync(sushiConfigPath)) {
                return null;
            }
            const sushiConfigContent = fs.readFileSync(sushiConfigPath, 'utf8');
            return yaml.parse(sushiConfigContent);
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Get expected component directories for WHO SMART Guidelines DAK
     */
    getExpectedComponentDirectories() {
        return {
            [types_1.DAKComponentType.HEALTH_INTERVENTIONS]: ['input/pagecontent', 'input/pages'],
            [types_1.DAKComponentType.PERSONAS]: ['input/actors', 'input/personas'],
            [types_1.DAKComponentType.USER_SCENARIOS]: ['input/scenarios', 'input/use-cases'],
            [types_1.DAKComponentType.BUSINESS_PROCESSES]: ['input/business-processes', 'input/workflows'],
            [types_1.DAKComponentType.DATA_ELEMENTS]: ['input/profiles', 'input/extensions'],
            [types_1.DAKComponentType.DECISION_LOGIC]: ['input/decision-tables', 'input/logic'],
            [types_1.DAKComponentType.INDICATORS]: ['input/measures', 'input/indicators'],
            [types_1.DAKComponentType.REQUIREMENTS]: ['input/requirements'],
            [types_1.DAKComponentType.TEST_SCENARIOS]: ['input/tests', 'input/examples']
        };
    }
    /**
     * Validate DAK component file
     */
    validateComponentFile(filePath, componentType) {
        const errors = [];
        const warnings = [];
        try {
            if (!fs.existsSync(filePath)) {
                errors.push({
                    code: 'FILE_NOT_FOUND',
                    message: `Component file not found: ${filePath}`,
                    filePath,
                    component: componentType
                });
                return { isValid: false, errors, warnings, timestamp: new Date() };
            }
            const fileExtension = path.extname(filePath).toLowerCase();
            const fileName = path.basename(filePath);
            // Validate based on component type and file extension
            switch (componentType) {
                case types_1.DAKComponentType.BUSINESS_PROCESSES:
                    if (fileExtension === '.bpmn') {
                        this.validateBPMNFile(filePath, errors, warnings);
                    }
                    break;
                case types_1.DAKComponentType.DECISION_LOGIC:
                    if (fileExtension === '.dmn') {
                        this.validateDMNFile(filePath, errors, warnings);
                    }
                    break;
                case types_1.DAKComponentType.DATA_ELEMENTS:
                    if (fileExtension === '.json' || fileExtension === '.fsh') {
                        this.validateFHIRProfileFile(filePath, errors, warnings);
                    }
                    break;
                // Add more component-specific validation as needed
            }
        }
        catch (error) {
            errors.push({
                code: 'VALIDATION_ERROR',
                message: `Error validating component file: ${error}`,
                filePath,
                component: componentType
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            timestamp: new Date()
        };
    }
    /**
     * Validate BPMN file basic structure
     */
    validateBPMNFile(filePath, errors, warnings) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            // Basic BPMN XML validation
            if (!content.includes('bpmn:definitions')) {
                errors.push({
                    code: 'INVALID_BPMN',
                    message: 'BPMN file must contain bpmn:definitions element',
                    filePath
                });
            }
            if (!content.includes('bpmn:process')) {
                errors.push({
                    code: 'MISSING_BPMN_PROCESS',
                    message: 'BPMN file must contain at least one bpmn:process element',
                    filePath
                });
            }
        }
        catch (error) {
            errors.push({
                code: 'BPMN_READ_ERROR',
                message: `Failed to read BPMN file: ${error}`,
                filePath
            });
        }
    }
    /**
     * Validate DMN file basic structure
     */
    validateDMNFile(filePath, errors, warnings) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            // Basic DMN XML validation
            if (!content.includes('dmn:definitions')) {
                errors.push({
                    code: 'INVALID_DMN',
                    message: 'DMN file must contain dmn:definitions element',
                    filePath
                });
            }
        }
        catch (error) {
            errors.push({
                code: 'DMN_READ_ERROR',
                message: `Failed to read DMN file: ${error}`,
                filePath
            });
        }
    }
    /**
     * Validate FHIR profile file basic structure
     */
    validateFHIRProfileFile(filePath, errors, warnings) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const fileExtension = path.extname(filePath).toLowerCase();
            if (fileExtension === '.json') {
                // Validate JSON structure
                const profile = JSON.parse(content);
                if (!profile.resourceType) {
                    errors.push({
                        code: 'MISSING_RESOURCE_TYPE',
                        message: 'FHIR profile must have resourceType field',
                        filePath
                    });
                }
            }
            else if (fileExtension === '.fsh') {
                // Basic FSH validation
                if (!content.includes('Profile:') && !content.includes('Extension:')) {
                    warnings.push({
                        code: 'UNRECOGNIZED_FSH',
                        message: 'FSH file should contain Profile: or Extension: definitions',
                        filePath
                    });
                }
            }
        }
        catch (error) {
            errors.push({
                code: 'FHIR_PROFILE_READ_ERROR',
                message: `Failed to read FHIR profile file: ${error}`,
                filePath
            });
        }
    }
}
exports.DAKValidationService = DAKValidationService;
//# sourceMappingURL=validation.js.map