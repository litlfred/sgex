# DAK Publication Template Schema

## Overview

This document defines the data schema and template structure for DAK publications that augment the WHO SMART Guidelines logical model with publication-specific metadata and content organization.

## Base DAK Logical Model Extension

### Publication Metadata Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "DAK Publication Schema",
  "description": "Extended schema for DAK publications following WHO SMART Guidelines logical model",
  "type": "object",
  "properties": {
    "publication": {
      "type": "object",
      "properties": {
        "metadata": {
          "$ref": "#/definitions/PublicationMetadata"
        },
        "structure": {
          "$ref": "#/definitions/PublicationStructure"
        },
        "formatting": {
          "$ref": "#/definitions/FormattingOptions"
        },
        "content": {
          "$ref": "#/definitions/ContentConfiguration"
        }
      },
      "required": ["metadata", "structure"]
    },
    "dakComponents": {
      "$ref": "#/definitions/DAKComponents"
    }
  },
  "definitions": {
    "PublicationMetadata": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "description": "Official publication title"
        },
        "subtitle": {
          "type": "string", 
          "description": "Optional publication subtitle"
        },
        "version": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+$",
          "description": "Semantic version number"
        },
        "status": {
          "type": "string",
          "enum": ["draft", "review", "approved", "published", "archived"],
          "description": "Publication status"
        },
        "authors": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Author"
          }
        },
        "organizations": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Organization"
          }
        },
        "publicationDate": {
          "type": "string",
          "format": "date",
          "description": "Publication release date"
        },
        "effectiveDate": {
          "type": "string", 
          "format": "date",
          "description": "Date when guidelines become effective"
        },
        "copyright": {
          "$ref": "#/definitions/Copyright"
        },
        "identifiers": {
          "$ref": "#/definitions/Identifiers"
        },
        "language": {
          "type": "string",
          "pattern": "^[a-z]{2}(-[A-Z]{2})?$",
          "default": "en-US",
          "description": "Primary language (ISO 639-1 with optional region)"
        },
        "keywords": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Keywords for searchability and categorization"
        },
        "abstract": {
          "type": "string",
          "description": "Publication abstract or executive summary"
        }
      },
      "required": ["title", "version", "status", "authors", "publicationDate"]
    },
    "Author": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "affiliation": {
          "type": "string"
        },
        "email": {
          "type": "string",
          "format": "email"
        },
        "orcid": {
          "type": "string",
          "pattern": "^\\d{4}-\\d{4}-\\d{4}-\\d{3}[\\dX]$"
        },
        "role": {
          "type": "string",
          "enum": ["lead-author", "co-author", "contributor", "reviewer", "editor"]
        }
      },
      "required": ["name", "role"]
    },
    "Organization": {
      "type": "object", 
      "properties": {
        "name": {
          "type": "string"
        },
        "acronym": {
          "type": "string"
        },
        "url": {
          "type": "string",
          "format": "uri"
        },
        "logo": {
          "type": "string",
          "format": "uri"
        },
        "role": {
          "type": "string",
          "enum": ["publisher", "sponsor", "collaborator", "endorser"]
        }
      },
      "required": ["name", "role"]
    },
    "Copyright": {
      "type": "object",
      "properties": {
        "statement": {
          "type": "string",
          "description": "Copyright statement text"
        },
        "year": {
          "type": "integer",
          "minimum": 2020,
          "maximum": 2030
        },
        "holder": {
          "type": "string",
          "description": "Copyright holder name"
        },
        "license": {
          "$ref": "#/definitions/License"
        }
      },
      "required": ["statement", "year", "holder"]
    },
    "License": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["CC-BY", "CC-BY-SA", "CC-BY-NC", "CC0", "WHO-Standard", "Custom"]
        },
        "url": {
          "type": "string",
          "format": "uri"
        },
        "text": {
          "type": "string",
          "description": "Full license text"
        }
      },
      "required": ["type"]
    },
    "Identifiers": {
      "type": "object",
      "properties": {
        "doi": {
          "type": "string",
          "pattern": "^10\\.\\d+/.+$",
          "description": "Digital Object Identifier"
        },
        "isbn": {
          "type": "string",
          "pattern": "^(97[89])?\\d{9}[\\dX]$",
          "description": "International Standard Book Number"
        },
        "whoReference": {
          "type": "string",
          "description": "WHO internal reference number"
        },
        "githubRepository": {
          "type": "string",
          "format": "uri",
          "description": "Source GitHub repository URL"
        }
      }
    },
    "PublicationStructure": {
      "type": "object",
      "properties": {
        "preMatter": {
          "$ref": "#/definitions/PreMatter"
        },
        "mainContent": {
          "$ref": "#/definitions/MainContent"
        },
        "postMatter": {
          "$ref": "#/definitions/PostMatter"
        },
        "navigation": {
          "$ref": "#/definitions/NavigationStructure"
        }
      }
    },
    "PreMatter": {
      "type": "object",
      "properties": {
        "titlePage": {
          "type": "boolean",
          "default": true,
          "description": "Include dedicated title page"
        },
        "tableOfContents": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean",
              "default": true
            },
            "depth": {
              "type": "integer",
              "minimum": 1,
              "maximum": 6,
              "default": 3
            },
            "includePageNumbers": {
              "type": "boolean",
              "default": true
            }
          }
        },
        "executiveSummary": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean",
              "default": true
            },
            "content": {
              "type": "string",
              "description": "Markdown content for executive summary"
            },
            "maxLength": {
              "type": "integer",
              "default": 1000,
              "description": "Maximum character count for summary"
            }
          }
        },
        "acknowledgments": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean",
              "default": true
            },
            "content": {
              "type": "string",
              "description": "Markdown content for acknowledgments"
            }
          }
        },
        "glossary": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean",
              "default": true
            },
            "autoGenerate": {
              "type": "boolean",
              "default": true,
              "description": "Auto-generate from terminology in DAK components"
            },
            "customTerms": {
              "type": "array",
              "items": {
                "$ref": "#/definitions/GlossaryTerm"
              }
            }
          }
        },
        "acronyms": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean", 
              "default": true
            },
            "autoGenerate": {
              "type": "boolean",
              "default": true
            }
          }
        }
      }
    },
    "GlossaryTerm": {
      "type": "object",
      "properties": {
        "term": {
          "type": "string"
        },
        "definition": {
          "type": "string"
        },
        "source": {
          "type": "string",
          "description": "Source reference (OCL, WHO, etc.)"
        },
        "relatedTerms": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      },
      "required": ["term", "definition"]
    },
    "MainContent": {
      "type": "object",
      "properties": {
        "componentOrder": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "health-interventions",
              "personas", 
              "user-scenarios",
              "business-processes",
              "core-data-elements",
              "decision-support-logic",
              "program-indicators",
              "requirements",
              "test-scenarios"
            ]
          },
          "description": "Order of DAK components in publication"
        },
        "componentSettings": {
          "type": "object",
          "additionalProperties": {
            "$ref": "#/definitions/ComponentSettings"
          }
        },
        "sectionBreaks": {
          "type": "object",
          "properties": {
            "pageBreakBefore": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "Components that should start on new page"
            }
          }
        }
      }
    },
    "ComponentSettings": {
      "type": "object",
      "properties": {
        "include": {
          "type": "boolean",
          "default": true,
          "description": "Include this component in publication"
        },
        "title": {
          "type": "string",
          "description": "Custom title for component section"
        },
        "introduction": {
          "type": "string",
          "description": "Introduction text for component section"
        },
        "includeAssets": {
          "type": "boolean",
          "default": true,
          "description": "Include individual assets/files"
        },
        "assetFilters": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "File patterns to include/exclude"
        },
        "diagramSettings": {
          "$ref": "#/definitions/DiagramSettings"
        }
      }
    },
    "DiagramSettings": {
      "type": "object",
      "properties": {
        "format": {
          "type": "string",
          "enum": ["svg", "png", "jpg"],
          "default": "svg"
        },
        "resolution": {
          "type": "integer",
          "minimum": 72,
          "maximum": 300,
          "default": 150,
          "description": "DPI for raster formats"
        },
        "maxWidth": {
          "type": "integer",
          "default": 800,
          "description": "Maximum width in pixels"
        },
        "includeSource": {
          "type": "boolean",
          "default": false,
          "description": "Include source XML/JSON as appendix"
        }
      }
    },
    "PostMatter": {
      "type": "object",
      "properties": {
        "appendices": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean",
              "default": true
            },
            "autoGenerate": {
              "type": "boolean",
              "default": true,
              "description": "Auto-generate technical appendices"
            },
            "customAppendices": {
              "type": "array",
              "items": {
                "$ref": "#/definitions/Appendix"
              }
            }
          }
        },
        "references": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean",
              "default": true
            },
            "autoGenerate": {
              "type": "boolean",
              "default": true,
              "description": "Auto-generate from citations in content"
            },
            "customReferences": {
              "type": "array",
              "items": {
                "$ref": "#/definitions/Reference"
              }
            },
            "style": {
              "type": "string",
              "enum": ["apa", "mla", "chicago", "who-standard"],
              "default": "who-standard"
            }
          }
        },
        "versionHistory": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean",
              "default": true
            },
            "includeGitHistory": {
              "type": "boolean",
              "default": false,
              "description": "Include Git commit history"
            }
          }
        }
      }
    },
    "Appendix": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string"
        },
        "content": {
          "type": "string",
          "description": "Markdown content"
        },
        "order": {
          "type": "integer",
          "description": "Sort order"
        }
      },
      "required": ["title", "content"]
    },
    "Reference": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "type": {
          "type": "string",
          "enum": ["book", "article", "website", "guideline", "standard"]
        },
        "title": {
          "type": "string"
        },
        "authors": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "year": {
          "type": "integer"
        },
        "publisher": {
          "type": "string"
        },
        "url": {
          "type": "string",
          "format": "uri"
        },
        "doi": {
          "type": "string"
        }
      },
      "required": ["id", "type", "title"]
    },
    "NavigationStructure": {
      "type": "object",
      "properties": {
        "breadcrumbs": {
          "type": "boolean",
          "default": true
        },
        "sectionNumbers": {
          "type": "boolean",
          "default": true
        },
        "crossReferences": {
          "type": "boolean",
          "default": true,
          "description": "Enable automatic cross-referencing between sections"
        },
        "backToTop": {
          "type": "boolean",
          "default": true
        }
      }
    },
    "FormattingOptions": {
      "type": "object",
      "properties": {
        "template": {
          "type": "string",
          "default": "who-standard",
          "description": "Template identifier"
        },
        "branding": {
          "$ref": "#/definitions/BrandingOptions"
        },
        "typography": {
          "$ref": "#/definitions/TypographyOptions"
        },
        "layout": {
          "$ref": "#/definitions/LayoutOptions"
        },
        "outputFormats": {
          "$ref": "#/definitions/OutputFormats"
        }
      }
    },
    "BrandingOptions": {
      "type": "object",
      "properties": {
        "primaryColor": {
          "type": "string",
          "pattern": "^#[0-9A-Fa-f]{6}$",
          "default": "#0093D1",
          "description": "WHO Blue"
        },
        "secondaryColor": {
          "type": "string", 
          "pattern": "^#[0-9A-Fa-f]{6}$",
          "default": "#00A651",
          "description": "WHO Green"
        },
        "accentColor": {
          "type": "string",
          "pattern": "^#[0-9A-Fa-f]{6}$", 
          "default": "#F39C12",
          "description": "WHO Orange"
        },
        "logo": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "format": "uri"
            },
            "width": {
              "type": "integer",
              "default": 120
            },
            "height": {
              "type": "integer",
              "default": 60
            },
            "position": {
              "type": "string",
              "enum": ["header-left", "header-center", "header-right", "footer"],
              "default": "header-left"
            }
          }
        }
      }
    },
    "TypographyOptions": {
      "type": "object",
      "properties": {
        "fontFamily": {
          "type": "string",
          "default": "Arial, sans-serif"
        },
        "fontSize": {
          "type": "object",
          "properties": {
            "base": {
              "type": "integer",
              "default": 12,
              "description": "Base font size in points"
            },
            "headings": {
              "type": "object",
              "properties": {
                "h1": {
                  "type": "integer",
                  "default": 24
                },
                "h2": {
                  "type": "integer", 
                  "default": 20
                },
                "h3": {
                  "type": "integer",
                  "default": 16
                }
              }
            }
          }
        },
        "lineHeight": {
          "type": "number",
          "default": 1.5
        }
      }
    },
    "LayoutOptions": {
      "type": "object",
      "properties": {
        "pageSize": {
          "type": "string",
          "enum": ["A4", "Letter", "Legal", "A3"],
          "default": "A4"
        },
        "margins": {
          "type": "object",
          "properties": {
            "top": {
              "type": "number",
              "default": 2.5,
              "description": "Margin in centimeters"
            },
            "bottom": {
              "type": "number",
              "default": 2.5
            },
            "left": {
              "type": "number",
              "default": 2.5
            },
            "right": {
              "type": "number",
              "default": 2.5
            }
          }
        },
        "columns": {
          "type": "integer",
          "minimum": 1,
          "maximum": 3,
          "default": 1
        },
        "headerFooter": {
          "type": "object",
          "properties": {
            "includeHeader": {
              "type": "boolean",
              "default": true
            },
            "includeFooter": {
              "type": "boolean",
              "default": true
            },
            "pageNumbers": {
              "type": "boolean",
              "default": true
            }
          }
        }
      }
    },
    "OutputFormats": {
      "type": "object",
      "properties": {
        "html": {
          "$ref": "#/definitions/HTMLFormat"
        },
        "pdf": {
          "$ref": "#/definitions/PDFFormat"
        },
        "docx": {
          "$ref": "#/definitions/WordFormat"
        }
      }
    },
    "HTMLFormat": {
      "type": "object",
      "properties": {
        "enabled": {
          "type": "boolean",
          "default": true
        },
        "singlePage": {
          "type": "boolean",
          "default": false,
          "description": "Generate single page vs. multi-page navigation"
        },
        "includeSearch": {
          "type": "boolean",
          "default": true
        },
        "responsive": {
          "type": "boolean",
          "default": true
        },
        "includeNavigation": {
          "type": "boolean",
          "default": true
        },
        "theme": {
          "type": "string",
          "enum": ["light", "dark", "auto"],
          "default": "light"
        }
      }
    },
    "PDFFormat": {
      "type": "object",
      "properties": {
        "enabled": {
          "type": "boolean",
          "default": true
        },
        "includeBookmarks": {
          "type": "boolean",
          "default": true
        },
        "includeHyperlinks": {
          "type": "boolean",
          "default": true
        },
        "watermark": {
          "type": "string",
          "description": "Watermark text for draft versions"
        },
        "security": {
          "type": "object",
          "properties": {
            "preventPrinting": {
              "type": "boolean",
              "default": false
            },
            "preventCopying": {
              "type": "boolean",
              "default": false
            }
          }
        }
      }
    },
    "WordFormat": {
      "type": "object",
      "properties": {
        "enabled": {
          "type": "boolean",
          "default": true
        },
        "includeTrackChanges": {
          "type": "boolean",
          "default": false
        },
        "includeComments": {
          "type": "boolean",
          "default": false
        },
        "styleTemplate": {
          "type": "string",
          "description": "Word template file for styling"
        }
      }
    },
    "ContentConfiguration": {
      "type": "object",
      "properties": {
        "aggregationRules": {
          "$ref": "#/definitions/AggregationRules"
        },
        "contentFilters": {
          "$ref": "#/definitions/ContentFilters"
        },
        "crossReferences": {
          "$ref": "#/definitions/CrossReferences"
        }
      }
    },
    "AggregationRules": {
      "type": "object",
      "properties": {
        "includeDrafts": {
          "type": "boolean",
          "default": false,
          "description": "Include assets marked as draft"
        },
        "includeDeprecated": {
          "type": "boolean",
          "default": false
        },
        "mergeDuplicates": {
          "type": "boolean",
          "default": true,
          "description": "Merge duplicate content across components"
        },
        "sortOrder": {
          "type": "string",
          "enum": ["alphabetical", "chronological", "manual", "priority"],
          "default": "manual"
        }
      }
    },
    "ContentFilters": {
      "type": "object",
      "properties": {
        "includePatterns": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "File patterns to include"
        },
        "excludePatterns": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "File patterns to exclude"
        },
        "statusFilters": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["draft", "review", "approved", "published"]
          },
          "description": "Include only content with these statuses"
        }
      }
    },
    "CrossReferences": {
      "type": "object",
      "properties": {
        "autoGenerate": {
          "type": "boolean",
          "default": true,
          "description": "Automatically generate cross-references"
        },
        "linkBetweenComponents": {
          "type": "boolean",
          "default": true,
          "description": "Create links between related DAK components"
        },
        "includeLineNumbers": {
          "type": "boolean",
          "default": false,
          "description": "Include line numbers for code references"
        }
      }
    },
    "DAKComponents": {
      "type": "object",
      "description": "References to the 9 core DAK components",
      "properties": {
        "healthInterventions": {
          "$ref": "#/definitions/HealthInterventionsComponent"
        },
        "personas": {
          "$ref": "#/definitions/PersonasComponent"
        },
        "userScenarios": {
          "$ref": "#/definitions/UserScenariosComponent"
        },
        "businessProcesses": {
          "$ref": "#/definitions/BusinessProcessesComponent"
        },
        "coreDataElements": {
          "$ref": "#/definitions/CoreDataElementsComponent"
        },
        "decisionSupportLogic": {
          "$ref": "#/definitions/DecisionSupportLogicComponent"
        },
        "programIndicators": {
          "$ref": "#/definitions/ProgramIndicatorsComponent"
        },
        "requirements": {
          "$ref": "#/definitions/RequirementsComponent"
        },
        "testScenarios": {
          "$ref": "#/definitions/TestScenariosComponent"
        }
      }
    },
    "HealthInterventionsComponent": {
      "type": "object",
      "properties": {
        "irisReferences": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "title": {
                "type": "string"
              },
              "url": {
                "type": "string",
                "format": "uri"
              },
              "publicationYear": {
                "type": "integer"
              }
            }
          }
        },
        "customContent": {
          "type": "string",
          "description": "Additional markdown content"
        }
      }
    },
    "PersonasComponent": {
      "type": "object",
      "properties": {
        "actorDefinitions": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "responsibilities": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "UserScenariosComponent": {
      "type": "object",
      "properties": {
        "scenarios": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "title": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "actors": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "workflow": {
                "type": "string",
                "description": "Reference to business process"
              }
            }
          }
        }
      }
    },
    "BusinessProcessesComponent": {
      "type": "object",
      "properties": {
        "bpmnFiles": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "path": {
                "type": "string"
              },
              "title": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "svgGenerated": {
                "type": "boolean",
                "default": true
              }
            }
          }
        }
      }
    },
    "CoreDataElementsComponent": {
      "type": "object",
      "properties": {
        "terminologyFiles": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "OCL terminology file references"
        },
        "productCatalogs": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "PCMT product catalog references"
        },
        "dataDictionaries": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Data dictionary file references"
        }
      }
    },
    "DecisionSupportLogicComponent": {
      "type": "object",
      "properties": {
        "dmnFiles": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "path": {
                "type": "string"
              },
              "title": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "inputRequirements": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "outputDecisions": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "ProgramIndicatorsComponent": {
      "type": "object",
      "properties": {
        "indicators": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "formula": {
                "type": "string"
              },
              "dataElements": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "frequency": {
                "type": "string",
                "enum": ["daily", "weekly", "monthly", "quarterly", "annually"]
              }
            }
          }
        }
      }
    },
    "RequirementsComponent": {
      "type": "object",
      "properties": {
        "functionalRequirements": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "title": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "priority": {
                "type": "string",
                "enum": ["high", "medium", "low"]
              }
            }
          }
        },
        "nonFunctionalRequirements": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "category": {
                "type": "string",
                "enum": ["performance", "security", "usability", "reliability"]
              },
              "requirement": {
                "type": "string"
              }
            }
          }
        }
      }
    },
    "TestScenariosComponent": {
      "type": "object",
      "properties": {
        "featureFiles": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "path": {
                "type": "string"
              },
              "feature": {
                "type": "string"
              },
              "scenarios": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          }
        },
        "testCases": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "steps": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              },
              "expectedResult": {
                "type": "string"
              }
            }
          }
        }
      }
    }
  }
}
```

## Example Publication Configuration

```json
{
  "publication": {
    "metadata": {
      "title": "WHO SMART Guidelines for Immunization",
      "subtitle": "Digital Adaptation Kit v2.1.0",
      "version": "2.1.0",
      "status": "published",
      "authors": [
        {
          "name": "Dr. Jane Smith",
          "affiliation": "World Health Organization",
          "email": "jsmith@who.int",
          "role": "lead-author"
        }
      ],
      "organizations": [
        {
          "name": "World Health Organization",
          "acronym": "WHO",
          "url": "https://www.who.int",
          "logo": "https://www.who.int/images/logo.png",
          "role": "publisher"
        }
      ],
      "publicationDate": "2024-03-15",
      "copyright": {
        "statement": "© World Health Organization 2024",
        "year": 2024,
        "holder": "World Health Organization",
        "license": {
          "type": "CC-BY",
          "url": "https://creativecommons.org/licenses/by/4.0/"
        }
      },
      "identifiers": {
        "whoReference": "WHO/HIS/SDS/2024.1",
        "githubRepository": "https://github.com/WorldHealthOrganization/smart-immunizations"
      },
      "language": "en-US",
      "keywords": ["immunization", "vaccines", "digital health", "WHO", "SMART Guidelines"],
      "abstract": "This Digital Adaptation Kit provides structured guidance for implementing WHO immunization guidelines in digital health systems."
    },
    "structure": {
      "preMatter": {
        "titlePage": true,
        "tableOfContents": {
          "enabled": true,
          "depth": 3,
          "includePageNumbers": true
        },
        "executiveSummary": {
          "enabled": true,
          "content": "## Executive Summary\n\nThis DAK provides comprehensive guidance for implementing immunization programs...",
          "maxLength": 2000
        },
        "acknowledgments": {
          "enabled": true,
          "content": "The WHO acknowledges the contributions of..."
        },
        "glossary": {
          "enabled": true,
          "autoGenerate": true
        }
      },
      "mainContent": {
        "componentOrder": [
          "health-interventions",
          "personas", 
          "user-scenarios",
          "business-processes",
          "core-data-elements",
          "decision-support-logic",
          "program-indicators",
          "requirements",
          "test-scenarios"
        ],
        "componentSettings": {
          "business-processes": {
            "title": "Immunization Workflows",
            "introduction": "This section describes the core business processes for immunization delivery.",
            "diagramSettings": {
              "format": "svg",
              "maxWidth": 800,
              "includeSource": false
            }
          }
        }
      }
    },
    "formatting": {
      "template": "who-standard",
      "branding": {
        "primaryColor": "#0093D1",
        "logo": {
          "url": "https://www.who.int/logo.png",
          "position": "header-left"
        }
      },
      "outputFormats": {
        "html": {
          "enabled": true,
          "singlePage": false,
          "includeSearch": true
        },
        "pdf": {
          "enabled": true,
          "includeBookmarks": true,
          "watermark": ""
        },
        "docx": {
          "enabled": true,
          "includeTrackChanges": false
        }
      }
    }
  }
}
```

## Implementation Notes

### Template Variable System

Templates can reference DAK content using a variable syntax:

```handlebars
{{publication.metadata.title}}
{{#each dakComponents.businessProcesses.bpmnFiles}}
  <h3>{{title}}</h3>
  <p>{{description}}</p>
  <img src="{{svgPath}}" alt="{{title}} BPMN Diagram" />
{{/each}}
```

### Content Aggregation Pipeline

1. **Extract**: Read content from all DAK component files
2. **Transform**: Convert to standardized format (Markdown, JSON)
3. **Aggregate**: Combine according to publication structure
4. **Template**: Apply publication template with variables
5. **Export**: Generate final output formats

### Integration Points

- **GitHub Integration**: Store publication configs in `.sgex/publication.json`
- **Component Editors**: Extract content through existing editor APIs
- **Template Registry**: Manage templates via extended `dak-templates.json`
- **Export Pipeline**: Integrate with existing asset management system

This schema provides a comprehensive foundation for implementing DAK publications while maintaining compatibility with the existing WHO SMART Guidelines logical model and SGeX Workbench architecture.