import React from 'react';
import PublicationView from './PublicationView';

/**
 * Questionnaires Publication Component
 * 
 * Renders data entry forms and questionnaires in publication-ready format:
 * - Structured questionnaires and data collection forms
 * - Form specifications and validation rules
 * - Print-optimized layout
 */
const QuestionnairesPublication = () => {
  
  const renderQuestionnaires = (dakData, publicationMeta) => {
    return (
      <div className="component-content">
        <div className="component-section">
          <h3>Data Entry Forms and Questionnaires</h3>
          <p>
            This section contains structured data collection forms and questionnaires that support 
            the healthcare delivery processes defined in this Digital Adaptation Kit.
          </p>
          
          {dakData?.questionnaires && dakData.questionnaires.length > 0 ? (
            <div className="questionnaires-content">
              <div className="questionnaires-overview">
                <h4>Form Specifications</h4>
                <p>
                  Standardized questionnaires and data entry forms designed for consistent 
                  data collection across different implementation settings.
                </p>
              </div>

              {dakData.questionnaires.map((questionnaire, index) => (
                <div key={index} className="questionnaire-definition">
                  <h5>{questionnaire.name}</h5>
                  <div className="questionnaire-details">
                    <div className="questionnaire-description">
                      <strong>Purpose:</strong> {questionnaire.description || questionnaire.purpose}
                    </div>
                    {questionnaire.context && (
                      <div className="questionnaire-context">
                        <strong>Clinical Context:</strong> {questionnaire.context}
                      </div>
                    )}
                    {questionnaire.file && (
                      <div className="questionnaire-file">
                        <strong>Source File:</strong> <code>{questionnaire.file}</code>
                      </div>
                    )}
                    {questionnaire.questionCount && (
                      <div className="questionnaire-questions">
                        <strong>Number of Questions:</strong> {questionnaire.questionCount}
                      </div>
                    )}
                    {questionnaire.sections && (
                      <div className="questionnaire-sections">
                        <strong>Form Sections:</strong>
                        <ul>
                          {questionnaire.sections.map((section, idx) => (
                            <li key={idx}>{section}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {questionnaire.validationRules && (
                      <div className="questionnaire-validation">
                        <strong>Validation Rules:</strong>
                        <ul>
                          {questionnaire.validationRules.map((rule, idx) => (
                            <li key={idx}>{rule}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="implementation-notes">
                <h4>Implementation Standards</h4>
                <ul>
                  <li>Forms follow FHIR Questionnaire resource specifications</li>
                  <li>Data validation ensures quality and consistency</li>
                  <li>Mobile-responsive design supports field-based data collection</li>
                  <li>Integration with clinical decision support systems</li>
                  <li>Support for multiple languages and cultural adaptations</li>
                </ul>
              </div>

              <div className="data-standards">
                <h4>Data Standards and Interoperability</h4>
                <div className="standards-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Standard</th>
                        <th>Application</th>
                        <th>Compliance Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>FHIR R4 Questionnaire</td>
                        <td>Form structure and metadata</td>
                        <td>Required</td>
                      </tr>
                      <tr>
                        <td>FHIR R4 QuestionnaireResponse</td>
                        <td>Response data format</td>
                        <td>Required</td>
                      </tr>
                      <tr>
                        <td>SNOMED CT</td>
                        <td>Clinical terminology</td>
                        <td>Recommended</td>
                      </tr>
                      <tr>
                        <td>ICD-11</td>
                        <td>Diagnosis coding</td>
                        <td>Recommended</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-content">
              <p>No questionnaire definitions found in this repository.</p>
              <div className="sample-questionnaires">
                <h4>Standard Questionnaire Types for DAK Implementation</h4>
                <ul>
                  <li><strong>Registration Forms:</strong> Patient enrollment and demographic data</li>
                  <li><strong>Assessment Forms:</strong> Clinical assessments and examination findings</li>
                  <li><strong>Follow-up Forms:</strong> Routine monitoring and care continuity</li>
                  <li><strong>Outcome Forms:</strong> Treatment outcomes and quality measures</li>
                  <li><strong>Referral Forms:</strong> Inter-facility communication and care coordination</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <PublicationView
      componentType="questionnaires"
      renderFunction={renderQuestionnaires}
      title="Data Entry Forms and Questionnaires"
      printMode={true}
    />
  );
};

export default QuestionnairesPublication;