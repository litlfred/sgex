/**
 * DAK Component Endpoints Route
 * Provides structured access to DAK component information for publications and rendering
 */

import express, { Request, Response } from 'express';
import { ErrorResponse } from '../../types.js';

const router = express.Router();

// Mock data structures for demonstration - these would be populated from real DAK repositories in production
interface ValueSet {
  id: string;
  name: string;
  description: string;
  conceptCount: number;
  url?: string;
}

interface DecisionTable {
  id: string;
  name: string;
  description: string;
  file: string;
  inputs?: number;
  outputs?: number;
}

interface BusinessProcess {
  id: string;
  name: string;
  description: string;
  file?: string;
  type?: 'bpmn' | 'workflow';
}

interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
}

interface Questionnaire {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  file?: string;
}

interface HealthIntervention {
  id: string;
  name: string;
  type: string;
  description: string;
  iris_id?: string;
  publication_year?: number;
  url?: string;
}

interface UserScenario {
  id: string;
  name: string;
  type: string;
  description: string;
  personas: string[];
  steps: number;
}

interface FunctionalRequirement {
  id: string;
  name: string;
  category: string;
  priority: string;
  description: string;
  source: string;
}

interface ComponentListResponse<T> {
  success: boolean;
  timestamp: string;
  count: number;
  data: T[];
}

/**
 * GET /mcp/faq/valuesets
 * Get all value sets in the DAK
 */
