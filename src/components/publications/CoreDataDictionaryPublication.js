import React from 'react';
import PublicationView from './PublicationView';

/**
 * Core Data Dictionary Publication Component
 * 
 * Renders data elements, profiles, and terminology in publication format
 */
const CoreDataDictionaryPublication = () => {
  
  const renderCoreDataDictionary = (dakData, publicationMeta) => {
    return (
      <div className="component-content">
        <div className="component-section">
          <h3>Core Data Dictionary</h3>
          <p>
            This section defines the essential data structures, terminology, and FHIR profiles 
            that standardize clinical data capture and exchange for this Digital Adaptation Kit.
          </p>
          
          {dakData?.profiles && dakData.profiles.length > 0 ? (
            <div className="core-data-content">
              <h4>FHIR Profiles and Structure Definitions</h4>
              <div className="file-list">
                {dakData.profiles.map((profile, index) => (
                  <div key={index} className="file-item">
                    <span className="file-icon">📋</span>
                    <span className="file-name">{profile.name}</span>
                    <span className="file-path">{profile.path}</span>
                  </div>
                ))}
              </div>
              
              <div className="data-elements-info">
                <h4>Core Data Elements</h4>
                <p>
                  The FHIR profiles listed above define the standardized data structures for clinical 
                  information exchange. These profiles ensure consistent data collection and 
                  interoperability across different healthcare systems by defining:
                </p>
                <ul>
                  <li>Patient demographic and clinical data structures</li>
                  <li>Observation and measurement definitions</li>
                  <li>Procedure and intervention coding standards</li>
                  <li>Medication and immunization profiles</li>
                  <li>Diagnostic and care plan representations</li>
                </ul>
              </div>

              <div className="terminology-info">
                <h4>Terminology Services</h4>
                <p>
                  This DAK leverages standardized terminology from:
                </p>
                <ul>
                  <li><strong>OCL (Open Concept Lab)</strong> - Community-driven terminology management</li>
                  <li><strong>SNOMED CT</strong> - International clinical terminology standard</li>
                  <li><strong>ICD-11</strong> - WHO International Classification of Diseases</li>
                  <li><strong>LOINC</strong> - Laboratory and clinical observation codes</li>
                  <li><strong>WHO Smart Guidelines Value Sets</strong> - Specialized clinical terminologies</li>
                </ul>
              </div>

              <div className="product-data-info">
                <h4>Product Master Data</h4>
                <p>
                  Product information management through PCMT (Product Catalogue Management Tool) 
                  provides standardized product data for:
                </p>
                <ul>
                  <li>Medications and pharmaceutical products</li>
                  <li>Medical devices and diagnostic equipment</li>
                  <li>Vaccines and immunization products</li>
                  <li>Laboratory test kits and supplies</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="no-content">
              <p>No FHIR profiles found in this repository.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <PublicationView
      componentType="core-data-dictionary"
      renderFunction={renderCoreDataDictionary}
      title="Core Data Dictionary"
      printMode={true}
    />
  );
};

export default CoreDataDictionaryPublication;