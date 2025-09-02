import React from 'react';
import PublicationView from './PublicationView';

/**
 * Indicators & Measures Publication Component
 * 
 * Renders indicators and performance measures in publication-ready format:
 * - Digital health indicators and metrics
 * - Performance measures and monitoring
 * - Print-optimized layout
 */
const IndicatorsPublication = () => {
  
  const renderIndicators = (dakData, publicationMeta) => {
    return (
      <div className="component-content">
        <div className="component-section">
          <h3>Indicators and Performance Measures</h3>
          <p>
            This section contains digital health indicators and performance measures that enable 
            monitoring and evaluation of the healthcare interventions defined in this Digital Adaptation Kit.
          </p>
          
          {dakData?.indicators && dakData.indicators.length > 0 ? (
            <div className="indicators-content">
              <div className="indicators-overview">
                <h4>Digital Health Indicators</h4>
                <p>
                  Key performance indicators (KPIs) and metrics for measuring the effectiveness 
                  and impact of the implemented healthcare processes.
                </p>
              </div>

              {dakData.indicators.map((indicator, index) => (
                <div key={index} className="indicator-definition">
                  <h5>{indicator.name}</h5>
                  <div className="indicator-details">
                    <div className="indicator-description">
                      <strong>Description:</strong> {indicator.description}
                    </div>
                    {indicator.calculation && (
                      <div className="indicator-calculation">
                        <strong>Calculation:</strong> {indicator.calculation}
                      </div>
                    )}
                    {indicator.dataElements && (
                      <div className="indicator-data-elements">
                        <strong>Data Elements:</strong>
                        <ul>
                          {indicator.dataElements.map((element, idx) => (
                            <li key={idx}>{element}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {indicator.frequency && (
                      <div className="indicator-frequency">
                        <strong>Reporting Frequency:</strong> {indicator.frequency}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="implementation-notes">
                <h4>Implementation Guidance</h4>
                <ul>
                  <li>Indicators are designed to align with WHO digital health monitoring frameworks</li>
                  <li>Data collection should follow FHIR R4 specifications for interoperability</li>
                  <li>Automated calculation requires implementation of the decision support logic</li>
                  <li>Regular monitoring enables continuous improvement of care delivery</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="no-content">
              <p>No indicator definitions found in this repository.</p>
              <div className="sample-indicators">
                <h4>Sample Indicators for DAK Implementation</h4>
                <ul>
                  <li><strong>Coverage Indicators:</strong> Percentage of target population receiving interventions</li>
                  <li><strong>Quality Indicators:</strong> Adherence to clinical protocols and guidelines</li>
                  <li><strong>Outcome Indicators:</strong> Health outcomes and impact measurements</li>
                  <li><strong>Process Indicators:</strong> Efficiency and effectiveness of care delivery</li>
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
      componentType="indicators"
      renderFunction={renderIndicators}
      title="Indicators and Performance Measures"
      printMode={true}
    />
  );
};

export default IndicatorsPublication;