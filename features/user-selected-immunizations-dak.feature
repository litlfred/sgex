Feature: User Selected Immunizations DAK
  As an authenticated user of SGEX Workbench
  I want to select and work with the smart-immunizations DAK
  So that I can access immunization-specific components and workflows

  @dak-selection @immunizations @who-official
  @previous:profile-selection-dak-scanning
  @next:help-mascot-documentation
  Background:
    Given I am logged in to SGEX Workbench
    And I am in dark mode interface
    And I have scanned the WHO profile repositories
    And I can see the smart-immunizations DAK in the repository list

  @dak-selection @immunizations @who-official
  Scenario: User successfully selects smart-immunizations DAK for work
    When I say "Now that we've found the WHO smart-immunizations DAK, let me show you how to select it and start working with its components."
    And I can see the smart-immunizations repository in the DAK list
    When I say "Here's the smart-immunizations DAK repository. This contains WHO's official Digital Adaptation Kit for immunization workflows."
    And I click on the "smart-immunizations" DAK repository
    When I say "Perfect! We've selected the smart-immunizations DAK. Now we can see the DAK dashboard with all available components."
    And I see the DAK dashboard for smart-immunizations
    When I say "The dashboard shows the 8 core DAK components: Business Processes, Decision Support Logic, Indicators & Measures, Data Entry Forms, Terminology, FHIR Profiles, FHIR Extensions, and Test Data."
    And I can see all 8 DAK component tiles
    When I say "Each component tile shows the current status and allows us to edit or view the component content. This DAK is now ready for editing and collaboration."
    And I verify I can access the DAK components
    Then I should be working with the smart-immunizations DAK
    And all 8 DAK components should be accessible
    And I should see the DAK-specific branding and content
    And the DAK context should be maintained for subsequent operations

  @postcondition
  Scenario: Smart-immunizations DAK selection postcondition verification
    Then the user should be working within the smart-immunizations DAK context
    And the DAK dashboard should show immunization-specific components
    And all subsequent operations should be scoped to the smart-immunizations DAK
    And the selected DAK should be persistent across navigation