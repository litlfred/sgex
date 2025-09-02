import React from 'react';
import PublicationView from './PublicationView';

/**
 * Actors and Personas Publication Component
 * 
 * Renders actor definitions and persona specifications in publication format
 */
const ActorsPublication = () => {
  
  const renderActors = (dakData, publicationMeta) => {
    return (
      <div className="component-content">
        <div className="component-section">
          <h3>Generic Personas and Actors</h3>
          <p>
            This section defines the standardized user roles and actor definitions that represent 
            different types of healthcare workers, patients, and system users within this Digital Adaptation Kit.
          </p>
          
          {dakData?.actorFiles && dakData.actorFiles.length > 0 ? (
            <div className="actors-content">
              <h4>Actor Definition Files</h4>
              <div className="file-list">
                {dakData.actorFiles.map((actorFile, index) => (
                  <div key={index} className="file-item">
                    <span className="file-icon">👤</span>
                    <span className="file-name">{actorFile.name}</span>
                    <span className="file-path">{actorFile.path}</span>
                  </div>
                ))}
              </div>
              
              <div className="actor-types-info">
                <h4>Actor Categories</h4>
                <p>
                  The actor definitions organize users into categories that reflect real-world 
                  healthcare delivery contexts:
                </p>
                
                <div className="actor-categories">
                  <div className="actor-category">
                    <h5>👩‍⚕️ Healthcare Providers</h5>
                    <ul>
                      <li><strong>Primary Care Physicians</strong> - General practitioners providing comprehensive care</li>
                      <li><strong>Specialist Clinicians</strong> - Medical specialists in focused areas of expertise</li>
                      <li><strong>Nurses</strong> - Registered nurses providing direct patient care</li>
                      <li><strong>Community Health Workers</strong> - Frontline health workers in community settings</li>
                      <li><strong>Midwives</strong> - Specialized care providers for maternal and newborn health</li>
                    </ul>
                  </div>
                  
                  <div className="actor-category">
                    <h5>🏥 Healthcare Support Staff</h5>
                    <ul>
                      <li><strong>Pharmacists</strong> - Medication management and dispensing specialists</li>
                      <li><strong>Laboratory Technicians</strong> - Diagnostic testing and analysis specialists</li>
                      <li><strong>Radiology Technicians</strong> - Medical imaging and diagnostic specialists</li>
                      <li><strong>Medical Assistants</strong> - Clinical support and administrative staff</li>
                      <li><strong>Health Information Officers</strong> - Data management and records specialists</li>
                    </ul>
                  </div>
                  
                  <div className="actor-category">
                    <h5>📊 Administrative and Management</h5>
                    <ul>
                      <li><strong>Health Facility Managers</strong> - Operational management and oversight</li>
                      <li><strong>Health Program Coordinators</strong> - Program implementation and monitoring</li>
                      <li><strong>Quality Assurance Officers</strong> - Quality monitoring and improvement</li>
                      <li><strong>Data Analysts</strong> - Health information analysis and reporting</li>
                      <li><strong>System Administrators</strong> - Technical system management and support</li>
                    </ul>
                  </div>
                  
                  <div className="actor-category">
                    <h5>🏠 Patients and Community</h5>
                    <ul>
                      <li><strong>Adult Patients</strong> - Adults receiving healthcare services</li>
                      <li><strong>Pediatric Patients</strong> - Children and adolescents under care</li>
                      <li><strong>Pregnant Women</strong> - Women receiving maternal health services</li>
                      <li><strong>Caregivers</strong> - Family members and informal care providers</li>
                      <li><strong>Community Leaders</strong> - Local leaders supporting health initiatives</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="actor-attributes">
                <h4>Actor Attributes and Capabilities</h4>
                <p>
                  Each actor definition includes comprehensive specifications for:
                </p>
                
                <div className="attribute-sections">
                  <div className="attribute-section">
                    <h5>Role Definitions</h5>
                    <ul>
                      <li>Primary responsibilities and duties</li>
                      <li>Scope of practice and authority</li>
                      <li>Decision-making capabilities</li>
                      <li>Workflow integration points</li>
                    </ul>
                  </div>
                  
                  <div className="attribute-section">
                    <h5>Access Rights and Permissions</h5>
                    <ul>
                      <li>Data access privileges</li>
                      <li>System function permissions</li>
                      <li>Patient information visibility</li>
                      <li>Administrative capabilities</li>
                    </ul>
                  </div>
                  
                  <div className="attribute-section">
                    <h5>Technical Requirements</h5>
                    <ul>
                      <li>Digital literacy assumptions</li>
                      <li>Device and connectivity needs</li>
                      <li>Training and support requirements</li>
                      <li>User interface preferences</li>
                    </ul>
                  </div>
                  
                  <div className="attribute-section">
                    <h5>Contextual Factors</h5>
                    <ul>
                      <li>Work environment characteristics</li>
                      <li>Time constraints and workflow patterns</li>
                      <li>Communication preferences</li>
                      <li>Collaboration requirements</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="persona-usage">
                <h4>Usage in DAK Implementation</h4>
                <p>
                  These generic personas serve as the foundation for:
                </p>
                <ul>
                  <li><strong>User Experience Design</strong> - Creating role-appropriate interfaces and workflows</li>
                  <li><strong>Security Architecture</strong> - Implementing role-based access controls</li>
                  <li><strong>Training Programs</strong> - Developing targeted user education and support</li>
                  <li><strong>Workflow Optimization</strong> - Designing efficient task flows for each user type</li>
                  <li><strong>System Integration</strong> - Ensuring appropriate data sharing between roles</li>
                  <li><strong>Quality Assurance</strong> - Validating system behavior for different user scenarios</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="no-content">
              <p>No actor definition files found in this repository.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <PublicationView
      componentType="actors"
      renderFunction={renderActors}
      title="Generic Personas and Actors"
      printMode={true}
    />
  );
};

export default ActorsPublication;