router.get('/valuesets', (req: Request, res: Response<ComponentListResponse<ValueSet> | ErrorResponse>) => {
  try {
    // Mock data - in production this would scan the DAK repository for value sets
    const mockValueSets: ValueSet[] = [
      {
        id: "anc-b4-de1",
        name: "First antenatal care contact",
        description: "Value set for first antenatal care contact indicators",
        conceptCount: 12,
        url: "http://fhir.org/guides/who/anc-cds/ValueSet/anc-b4-de1"
      },
      {
        id: "medication-codes",
        name: "Medication Codes",
        description: "Standard medication codes used in clinical decision support",
        conceptCount: 45
      }
    ];

    const response: ComponentListResponse<ValueSet> = {
      success: true,
      timestamp: new Date().toISOString(),
      count: mockValueSets.length,
      data: mockValueSets
    };

    res.json(response);
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
      error: {
        message: error.message || 'Failed to get value sets',
        code: 'VALUESETS_ERROR',
        timestamp: new Date().toISOString()
      }
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * GET /mcp/faq/decision-tables
 * Get all decision tables (DMN files)
 */
router.get('/decision-tables', (req: Request, res: Response<ComponentListResponse<DecisionTable> | ErrorResponse>) => {
  try {
    // Mock data - in production this would scan for DMN files
    const mockDecisionTables: DecisionTable[] = [
      {
        id: "anc-contact-schedule",
        name: "ANC Contact Schedule",
        description: "Decision table for determining antenatal care contact scheduling",
        file: "input/cql/ANCContactSchedule.dmn",
        inputs: 3,
        outputs: 2
      },
      {
        id: "medication-dosing",
        name: "Medication Dosing Rules",
        description: "Clinical decision support for medication dosing calculations",
        file: "input/cql/MedicationDosing.dmn",
        inputs: 5,
        outputs: 1
      }
    ];

    const response: ComponentListResponse<DecisionTable> = {
      success: true,
      timestamp: new Date().toISOString(),
      count: mockDecisionTables.length,
      data: mockDecisionTables
    };

    res.json(response);
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
      error: {
        message: error.message || 'Failed to get decision tables',
        code: 'DECISION_TABLES_ERROR',
        timestamp: new Date().toISOString()
      }
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * GET /mcp/faq/business-processes
 * Get all business processes
 */
router.get('/business-processes', (req: Request, res: Response<ComponentListResponse<BusinessProcess> | ErrorResponse>) => {
  try {
    // Mock data - in production this would scan for BPMN files
    const mockBusinessProcesses: BusinessProcess[] = [
      {
        id: "anc-workflow",
        name: "Antenatal Care Workflow",
        description: "Complete workflow for antenatal care delivery",
        file: "input/cql/ANCWorkflow.bpmn",
        type: "bpmn"
      },
      {
        id: "referral-process",
        name: "Patient Referral Process",
        description: "Business process for patient referrals between care levels",
        file: "input/cql/ReferralProcess.bpmn",
        type: "bpmn"
      }
    ];

    const response: ComponentListResponse<BusinessProcess> = {
      success: true,
      timestamp: new Date().toISOString(),
      count: mockBusinessProcesses.length,
      data: mockBusinessProcesses
    };

    res.json(response);
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
      error: {
        message: error.message || 'Failed to get business processes',
        code: 'BUSINESS_PROCESSES_ERROR',
        timestamp: new Date().toISOString()
      }
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * GET /mcp/faq/personas
 * Get all personas/actors
 */
router.get('/personas', (req: Request, res: Response<ComponentListResponse<Persona> | ErrorResponse>) => {
  try {
    // Mock data - in production this would extract persona definitions
    const mockPersonas: Persona[] = [
      {
        id: "health-worker",
        name: "Community Health Worker",
        role: "Primary Care Provider",
        description: "Front-line health worker providing basic antenatal care services"
      },
      {
        id: "midwife",
        name: "Certified Midwife",
        role: "Specialist Care Provider",
        description: "Licensed midwife providing comprehensive antenatal and delivery care"
      },
      {
        id: "patient",
        name: "Pregnant Woman",
        role: "Care Recipient",
        description: "Pregnant woman receiving antenatal care services"
      }
    ];

    const response: ComponentListResponse<Persona> = {
      success: true,
      timestamp: new Date().toISOString(),
      count: mockPersonas.length,
      data: mockPersonas
    };

    res.json(response);
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
      error: {
        message: error.message || 'Failed to get personas',
        code: 'PERSONAS_ERROR',
        timestamp: new Date().toISOString()
      }
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * GET /mcp/faq/questionnaires
 * Get all questionnaires
 */
router.get('/questionnaires', (req: Request, res: Response<ComponentListResponse<Questionnaire> | ErrorResponse>) => {
  try {
    // Mock data - in production this would scan for questionnaire files
    const mockQuestionnaires: Questionnaire[] = [
      {
        id: "anc-registration",
        name: "ANC Registration Form",
        description: "Initial registration questionnaire for antenatal care",
        questionCount: 25,
        file: "input/questionnaires/ANCRegistration.json"
      },
      {
        id: "anc-contact",
        name: "ANC Contact Form",
        description: "Standard questionnaire for routine antenatal care contacts",
        questionCount: 18,
        file: "input/questionnaires/ANCContact.json"
      }
    ];

    const response: ComponentListResponse<Questionnaire> = {
      success: true,
      timestamp: new Date().toISOString(),
      count: mockQuestionnaires.length,
      data: mockQuestionnaires
    };

    res.json(response);
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
      error: {
        message: error.message || 'Failed to get questionnaires',
        code: 'QUESTIONNAIRES_ERROR',
        timestamp: new Date().toISOString()
      }
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * GET /mcp/faq/health-interventions
 * Get all health interventions and recommendations in the DAK
 */
router.get('/health-interventions', (req: Request, res: Response<ComponentListResponse<HealthIntervention> | ErrorResponse>) => {
  try {
    // Mock health interventions data - in production this would scan for IRIS publications and intervention files
    const mockInterventions: HealthIntervention[] = [
      {
        id: 'anc-guidelines',
        name: 'WHO ANC Guidelines',
        type: 'IRIS Publication',
        description: 'WHO recommendations on antenatal care for a positive pregnancy experience',
        iris_id: '9789241549912',
        publication_year: 2016,
        url: 'https://iris.who.int/handle/10665/250796'
      },
      {
        id: 'immunization-guidelines', 
        name: 'Immunization Guidelines',
        type: 'Clinical Guideline',
        description: 'WHO position papers on vaccines and comprehensive vaccine recommendations'
      },
      {
        id: 'maternal-health-interventions',
        name: 'Maternal Health Interventions',
        type: 'Care Package',
        description: 'Essential interventions for maternal and newborn health including skilled birth attendance'
      }
    ];

    const response: ComponentListResponse<HealthIntervention> = {
      success: true,
      timestamp: new Date().toISOString(),
      count: mockInterventions.length,
      data: mockInterventions
    };

    res.json(response);
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
      error: {
        message: error.message || 'Failed to get health interventions',
        code: 'HEALTH_INTERVENTIONS_ERROR',
        timestamp: new Date().toISOString()
      }
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * GET /mcp/faq/user-scenarios
 * Get all user scenarios and use cases in the DAK
 */
router.get('/user-scenarios', (req: Request, res: Response<ComponentListResponse<UserScenario> | ErrorResponse>) => {
  try {
    // Mock user scenarios data - in production this would scan for scenario/narrative files
    const mockScenarios: UserScenario[] = [
      {
        id: 'anc-visit-scenario',
        name: 'Antenatal Care Visit Scenario',
        type: 'Clinical Scenario',
        description: 'A pregnant woman visits a health facility for her routine antenatal care appointment',
        personas: ['Pregnant Woman', 'Midwife', 'Community Health Worker'],
        steps: 7
      },
      {
        id: 'immunization-campaign',
        name: 'Immunization Campaign Scenario', 
        type: 'Public Health Scenario',
        description: 'Implementation of a mass immunization campaign in a rural district',
        personas: ['Program Manager', 'Vaccinator', 'Community Mobilizer', 'Caregiver'],
        steps: 7
      },
      {
        id: 'clinical-decision-support',
        name: 'Clinical Decision Support Scenario',
        type: 'Technology Scenario', 
        description: 'A clinician uses digital tools to make clinical decisions during patient care',
        personas: ['Clinician', 'Patient', 'System Administrator'],
        steps: 7
      }
    ];

    const response: ComponentListResponse<UserScenario> = {
      success: true,
      timestamp: new Date().toISOString(),
      count: mockScenarios.length,
      data: mockScenarios
    };

    res.json(response);
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
      error: {
        message: error.message || 'Failed to get user scenarios',
        code: 'USER_SCENARIOS_ERROR',
        timestamp: new Date().toISOString()
      }
    };
    res.status(500).json(errorResponse);
  }
});

/**
 * GET /mcp/faq/functional-requirements
 * Get all functional and non-functional requirements in the DAK
 */
router.get('/functional-requirements', (req: Request, res: Response<ComponentListResponse<FunctionalRequirement> | ErrorResponse>) => {
  try {
    // Mock requirements data - in production this would scan for requirements/specs files
    const mockRequirements: FunctionalRequirement[] = [
      {
        id: 'req-func-001',
        name: 'Data Management Requirements',
        category: 'Functional',
        priority: 'High',
        description: 'System SHALL capture and store patient demographic information in accordance with local data protection regulations',
        source: 'Clinical Workflow Analysis'
      },
      {
        id: 'req-perf-001', 
        name: 'Performance Requirements',
        category: 'Non-Functional',
        priority: 'High',
        description: 'System SHALL respond to user interactions within 2 seconds for 95% of transactions',
        source: 'User Experience Standards'
      },
      {
        id: 'req-sec-001',
        name: 'Security Requirements', 
        category: 'Non-Functional',
        priority: 'Critical',
        description: 'System SHALL implement role-based access control with audit logging',
        source: 'Security Policy'
      },
      {
        id: 'req-int-001',
        name: 'Integration Requirements',
        category: 'Integration',
        priority: 'High', 
        description: 'System SHALL support FHIR R4 for health information exchange',
        source: 'Interoperability Standards'
      }
    ];

    const response: ComponentListResponse<FunctionalRequirement> = {
      success: true,
      timestamp: new Date().toISOString(),
      count: mockRequirements.length,
      data: mockRequirements
    };

    res.json(response);
  } catch (error: any) {
    const errorResponse: ErrorResponse = {
      error: {
        message: error.message || 'Failed to get functional requirements',
        code: 'FUNCTIONAL_REQUIREMENTS_ERROR',
        timestamp: new Date().toISOString()
      }
    };
    res.status(500).json(errorResponse);
  }
});

export { router as componentsRoute };