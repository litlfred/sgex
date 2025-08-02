import helpContentService from '../services/helpContentService';

describe('Help Content Service - Blank Bug Report', () => {
  test('should include blank bug report option in SGEX bug reporting', () => {
    const bugReportTopic = helpContentService.universalTopics.bugReport;
    expect(bugReportTopic).toBeDefined();
    expect(bugReportTopic.content).toBeDefined();
    expect(bugReportTopic.content[0]).toBeDefined();
    
    const content = bugReportTopic.content[0].content;
    expect(content).toContain('Blank Issue - Create an issue without a template');
    expect(content).toContain("window.helpModalInstance?.openSgexIssue('blank')");
  });

  test('should include blank bug report option in DAK feedback', () => {
    const dakFeedbackTopic = helpContentService.universalTopics.dakFeedback;
    expect(dakFeedbackTopic).toBeDefined();
    expect(dakFeedbackTopic.content).toBeDefined();
    expect(dakFeedbackTopic.content[0]).toBeDefined();
    
    const content = dakFeedbackTopic.content[0].content;
    expect(content).toContain('Blank DAK Issue - Create an issue without a template');
    expect(content).toContain("window.helpModalInstance?.openDakIssue('blank')");
  });

  test('should have universal topics available for all pages', () => {
    const topics = helpContentService.getUniversalTopics({});
    expect(topics.length).toBeGreaterThan(0);
    
    const bugReportTopic = topics.find(t => t.id === 'report-sgex-bug');
    expect(bugReportTopic).toBeDefined();
  });

  test('should include universal topics in page help topics', () => {
    const pageTopics = helpContentService.getHelpTopicsForPage('test-page', {});
    const bugReportTopic = pageTopics.find(t => t.id === 'report-sgex-bug');
    expect(bugReportTopic).toBeDefined();
  });
});