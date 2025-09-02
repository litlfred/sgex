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

export { router as componentsRoute };