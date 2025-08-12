/**
 * JSON Schema Generation Utility
 * 
 * This utility generates JSON schemas from TypeScript types and interfaces.
 * It provides both programmatic API and command-line functionality for
 * automated schema generation during build processes.
 */

import * as TJS from 'typescript-json-schema';
import * as fs from 'fs';
import * as path from 'path';

export interface SchemaGenerationConfig {
  typeFiles: string[];
  outputDir: string;
  includeTypes?: string[];
  excludeTypes?: string[];
  settings?: TJS.PartialArgs;
}

export interface GeneratedSchema {
  typeName: string;
  schema: any;
  filePath: string;
}

export class SchemaGenerator {
  private config: SchemaGenerationConfig;
  private program?: TJS.Program;

  constructor(config: SchemaGenerationConfig) {
    this.config = {
      settings: {
        required: true,
        titles: true,
        topRef: false,
        noExtraProps: true,
        strictNullChecks: true,
        ignoreErrors: false,
        include: config.includeTypes,
        exclude: config.excludeTypes
      } as TJS.PartialArgs,
      ...config
    };
  }

  /**
   * Initialize the TypeScript program for schema generation
   */
  private initializeProgram(): void {
    if (!this.program) {
      this.program = TJS.getProgramFromFiles(
        this.config.typeFiles,
        {
          strictNullChecks: true,
          esModuleInterop: true,
          skipLibCheck: true
        }
      );
    }
  }

  /**
   * Generate schema for a specific type
   */
  generateSchemaForType(typeName: string): any {
    this.initializeProgram();
    
    if (!this.program) {
      throw new Error('Failed to initialize TypeScript program');
    }

    const schema = TJS.generateSchema(this.program, typeName, this.config.settings);
    
    if (!schema) {
      throw new Error(`Failed to generate schema for type: ${typeName}`);
    }

    return schema;
  }

  /**
   * Generate schemas for all exported types
   */
  generateAllSchemas(): GeneratedSchema[] {
    this.initializeProgram();
    
    if (!this.program) {
      throw new Error('Failed to initialize TypeScript program');
    }

    // Get all symbols from the program
    const generator = TJS.buildGenerator(this.program, this.config.settings);
    
    if (!generator) {
      throw new Error('Failed to create schema generator');
    }

    const symbols = generator.getUserSymbols();
    const generatedSchemas: GeneratedSchema[] = [];

    for (const symbolName of symbols) {
      try {
        // Skip internal or excluded types
        if (this.shouldSkipType(symbolName)) {
          continue;
        }

        const schema = generator.getSchemaForSymbol(symbolName);
        
        if (schema) {
          const fileName = `${symbolName}.schema.json`;
          const filePath = path.join(this.config.outputDir, fileName);
          
          generatedSchemas.push({
            typeName: symbolName,
            schema,
            filePath
          });
        }
      } catch (error) {
        console.warn(`Failed to generate schema for ${symbolName}:`, error);
      }
    }

    return generatedSchemas;
  }

  /**
   * Save schemas to files
   */
  async saveSchemas(schemas: GeneratedSchema[]): Promise<void> {
    // Ensure output directory exists
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }

    const savePromises = schemas.map(async ({ schema, filePath, typeName }) => {
      try {
        const schemaJson = JSON.stringify(schema, null, 2);
        await fs.promises.writeFile(filePath, schemaJson, 'utf8');
        console.log(`Generated schema for ${typeName}: ${filePath}`);
      } catch (error) {
        console.error(`Failed to save schema for ${typeName}:`, error);
        throw error;
      }
    });

    await Promise.all(savePromises);
  }

  /**
   * Generate a combined schema file with all types
   */
  generateCombinedSchema(): any {
    this.initializeProgram();
    
    if (!this.program) {
      throw new Error('Failed to initialize TypeScript program');
    }

    const generator = TJS.buildGenerator(this.program, this.config.settings);
    
    if (!generator) {
      throw new Error('Failed to create schema generator');
    }

    const symbols = generator.getUserSymbols();
    const combinedSchema: any = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'SGEX Workbench Type Definitions',
      description: 'Combined JSON schemas for all SGEX Workbench types',
      definitions: {}
    };

    for (const symbolName of symbols) {
      try {
        if (this.shouldSkipType(symbolName)) {
          continue;
        }

        const schema = generator.getSchemaForSymbol(symbolName);
        
        if (schema) {
          combinedSchema.definitions[symbolName] = schema;
        }
      } catch (error) {
        console.warn(`Failed to generate schema for ${symbolName}:`, error);
      }
    }

    return combinedSchema;
  }

  /**
   * Generate and save all schemas
   */
  async generateAndSave(): Promise<GeneratedSchema[]> {
    const schemas = this.generateAllSchemas();
    await this.saveSchemas(schemas);

    // Also generate combined schema
    const combinedSchema = this.generateCombinedSchema();
    const combinedFilePath = path.join(this.config.outputDir, 'combined.schema.json');
    
    await fs.promises.writeFile(
      combinedFilePath, 
      JSON.stringify(combinedSchema, null, 2), 
      'utf8'
    );

    console.log(`Generated combined schema: ${combinedFilePath}`);

    return schemas;
  }

  /**
   * Check if a type should be skipped
   */
  private shouldSkipType(typeName: string): boolean {
    // Skip utility types, React types, and internal types
    const skipPatterns = [
      /^React\./,
      /^JSX\./,
      /^Partial</,
      /^Pick</,
      /^Omit</,
      /^Record</,
      /^Exclude</,
      /^Extract</,
      /^ReturnType</,
      /^Parameters</,
      /^ConstructorParameters</,
      /^InstanceType</,
      /^ThisParameterType</,
      /^OmitThisParameter</,
      /^ThisType</,
      /^Required</,
      /^Readonly</,
      /^NonNullable</,
      /^__/
    ];

    if (skipPatterns.some(pattern => pattern.test(typeName))) {
      return true;
    }

    // Check exclude list
    if (this.config.excludeTypes && this.config.excludeTypes.includes(typeName)) {
      return true;
    }

    // Check include list (if specified, only include listed types)
    if (this.config.includeTypes && this.config.includeTypes.length > 0) {
      return !this.config.includeTypes.includes(typeName);
    }

    return false;
  }
}

/**
 * CLI function for schema generation
 */
export async function generateSchemasFromCLI(): Promise<void> {
  const typeFiles = ['src/types/**/*.ts'];
  const outputDir = 'public/docs/schemas';

  const generator = new SchemaGenerator({
    typeFiles,
    outputDir,
    settings: {
      required: true,
      titles: true,
      topRef: false,
      noExtraProps: true,
      strictNullChecks: true,
      ignoreErrors: false
    } as TJS.PartialArgs
  });

  try {
    const schemas = await generator.generateAndSave();
    console.log(`Successfully generated ${schemas.length} schemas`);
    
    // Generate index file for easy imports
    const indexContent = schemas.map(schema => 
      `export { default as ${schema.typeName}Schema } from './${path.basename(schema.filePath)}';`
    ).join('\n');
    
    const indexPath = path.join(outputDir, 'index.ts');
    await fs.promises.writeFile(indexPath, indexContent, 'utf8');
    console.log(`Generated schema index: ${indexPath}`);
    
  } catch (error) {
    console.error('Schema generation failed:', error);
    process.exit(1);
  }
}

// Export default generator for programmatic use
export const defaultSchemaGenerator = new SchemaGenerator({
  typeFiles: ['src/types/**/*.ts'],
  outputDir: 'public/docs/schemas'
});

// Run CLI if this file is executed directly
if (require.main === module) {
  generateSchemasFromCLI();
}