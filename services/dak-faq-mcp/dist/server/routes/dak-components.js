/**
 * DAK Components Route
 * Provides access to DAK component information (valuesets, decision tables, etc.)
 */
import express from 'express';
const router = express.Router();
/**
 * GET /mcp/faq/valuesets
 * Returns a list of all value sets in the DAK
 */
router.get('/valuesets', async (req, res) => {
    try {
        // Mock data - in a real implementation, this would scan the DAK repository
        const valueSets = [
            {
                id: 'anc-care-settings',
                name: 'ANC Care Settings',
                description: 'Settings where antenatal care can be provided',
                conceptCount: 5
            },
            {
                id: 'pregnancy-risk-factors',
                name: 'Pregnancy Risk Factors',
                description: 'Risk factors during pregnancy',
                conceptCount: 12
            },
            {
                id: 'immunization-vaccines',
                name: 'Immunization Vaccines',
                description: 'Vaccines used in immunization programs',
                conceptCount: 25
            }
        ];
        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            count: valueSets.length,
            valueSets
        };
        res.json(response);
    }
    catch (error) {
        console.error('ValueSets route error:', error);
        const errorResponse = {
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
 * Returns a list of all decision tables in the DAK
 */
router.get('/decision-tables', async (req, res) => {
    try {
        // Mock data - in a real implementation, this would scan for .dmn files
        const decisionTables = [
            {
                id: 'anc-contact-schedule',
                name: 'ANC Contact Schedule',
                description: 'Decision logic for scheduling antenatal care contacts',
                file: 'input/pagecontent/anc-contact-schedule.dmn'
            },
            {
                id: 'immunization-schedule',
                name: 'Immunization Schedule',
                description: 'Decision logic for immunization scheduling',
                file: 'input/pagecontent/immunization-schedule.dmn'
            },
            {
                id: 'contraceptive-eligibility',
                name: 'Contraceptive Eligibility',
                description: 'Decision logic for contraceptive method eligibility',
                file: 'input/pagecontent/contraceptive-eligibility.dmn'
            }
        ];
        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            count: decisionTables.length,
            decisionTables
        };
        res.json(response);
    }
    catch (error) {
        console.error('Decision tables route error:', error);
        const errorResponse = {
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
 * Returns a list of business processes in the DAK
 */
router.get('/business-processes', async (req, res) => {
    try {
        // Mock data - in a real implementation, this would scan for .bpmn files
        const businessProcesses = [
            {
                id: 'anc-contact-process',
                name: 'ANC Contact Process',
                description: 'End-to-end process for antenatal care contacts'
            },
            {
                id: 'immunization-workflow',
                name: 'Immunization Workflow',
                description: 'Workflow for vaccine administration and tracking'
            },
            {
                id: 'family-planning-counseling',
                name: 'Family Planning Counseling',
                description: 'Process for providing family planning counseling services'
            }
        ];
        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            count: businessProcesses.length,
            businessProcesses
        };
        res.json(response);
    }
    catch (error) {
        console.error('Business processes route error:', error);
        const errorResponse = {
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
 * Returns a list of personas/actors in the DAK
 */
router.get('/personas', async (req, res) => {
    try {
        // Mock data - in a real implementation, this would scan persona definitions
        const personas = [
            {
                id: 'anc-nurse',
                name: 'ANC Nurse',
                role: 'Healthcare Provider',
                description: 'Nurse specializing in antenatal care services'
            },
            {
                id: 'community-health-worker',
                name: 'Community Health Worker',
                role: 'Community Healthcare',
                description: 'Health worker providing services at community level'
            },
            {
                id: 'pregnant-woman',
                name: 'Pregnant Woman',
                role: 'Patient',
                description: 'Woman receiving antenatal care services'
            },
            {
                id: 'health-facility-manager',
                name: 'Health Facility Manager',
                role: 'Administrator',
                description: 'Manager overseeing health facility operations'
            }
        ];
        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            count: personas.length,
            personas
        };
        res.json(response);
    }
    catch (error) {
        console.error('Personas route error:', error);
        const errorResponse = {
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
 * Returns a list of questionnaires in the DAK
 */
router.get('/questionnaires', async (req, res) => {
    try {
        // Mock data - in a real implementation, this would scan questionnaire definitions
        const questionnaires = [
            {
                id: 'anc-registration',
                name: 'ANC Registration',
                description: 'Initial registration questionnaire for antenatal care',
                questionCount: 15
            },
            {
                id: 'anc-contact',
                name: 'ANC Contact',
                description: 'Questionnaire for routine antenatal care contacts',
                questionCount: 25
            },
            {
                id: 'immunization-assessment',
                name: 'Immunization Assessment',
                description: 'Assessment questionnaire for immunization services',
                questionCount: 8
            },
            {
                id: 'family-planning-consultation',
                name: 'Family Planning Consultation',
                description: 'Questionnaire for family planning counseling sessions',
                questionCount: 12
            }
        ];
        const response = {
            success: true,
            timestamp: new Date().toISOString(),
            count: questionnaires.length,
            questionnaires
        };
        res.json(response);
    }
    catch (error) {
        console.error('Questionnaires route error:', error);
        const errorResponse = {
            error: {
                message: error.message || 'Failed to get questionnaires',
                code: 'QUESTIONNAIRES_ERROR',
                timestamp: new Date().toISOString()
            }
        };
        res.status(500).json(errorResponse);
    }
});
export { router as dakComponentsRoute };
//# sourceMappingURL=dak-components.js.map