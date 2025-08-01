/**
 * Enhanced FSH (FHIR Shorthand) syntax definition for improved syntax highlighting
 * Based on the FHIR Shorthand specification and VSCode FSH extension patterns
 */

/**
 * Enhanced FSH language definition for Prism.js
 */
export const enhancedFSHSyntax = {
  // Block comments and line comments
  'comment': [
    {
      pattern: /\/\*[\s\S]*?\*\//,
      greedy: true
    },
    {
      pattern: /\/\/.*/,
      greedy: true
    }
  ],

  // String literals with proper escaping
  'string': {
    pattern: /"(?:[^"\\]|\\.)*"/,
    greedy: true
  },

  // FSH resource definition keywords
  'fsh-definition': {
    pattern: /\b(?:Profile|Extension|Instance|ValueSet|CodeSystem|ConceptMap|StructureDefinition|Logical|Resource|Mapping|RuleSet|Invariant|Alias|ImplementationGuide)\b(?=\s*:)/,
    alias: 'keyword'
  },

  // FSH metadata keywords
  'fsh-metadata': {
    pattern: /\b(?:Parent|Id|Title|Description|Usage|Severity|Expression|Source|Target|Equivalence|Comment|XPath|InstanceOf|Status|Experimental|Date|Publisher|Contact|Copyright|Purpose|Version)\b(?=\s*:)/,
    alias: 'property'
  },

  // FSH constraint keywords
  'fsh-constraint': {
    pattern: /\b(?:only|or|and|from|exactly|contains|named|insert|include|exclude|obeys|must|support|where|invariant|constraint)\b/,
    alias: 'builtin'
  },

  // FSH cardinality patterns
  'fsh-cardinality': {
    pattern: /\b(?:\d+|\*)\.\.(?:\d+|\*)\b|\b\d+\b(?=\s*\.\.\s*)/,
    alias: 'number'
  },

  // FHIR data types - comprehensive list
  'fsh-datatype': {
    pattern: /\b(?:base64Binary|boolean|canonical|code|date|dateTime|decimal|id|instant|integer|integer64|markdown|oid|positiveInt|string|time|unsignedInt|uri|url|uuid|xhtml|Address|Age|Annotation|Attachment|BackboneElement|CodeableConcept|CodeableReference|Coding|ContactDetail|ContactPoint|Contributor|Count|DataRequirement|Distance|Dosage|Duration|Element|ElementDefinition|Expression|Extension|HumanName|Identifier|Meta|Money|Narrative|ParameterDefinition|Period|ProdCharacteristic|ProductShelfLife|Quantity|Range|Ratio|RatioRange|Reference|RelatedArtifact|SampledData|Signature|Timing|TriggerDefinition|UsageContext|Device|DiagnosticReport|Observation|Patient|Practitioner|Organization|Location|Encounter|Procedure|Medication|MedicationStatement|Condition|AllergyIntolerance|Immunization|FamilyMemberHistory|CarePlan|Goal|ServiceRequest|Claim|Coverage|ExplanationOfBenefit|Account|ChargeItem|Contract|PaymentNotice|PaymentReconciliation|EnrollmentRequest|EnrollmentResponse|EligibilityRequest|EligibilityResponse|ClaimResponse|VisionPrescription|MedicationRequest|MedicationDispense|MedicationAdministration|SupplyRequest|SupplyDelivery|InventoryReport|Substance|Specimen|BodyStructure|ImagingStudy|Media|Questionnaire|QuestionnaireResponse|List|Composition|DocumentManifest|DocumentReference|CatalogEntry|Basic|Binary|Bundle|CapabilityStatement|CompartmentDefinition|ConceptMap|GraphDefinition|ImplementationGuide|MessageDefinition|MessageHeader|NamingSystem|OperationDefinition|OperationOutcome|Parameters|SearchParameter|StructureDefinition|StructureMap|TerminologyCapabilities|TestReport|TestScript|ValueSet|CodeSystem|Provenance|AuditEvent|Consent|DetectedIssue|AdverseEvent|RiskAssessment|GuidanceResponse|Library|Measure|MeasureReport|PlanDefinition|ActivityDefinition|DeviceDefinition|SubstanceDefinition|ManufacturedItemDefinition|PackagedProductDefinition|AdministrableProductDefinition|Ingredient|ClinicalUseDefinition|RegulatedAuthorization|MedicinalProductDefinition|Citation|Evidence|EvidenceReport|EvidenceVariable|ResearchDefinition|ResearchElementDefinition|ResearchStudy|ResearchSubject|ActorDefinition|Requirements|SubscriptionTopic|TestPlan|InventoryItem|GenomicStudy|Transport|NutritionOrder|NutritionProduct|NutritionIntake|BiologicallyDerivedProduct|BiologicallyDerivedProductDispense|ImmunizationEvaluation|ImmunizationRecommendation|DeviceUsage|DeviceRequest|DeviceDispense|DeviceAssociation|DeviceMetric|ClinicalImpression|RiskProfile|Task|Appointment|AppointmentResponse|Schedule|Slot|VerificationResult|Person|Patient|RelatedPerson|PractitionerRole|CareTeam|HealthcareService|Endpoint|Group|Communication|CommunicationRequest|EventDefinition|Flag|Invoice|LineItem|MolecularSequence|Permission|Subscription|SubscriptionStatus|Topic)\b/,
    alias: 'class-name'
  },

  // FSH element paths and references
  'fsh-path': {
    pattern: /\*\s+[\w.[\]]+(?:\s*=|\s*:|\s*only|\s*from)/,
    inside: {
      'punctuation': /[.[\]]/,
      'operator': /[=:]/,
      'fsh-constraint': /\b(?:only|from)\b/
    }
  },

  // Code system and value set references
  'fsh-reference': {
    pattern: /\b(?:http:\/\/|https:\/\/|urn:)[^\s"]+\b/,
    alias: 'url'
  },

  // FSH aliases
  'fsh-alias': {
    pattern: /\$[\w-]+/,
    alias: 'variable'
  },

  // FSH codes in square brackets
  'fsh-code': {
    pattern: /#[\w-]+/,
    alias: 'symbol'
  },

  // Rule keywords for rules
  'fsh-rule': {
    pattern: /^\s*\*\s*/m,
    alias: 'operator'
  },

  // FSH flags and modifiers
  'fsh-flag': {
    pattern: /\b(?:MS|SU|TU|D|N|\?!|\?)\b/,
    alias: 'important'
  },

  // Punctuation
  'punctuation': /[{}[\]();,.]/,

  // Operators
  'operator': /[=:^|]/,

  // Numbers (including decimals)
  'number': /\b\d+(?:\.\d+)?\b/
};

