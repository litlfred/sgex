/**
 * Core types and interfaces for DAK FAQ system
 */

/**
 * Question hierarchy levels
 */
export const QuestionLevel = {
  DAK: 'dak',
  COMPONENT: 'component', 
  ASSET: 'asset'
};

/**
 * Question metadata definition
 */
export class QuestionDefinition {
  constructor({
    id,
    level,
    title,
    description,
    parameters = [],
    tags = [],
    version = '1.0.0',
    isTemplate = false,
    componentTypes = [],
    assetTypes = []
  }) {
    this.id = id;
    this.level = level;
    this.title = title;
    this.description = description;
    this.parameters = parameters;
    this.tags = tags;
    this.version = version;
    this.isTemplate = isTemplate;
    this.componentTypes = componentTypes;
    this.assetTypes = assetTypes;
  }
}

/**
 * Parameter definition for questions
 */
export class ParameterDefinition {
  constructor({
    name,
    type = 'string',
    required = false,
    description = '',
    defaultValue = null,
    validation = {}
  }) {
    this.name = name;
    this.type = type;
    this.required = required;
    this.description = description;
    this.defaultValue = defaultValue;
    this.validation = validation;
  }
}

/**
 * Question execution context
 */
export class QuestionContext {
  constructor({
    repository,
    locale = 'en_US',
    branch = 'main',
    user = null,
    assetFile = null,
    componentType = null,
    storage = null
  }) {
    this.repository = repository;
    this.locale = locale;
    this.branch = branch;
    this.user = user;
    this.assetFile = assetFile;
    this.componentType = componentType;
    this.storage = storage;
  }
}

/**
 * Question execution result
 */
export class QuestionResult {
  constructor({
    structured = {},
    narrative = '',
    warnings = [],
    errors = [],
    meta = {}
  }) {
    this.structured = structured;
    this.narrative = narrative;
    this.warnings = warnings;
    this.errors = errors;
    this.meta = meta;
  }
}

/**
 * Cache hint for FAQ answers
 */
export class CacheHint {
  constructor({
    scope = 'repository',
    key = '',
    ttl = 3600, // 1 hour default
    dependencies = []
  }) {
    this.scope = scope;
    this.key = key;
    this.ttl = ttl;
    this.dependencies = dependencies;
  }
}