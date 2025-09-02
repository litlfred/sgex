import React from 'react';
import PublicationView from './PublicationView';

/**
 * Terminology Publication Component
 * 
 * Renders terminology and value sets in publication-ready format:
 * - Code systems and value sets
 * - Concept maps and terminology bindings
 * - Print-optimized layout
 */
const TerminologyPublication = () => {
  
  const renderTerminology = (dakData, publicationMeta) => {
    return (
      <div className="component-content">
        <div className="component-section">
          <h3>Terminology and Value Sets</h3>
          <p>
            This section contains the standardized terminology, code systems, and value sets 
            that ensure consistent data representation and interoperability across implementations 
            of this Digital Adaptation Kit.
          </p>
          
          {dakData?.terminology && (dakData.terminology.valueSets?.length > 0 || dakData.terminology.codeSystems?.length > 0) ? (
            <div className="terminology-content">
              
              {/* Value Sets Section */}
              {dakData.terminology.valueSets && dakData.terminology.valueSets.length > 0 && (
                <div className="value-sets-section">
                  <h4>Value Sets</h4>
                  <p>
                    Predefined sets of codes that specify the valid values for specific data elements 
                    within the clinical workflows and decision support logic.
                  </p>
                  
                  {dakData.terminology.valueSets.map((valueSet, index) => (
                    <div key={index} className="value-set-definition">
                      <h5>{valueSet.name}</h5>
                      <div className="value-set-details">
                        <div className="value-set-description">
                          <strong>Description:</strong> {valueSet.description}
                        </div>
                        {valueSet.url && (
                          <div className="value-set-url">
                            <strong>Canonical URL:</strong> <code>{valueSet.url}</code>
                          </div>
                        )}
                        {valueSet.conceptCount && (
                          <div className="value-set-count">
                            <strong>Number of Concepts:</strong> {valueSet.conceptCount}
                          </div>
                        )}
                        {valueSet.status && (
                          <div className="value-set-status">
                            <strong>Status:</strong> {valueSet.status}
                          </div>
                        )}
                        {valueSet.purpose && (
                          <div className="value-set-purpose">
                            <strong>Purpose:</strong> {valueSet.purpose}
                          </div>
                        )}
                          {(valueSet.concepts && valueSet.concepts.length > 0) && (
                            <div className="value-set-concepts">
                              <strong>Sample Concepts:</strong>
                              <div className="concepts-table">
                                <table>
                                  <thead>
                                    <tr>
                                      <th>Code</th>
                                      <th>Display</th>
                                      <th>System</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {valueSet.concepts.slice(0, 5).map((concept, idx) => (
                                      <tr key={idx}>
                                        <td><code>{concept.code}</code></td>
                                        <td>{concept.display}</td>
                                        <td>{concept.system}</td>
                                      </tr>
                                    ))}
                                    {valueSet.concepts.length > 5 && (
                                      <tr>
                                        <td colSpan="3"><em>... and {valueSet.concepts.length - 5} more concepts</em></td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Code Systems Section */}
              {dakData.terminology.codeSystems && dakData.terminology.codeSystems.length > 0 && (
                <div className="code-systems-section">
                  <h4>Code Systems</h4>
                  <p>
                    Custom code systems defined specifically for this DAK to represent 
                    domain-specific concepts not covered by international standards.
                  </p>
                  
                  {dakData.terminology.codeSystems.map((codeSystem, index) => (
                    <div key={index} className="code-system-definition">
                      <h5>{codeSystem.name}</h5>
                      <div className="code-system-details">
                        <div className="code-system-description">
                          <strong>Description:</strong> {codeSystem.description}
                        </div>
                        {codeSystem.url && (
                          <div className="code-system-url">
                            <strong>Canonical URL:</strong> <code>{codeSystem.url}</code>
                          </div>
                        )}
                        {codeSystem.caseSensitive !== undefined && (
                          <div className="code-system-case">
                            <strong>Case Sensitive:</strong> {codeSystem.caseSensitive ? 'Yes' : 'No'}
                          </div>
                        )}
                        {codeSystem.conceptCount && (
                          <div className="code-system-count">
                            <strong>Number of Concepts:</strong> {codeSystem.conceptCount}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Concept Maps Section */}
              {dakData.terminology.conceptMaps && dakData.terminology.conceptMaps.length > 0 && (
                <div className="concept-maps-section">
                  <h4>Concept Maps</h4>
                  <p>
                    Mappings between different code systems to enable data transformation 
                    and interoperability between systems using different terminologies.
                  </p>
                  
                  {dakData.terminology.conceptMaps.map((conceptMap, index) => (
                    <div key={index} className="concept-map-definition">
                      <h5>{conceptMap.name}</h5>
                      <div className="concept-map-details">
                        <div className="concept-map-description">
                          <strong>Description:</strong> {conceptMap.description}
                        </div>
                        {conceptMap.sourceSystem && conceptMap.targetSystem && (
                          <div className="concept-map-systems">
                            <strong>Mapping:</strong> {conceptMap.sourceSystem} → {conceptMap.targetSystem}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="terminology-standards">
                <h4>Terminology Standards Compliance</h4>
                <div className="standards-overview">
                  <table>
                    <thead>
                      <tr>
                        <th>Standard</th>
                        <th>Usage</th>
                        <th>Implementation Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>SNOMED CT</td>
                        <td>Clinical findings, procedures, body structures</td>
                        <td>Primary</td>
                      </tr>
                      <tr>
                        <td>ICD-11</td>
                        <td>Diagnosis and health conditions</td>
                        <td>Primary</td>
                      </tr>
                      <tr>
                        <td>LOINC</td>
                        <td>Laboratory tests and observations</td>
                        <td>Primary</td>
                      </tr>
                      <tr>
                        <td>RxNorm</td>
                        <td>Medications and drug products</td>
                        <td>Recommended</td>
                      </tr>
                      <tr>
                        <td>UCUM</td>
                        <td>Units of measure</td>
                        <td>Required</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="implementation-guidance">
                <h4>Implementation Guidance</h4>
                <ul>
                  <li>Value sets should be reviewed and localized for specific implementation contexts</li>
                  <li>Regular updates ensure alignment with evolving international standards</li>
                  <li>Local extensions should follow FHIR terminology service patterns</li>
                  <li>Concept maps enable integration with existing health information systems</li>
                  <li>Terminology services should support versioning and change management</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="no-content">
              <p>No terminology definitions found in this repository.</p>
              <div className="sample-terminology">
                <h4>Standard Terminology Components for DAK Implementation</h4>
                <ul>
                  <li><strong>Clinical Value Sets:</strong> Standardized codes for clinical conditions and findings</li>
                  <li><strong>Procedure Value Sets:</strong> Healthcare procedures and interventions</li>
                  <li><strong>Medication Value Sets:</strong> Drug products and pharmaceutical preparations</li>
                  <li><strong>Administrative Value Sets:</strong> Healthcare administration and workflow codes</li>
                  <li><strong>Custom Code Systems:</strong> Domain-specific concepts unique to the DAK</li>
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
      componentType="terminology"
      renderFunction={renderTerminology}
      title="Terminology and Value Sets"
      printMode={true}
    />
  );
};

export default TerminologyPublication;