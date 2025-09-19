Feature: User PAT Login Process
  As a new user of SGEX Workbench
  I want to authenticate using a Personal Access Token
  So that I can access GitHub repositories and DAK content

  @authentication @login @pat
  @previous:user-selects-language
  @next:profile-selection-dak-scanning
  Background:
    Given I am on the SGEX Workbench welcome page
    And I am in dark mode interface
    And I am not currently logged in

  @authentication @login @pat
  Scenario: User successfully logs in with PAT
    When I say "Welcome to SGEX Workbench! Let me show you how to log in using a Personal Access Token."
    And I navigate to the login page
    When I say "First, we need to click on the Sign In button to start the authentication process."
    And I click the "Sign In" button
    When I say "Now we see the PAT login form. Here we need to enter our GitHub Personal Access Token."
    And I see the PAT login form
    When I say "I'll enter a sample Personal Access Token. In real use, you would paste your actual GitHub PAT here."
    And I enter a sample PAT in the token field
    When I say "Let's also give this token a name so we can identify it later. I'll call it 'SGEX Demo Token'."
    And I enter "SGEX Demo Token" in the token name field
    When I say "Now I'll click the Sign In button to authenticate with GitHub using our Personal Access Token."
    And I click the "Sign In with PAT" button
    When I say "Great! We've successfully logged in. You can see we're now on the welcome page with access to GitHub repositories."
    Then I should be redirected to the welcome page
    And I should see my user profile information
    When I say "Congratulations! You've successfully authenticated with SGEX Workbench using a Personal Access Token."
    And I should see the authenticated interface
    Then I should be successfully logged in
    And I should have access to GitHub repositories through the authenticated session

  @postcondition
  Scenario: PAT login postcondition verification
    Then the user should be authenticated with GitHub
    And the PAT token should be stored securely for subsequent API calls
    And all subsequent operations should have authenticated GitHub access
    And the user profile should be loaded and displayed