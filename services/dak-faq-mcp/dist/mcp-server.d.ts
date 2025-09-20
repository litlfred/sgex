/**
 * MCP (Model Context Protocol) Server Implementation for DAK FAQ
 * Provides standard MCP protocol support alongside existing REST API
 */
/**
 * DAK FAQ MCP Server
 *
 * Implements the Model Context Protocol for WHO SMART Guidelines DAK FAQ functionality.
 * Provides standardized tools for executing FAQ questions and listing available questions.
 */
export declare class DAKFAQMCPServer {
    private server;
    private faqEngine;
    constructor();
    /**
     * Set up MCP protocol message handlers
     */
    private setupMCPHandlers;
    /**
     * Execute a specific FAQ question
     */
    private executeQuestion;
    /**
     * List available FAQ questions with optional filtering
     */
    private listQuestions;
    /**
     * Get JSON schema for a specific question's parameters
     */
    private getQuestionSchema;
    /**
     * Ensure the FAQ engine is initialized
     */
    private ensureInitialized;
    /**
     * Start the MCP server with stdio transport
     */
    start(): Promise<void>;
    /**
     * Stop the MCP server
     */
    stop(): Promise<void>;
}
export default DAKFAQMCPServer;
//# sourceMappingURL=mcp-server.d.ts.map