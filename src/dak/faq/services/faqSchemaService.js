/**
 * FAQ Schema Service for React App
 * Provides access to question schemas and validation from the MCP server
 */

class FAQSchemaServiceReact {
  constructor() {
    this.baseUrl = 'http://127.0.0.1:3001';
    this.cache = new Map();
  }

  /**
   * Get all available question schemas
   */
  async getAllSchemas() {
    const cacheKey = 'all-schemas';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/faq/schemas`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.cache.set(cacheKey, data.schemas);
      return data.schemas;
    } catch (error) {
      console.error('Failed to fetch schemas:', error);
      return {};
    }
  }

  /**
   * Get schema for a specific question
   */
  async getQuestionSchema(questionId) {
    const cacheKey = `schema-${questionId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/faq/schemas/${questionId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.cache.set(cacheKey, data.schema);
      return data.schema;
    } catch (error) {
      console.error(`Failed to fetch schema for ${questionId}:`, error);
      return null;
    }
  }

  /**
   * Get OpenAPI schema for all questions
   */
  async getOpenAPISchema() {
    const cacheKey = 'openapi-schema';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/faq/openapi`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Failed to fetch OpenAPI schema:', error);
      return null;
    }
  }

  /**
   * Validate question parameters against schema
   */
  async validateQuestionParameters(questionId, parameters) {
    try {
      const response = await fetch(`${this.baseUrl}/faq/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ questionId, parameters })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.validation;
    } catch (error) {
      console.error(`Failed to validate parameters for ${questionId}:`, error);
      return {
        isValid: false,
        errors: [error.message]
      };
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Check if MCP server is available
   */
  async isServerAvailable() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get question schema in JSON Schema format for form generation
   */
  async getQuestionFormSchema(questionId) {
    const schema = await this.getQuestionSchema(questionId);
    if (!schema || !schema.input) {
      return null;
    }

    // Convert to JSON Forms schema format
    const formSchema = {
      type: 'object',
      properties: { ...schema.input.properties },
      required: schema.input.required || []
    };

    // Generate UI schema for better form rendering
    const uiSchema = {
      type: 'VerticalLayout',
      elements: Object.keys(formSchema.properties).map(key => ({
        type: 'Control',
        scope: `#/properties/${key}`,
        label: key.charAt(0).toUpperCase() + key.slice(1)
      }))
    };

    return { schema: formSchema, uiSchema };
  }
}

// Export a singleton instance
const faqSchemaService = new FAQSchemaServiceReact();
export default faqSchemaService;