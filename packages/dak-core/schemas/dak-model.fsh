Logical: DAK
Title: "Digital Adaptation Kit (DAK)"
Description: "Logical Model for representing a complete Digital Adaptation Kit (DAK) with metadata and all 9 DAK components"

* ^status = #active

// Core DAK metadata fields (aligned with dak.json structure)
* id 1..1 string "DAK ID" "Identifier for the DAK (e.g., smart.who.int.base)"
* name 1..1 string "DAK Name" "Short name for the DAK (e.g., Base)"
* title 1..1 string "DAK Title" "Full title of the DAK (e.g., SMART Base)"
* description[x] 1..1 string or uri "DAK Description" "Description of the DAK - either Markdown content or a URI to a Markdown file (absolute or relative to repository root)"
* version 1..1 string "DAK Version" "Version of the DAK"
* status 1..1 code "DAK Status" "Publication status of the DAK"
* publicationUrl 1..1 url "Publication URL" "Canonical URL for the DAK (e.g., http://smart.who.int/base)"
* license 1..1 code "License" "License under which the DAK is published"
* copyrightYear 1..1 string "Copyright Year" "Year or year range for copyright"

// Publisher information
* publisher 1..1 BackboneElement "Publisher" "Organization responsible for publishing the DAK"
  * name 1..1 string "Publisher Name" "Name of the publishing organization"
  * url 0..1 url "Publisher URL" "URL of the publishing organization"





// 9 DAK Components with cardinality 0..* - using Source types
* healthInterventions 0..* HealthInterventionsSource "Health Interventions and Recommendations" "Overview of the health interventions and WHO, regional or national recommendations included within the DAK"
* personas 0..* GenericPersonaSource "Generic Personas" "Depiction of the human and system actors"
* userScenarios 0..* UserScenarioSource "User Scenarios" "Narratives that describe how the different personas may interact with each other"
* businessProcesses 0..* BusinessProcessWorkflowSource "Generic Business Processes and Workflows" "Business processes and workflows for achieving health programme objectives"
* dataElements 0..* CoreDataElementSource "Core Data Elements" "Data elements required throughout the different points of a workflow"
* decisionLogic 0..* DecisionSupportLogicSource "Decision-Support Logic" "Decision-support logic and algorithms to support appropriate service delivery"
* indicators 0..* ProgramIndicatorSource "Program Indicators" "Core set of indicators for decision-making, performance metrics and reporting"
* requirements 0..* RequirementsSource "Functional and Non-Functional Requirements" "High-level list of core functions and capabilities that the system must have"
* testScenarios 0..* TestScenarioSource "Test Scenarios" "Set of test scenarios to validate an implementation of the DAK"