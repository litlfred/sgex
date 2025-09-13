Feature: Profile Selection and DAK Repository Scanning
  As an authenticated user of SGEX Workbench
  I want to select a profile and find DAK repositories
  So that I can work with WHO SMART Guidelines Digital Adaptation Kits

  Background:
    Given I am logged in to SGEX Workbench
    And I am on the welcome page

  Scenario: User selects WHO profile and finds smart-immunization DAK
    When I say "Now that we're logged in, let's explore how to select a profile and find DAK repositories."
    And I am on the profile selection page
    When I say "We can see different profiles available. Let's look for the WHO profile which contains official DAK repositories."
    And I see the list of available profiles
    When I say "There's the WorldHealthOrganization profile! This is where we'll find official WHO DAK repositories."
    And I click on the "WorldHealthOrganization" profile
    When I say "Perfect! We've selected the WHO profile. Now the system will scan for DAK repositories in this organization."
    And the repository scanning process begins
    When I say "The scanning process is now running. It's checking each repository to see if it contains DAK content by looking for sushi-config.yaml files."
    And I wait for the scanning to show progress
    When I say "We can see the progress as it scans through the repositories. This may take a moment as there are many repositories to check."
    And I wait for scanning to complete
    When I say "Excellent! The scanning is complete. Now we can see all the DAK repositories found in the WHO organization."
    And I see the list of scanned DAK repositories
    When I say "Let's look for the smart-immunization DAK. This is one of the key WHO DAK implementations."
    And I look for "smart-immunization" in the repository list
    When I say "There it is! The smart-immunization DAK. Let's select it to start working with this Digital Adaptation Kit."
    And I click on the "smart-immunization" repository
    When I say "Perfect! We've successfully selected the smart-immunization DAK and we're now ready to explore its components."
    Then I should be on the DAK dashboard for smart-immunization
    And I should see the DAK components available for editing
    When I say "Great work! You've learned how to select a profile, scan for DAK repositories, and choose a specific DAK to work with."