Feature: User Selects Language
  As a user of SGEX Workbench
  I want to change the interface language
  So that I can work in my preferred language

  @ui-settings @language @internationalization
  @previous:user-selects-dark-mode
  @next:user-login-pat
  Background:
    Given I am on the SGEX Workbench welcome page
    And I am in dark mode interface
    And the interface is currently in English

  @ui-settings @language @internationalization  
  Scenario: User successfully changes interface language
    When I say "Let me demonstrate how to change the interface language in SGEX Workbench to work in your preferred language."
    And I am on any page within the application
    When I say "Look for the language selector, typically found in the header navigation or settings menu."
    And I locate the language selector dropdown
    When I say "I'll click on the language selector to see the available language options."
    And I click on the language selector
    When I say "Great! Here we can see the available languages. SGEX Workbench supports multiple languages including English, French, Spanish, Arabic, Chinese, and Russian."
    And I see the language options displayed
    When I say "For this demonstration, I'll select French to show how the interface adapts to different languages."
    And I select "Français" from the language dropdown
    When I say "Excellent! The interface has now switched to French. Notice how all the menus, buttons, and text have been translated."
    And I see the interface elements now display in French
    When I say "The language setting is automatically saved and will be remembered for your future sessions."
    And I verify the language setting is applied
    Then the interface should be displayed in the selected language
    And the language preference should be saved for future sessions
    And all interface elements should show translated text

  @postcondition
  Scenario: Language selection postcondition verification
    Then the user interface should be in the selected language
    And the language setting should be persistent across page refreshes
    And all subsequent tutorials should display in the selected language