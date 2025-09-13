Feature: Help Mascot and Documentation Browsing
  As a user of SGEX Workbench
  I want to access help and documentation
  So that I can understand the technical descriptions of core DAK components

  Background:
    Given I am logged in to SGEX Workbench
    And I am on any page within the application

  Scenario: User accesses help system and browses DAK component documentation
    When I say "Let me show you how to get help and find documentation in SGEX Workbench using our friendly help mascot."
    And I see the SGEX Workbench interface
    When I say "Look in the bottom-right corner of the screen. You'll see our helpful cat mascot that provides contextual assistance."
    And I locate the help mascot in the bottom-right corner
    When I say "Let's click on the help mascot to see what assistance is available."
    And I click on the help mascot
    When I say "Perfect! The help system has opened with various support options. We can see options for documentation, tutorials, and support."
    And I see the help menu appear
    When I say "Let's look for documentation about DAK components. I'll click on the Documentation option."
    And I click on "Documentation" in the help menu
    When I say "Great! Now we're in the documentation section. Here we can find detailed information about all aspects of SGEX Workbench."
    And I navigate to the documentation page
    When I say "Let's specifically look up the technical descriptions of core DAK components. This will help us understand the 9 key components."
    And I look for DAK components documentation
    When I say "Here we can see the documentation for DAK components. Let's explore the different component types available."
    And I click on "DAK Components" documentation
    When I say "Excellent! Here we can see detailed descriptions of all 9 core DAK components including Business Processes, Decision Support Logic, and Data Elements."
    And I browse through the DAK components list
    When I say "Let's look at the Business Processes component first. This covers BPMN workflows and business process definitions."
    And I click on "Business Processes" component documentation
    When I say "Here we can see detailed technical information about how business processes work in DAK implementations."
    And I read the business processes documentation
    When I say "Now let's check the Decision Support Logic component, which covers DMN decision tables and clinical decision support."
    And I navigate to "Decision Support Logic" documentation
    When I say "This section explains how clinical decision-making is automated using DMN (Decision Model and Notation) standards."
    And I review the decision support documentation
    When I say "Let's also look at the Core Data Elements section to understand terminology and data structures."
    And I click on "Core Data Elements" documentation
    When I say "Perfect! This shows how data is structured and how terminology services integrate with OCL and PCMT systems."
    And I examine the data elements documentation
    When I say "Excellent! You've learned how to use the help mascot to access comprehensive documentation about DAK components and their technical implementations."
    Then I should have a good understanding of DAK component documentation
    And I should know how to access help whenever needed
    When I say "The help system is always available via the mascot in the bottom-right corner, providing instant access to documentation and support."