/**
 * Enhanced CSS styles for FSH syntax highlighting
 */
export const enhancedFSHStyles = {
  'pre[class*="language-"]': {
    background: '#fafafa',
    border: '1px solid #e1e4e8',
    borderRadius: '6px',
    fontSize: '14px',
    lineHeight: '1.45',
    overflow: 'auto',
    padding: '16px',
    margin: '0'
  },
  'code[class*="language-"]': {
    background: 'transparent',
    fontSize: '14px',
    lineHeight: '1.45',
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace'
  },
  '.token.comment': {
    color: '#6a737d',
    fontStyle: 'italic'
  },
  '.token.string': {
    color: '#032f62'
  },
  '.token.fsh-definition': {
    color: '#d73a49',
    fontWeight: 'bold'
  },
  '.token.fsh-metadata': {
    color: '#6f42c1'
  },
  '.token.fsh-constraint': {
    color: '#005cc5',
    fontWeight: 'bold'
  },
  '.token.fsh-datatype': {
    color: '#22863a'
  },
  '.token.fsh-cardinality': {
    color: '#e36209',
    fontWeight: 'bold'
  },
  '.token.fsh-path': {
    color: '#24292e'
  },
  '.token.fsh-reference': {
    color: '#032f62',
    textDecoration: 'underline'
  },
  '.token.fsh-alias': {
    color: '#6f42c1',
    fontWeight: 'bold'
  },
  '.token.fsh-code': {
    color: '#e36209'
  },
  '.token.fsh-rule': {
    color: '#d73a49'
  },
  '.token.fsh-flag': {
    color: '#735c0f',
    fontWeight: 'bold'
  },
  '.token.punctuation': {
    color: '#586069'
  },
  '.token.operator': {
    color: '#d73a49'
  },
  '.token.number': {
    color: '#005cc5'
  }
};

/**
 * Register enhanced FSH language with Prism.js
 */
export const registerEnhancedFSH = () => {
  if (typeof window !== 'undefined' && window.Prism) {
    // Store original language definition as backup
    if (!window.Prism.languages.fshOriginal) {
      window.Prism.languages.fshOriginal = window.Prism.languages.fsh;
    }
    
    // Register enhanced FSH language
    window.Prism.languages.fsh = enhancedFSHSyntax;
    
    console.log('Enhanced FSH syntax highlighting registered');
  }
};

/**
 * Restore original FSH language definition
 */
export const restoreOriginalFSH = () => {
  if (typeof window !== 'undefined' && window.Prism && window.Prism.languages.fshOriginal) {
    window.Prism.languages.fsh = window.Prism.languages.fshOriginal;
    console.log('Original FSH syntax highlighting restored');
  }
};