Feature: User Selects Dark Mode
  As a user of SGEX Workbench
  I want to enable dark mode interface
  So that I can work in a darker environment that's easier on my eyes

  @ui-settings @dark-mode @interface
  @next:user-selects-language
  Background:
    Given I am on the SGEX Workbench welcome page
    And I am in the default light mode interface

  @ui-settings @dark-mode @interface
  Scenario: User successfully enables dark mode
    When I say "Let me show you how to enable dark mode in SGEX Workbench for a more comfortable viewing experience."
    And I am on any page within the application
    When I say "Look for the theme toggle button, usually located in the top navigation bar or settings area."
    And I locate the theme toggle or settings button
    When I say "Now I'll click on the theme toggle to switch from light mode to dark mode."
    And I click on the theme toggle button
    When I say "Perfect! The interface has switched to dark mode. Notice how the background is now dark and text is light colored."
    And I see the dark mode interface activated
    When I say "Dark mode is now enabled and will be remembered for your future sessions. This provides a more comfortable viewing experience, especially in low-light environments."
    And I verify the dark mode setting is applied
    Then dark mode should be enabled throughout the interface
    And the theme preference should be saved for future sessions
    And all interface elements should display in dark theme colors

  @postcondition
  Scenario: Dark mode postcondition verification
    Then the user interface should be in dark mode
    And the dark mode setting should be persistent across page refreshes
    And all subsequent tutorials should display in dark mode