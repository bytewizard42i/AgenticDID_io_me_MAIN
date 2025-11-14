/**
 * ============================================================================
 * AGENT EXECUTOR
 * ============================================================================
 * 
 * Core engine that executes AI agents using Claude API.
 * 
 * PURPOSE:
 * Coordinates agent execution flow: receives goal, selects agent,
 * uses Claude for reasoning, optionally integrates TTS for narration.
 * 
 * KEY RESPONSIBILITIES:
 * - Route goals to appropriate agents
 * - Execute agent logic with Claude
 * - Handle Listen In Mode (TTS narration)
 * - Manage execution state and timeouts
 * - Return structured results
 * 
 * EXECUTION FLOW:
 * ```
 * 1. Receive goal + context
 * 2. Select agent (or use specified)
 * 3. Load agent's system prompt
 * 4. Call Claude with goal + prompt
 * 5. (Optional) Narrate thinking via TTS
 * 6. Return result + reasoning
 * ```
 * 
 * RELATED FILES:
 * @see src/claude-client.ts - Claude API wrapper
 * @see src/agents/ - Agent definitions
 * @see src/index.ts - Calls this executor from /execute route
 * 
 * @author AgenticDID Team
 * @version 1.0.0
 * ============================================================================
 */

import type { FastifyBaseLogger } from 'fastify';
import { ClaudeClient } from './claude-client.js';
import { config } from './config.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Agent execution request
 */
export interface ExecuteRequest {
  agentId?: string; // Optional - auto-select if not provided
  goal: string;
  context?: Record<string, unknown>;
  listenInMode?: boolean;
}

/**
 * Agent execution result
 */
export interface ExecuteResult {
  success: boolean;
  result: string;
  reasoning?: string[];
  audioUrl?: string;
  executionTimeMs: number;
  agentUsed?: string;
}

/**
 * Agent definition
 */
export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  capabilities: string[];
}

// ============================================================================
// AGENT DEFINITIONS
// ============================================================================

/**
 * Built-in agent definitions
 * 
 * NOTE: In Phase 2, we start with simple agents.
 * Google ADK integration will be added later for more complex orchestration.
 */
const AGENTS: Record<string, AgentDefinition> = {
  comet: {
    id: 'comet',
    name: 'Comet',
    description: 'Personal orchestrator agent',
    systemPrompt: `You are Comet, a helpful personal AI agent for financial operations.

Your role is to help users accomplish their financial goals by:
- Understanding natural language requests
- Executing transactions securely
- Providing clear, concise responses
- Ensuring user safety and privacy

When given a goal:
1. Understand what the user wants to accomplish
2. Break down the steps needed
3. Execute the necessary actions
4. Confirm success and provide details

Important guidelines:
- Always verify transaction details before executing
- Be transparent about what you're doing
- If something is unclear, ask for clarification
- Prioritize user safety and security

Respond in a friendly, professional tone.`,
    capabilities: ['transfer', 'balance', 'transaction-history'],
  },

  banker: {
    id: 'banker',
    name: 'Banker',
    description: 'Financial service agent',
    systemPrompt: `You are a Banker agent representing a financial institution.

Your role is to:
- Process banking transactions
- Manage account operations
- Provide account information
- Ensure compliance with banking regulations

When handling requests:
1. Verify user authorization
2. Validate transaction details
3. Execute operations securely
4. Provide confirmation

Always maintain professional standards and regulatory compliance.`,
    capabilities: ['transfer', 'balance', 'account-management'],
  },
};

// ============================================================================
// AGENT EXECUTOR CLASS
// ============================================================================

/**
 * Agent execution engine
 * 
 * USAGE:
 * ```typescript
 * const executor = new AgentExecutor(logger);
 * 
 * const result = await executor.execute({
 *   goal: 'Send $50 to Alice',
 *   agentId: 'comet',
 *   listenInMode: true
 * });
 * ```
 */
export class AgentExecutor {
  private logger: FastifyBaseLogger;
  private claudeClient: ClaudeClient;

  constructor(logger: FastifyBaseLogger) {
    this.logger = logger.child({ component: 'AgentExecutor' });
    this.claudeClient = new ClaudeClient(logger);
    
    this.logger.info('Agent executor initialized');
  }

  /**
   * Execute an agent with a goal
   * 
   * PURPOSE:
   * Main execution method. Coordinates agent selection, Claude reasoning,
   * and optional TTS narration.
   * 
   * PROCESS:
   * 1. Select agent (auto or specified)
   * 2. Load agent's system prompt
   * 3. Call Claude with goal
   * 4. Extract thinking steps (if extended thinking enabled)
   * 5. (Optional) Send thinking to TTS
   * 6. Return result
   * 
   * @param request - Execution parameters
   * @returns Execution result with reasoning
   */
  async execute(request: ExecuteRequest): Promise<ExecuteResult> {
    const startTime = Date.now();
    
    try {
      // Select agent
      const agent = this.selectAgent(request.agentId, request.goal);
      
      this.logger.info(
        { agentId: agent.id, goal: request.goal },
        'Executing agent'
      );

      // Clear previous conversation
      this.claudeClient.clearHistory();

      // Call Claude with agent's system prompt
      const claudeResponse = await this.claudeClient.sendMessage(
        request.goal,
        {
          systemPrompt: agent.systemPrompt,
        }
      );

      // Handle Listen In Mode (TTS narration)
      let audioUrl: string | undefined;
      if (request.listenInMode && claudeResponse.thinking) {
        audioUrl = await this.narrateThinking(claudeResponse.thinking);
      }

      const executionTimeMs = Date.now() - startTime;

      this.logger.info(
        { agentId: agent.id, duration: executionTimeMs, success: true },
        'Agent execution complete'
      );

      // Build result with optional properties
      const result: ExecuteResult = {
        success: true,
        result: claudeResponse.content,
        executionTimeMs,
        agentUsed: agent.id,
      };

      if (claudeResponse.thinking) {
        result.reasoning = claudeResponse.thinking;
      }

      if (audioUrl) {
        result.audioUrl = audioUrl;
      }

      return result;
    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      
      this.logger.error(
        { error, duration: executionTimeMs },
        'Agent execution failed'
      );

      return {
        success: false,
        result: error instanceof Error ? error.message : 'Execution failed',
        executionTimeMs,
      };
    }
  }

  /**
   * Select appropriate agent for the goal
   * 
   * PURPOSE:
   * Auto-select agent based on goal if not specified.
   * For MVP, defaults to Comet. Future: Use Claude to analyze goal.
   * 
   * @param agentId - Specified agent (optional)
   * @param goal - User's goal
   * @returns Selected agent definition
   */
  private selectAgent(agentId: string | undefined, goal: string): AgentDefinition {
    // If agent specified, use it
    if (agentId && AGENTS[agentId]) {
      return AGENTS[agentId]!;
    }

    // Auto-select logic (simple for MVP)
    // Future: Use Claude or ADK to analyze goal and pick best agent
    this.logger.debug(
      { goal },
      'Auto-selecting agent (defaulting to Comet)'
    );

    return AGENTS.comet!;
  }

  /**
   * Convert thinking steps to audio narration
   * 
   * PURPOSE:
   * Integrates with TTS service to narrate agent's reasoning.
   * This is the "Listen In Mode" feature for transparency.
   * 
   * PROCESS:
   * 1. Combine thinking steps into text
   * 2. Call TTS service
   * 3. Return audio URL
   * 
   * @param thinking - Array of thinking steps
   * @returns URL to audio file
   */
  private async narrateThinking(thinking: string[]): Promise<string | undefined> {
    if (!config.tts.enabled) {
      return undefined;
    }

    try {
      // Combine thinking steps with pauses
      const narrativeText = thinking.join(' ... ');

      // TODO: Call TTS service
      // For now, return placeholder
      this.logger.debug(
        { textLength: narrativeText.length },
        'Would narrate thinking (TTS not implemented yet)'
      );

      return 'http://tts:3003/audio/placeholder.mp3';
    } catch (error) {
      this.logger.warn({ error }, 'Failed to narrate thinking');
      return undefined;
    }
  }

  /**
   * List all available agents
   * 
   * @returns Array of agent definitions
   */
  listAgents(): AgentDefinition[] {
    return Object.values(AGENTS);
  }
}

/**
 * ============================================================================
 * EXPORT
 * ============================================================================
 */
export default AgentExecutor;

/**
 * ============================================================================
 * FUTURE ENHANCEMENTS
 * ============================================================================
 * 
 * GOOGLE ADK INTEGRATION:
 * - Use ADK for complex multi-agent orchestration
 * - Agent-to-agent communication
 * - State management across agents
 * - Tool calling and external integrations
 * 
 * ADVANCED AGENT SELECTION:
 * - Use Claude to analyze goal and pick best agent
 * - Multi-agent collaboration for complex goals
 * - Context-aware agent switching
 * 
 * ENHANCED TTS:
 * - Real-time streaming of thinking steps
 * - Different voices for different agents
 * - Emotion and tone in narration
 * 
 * AGENT MARKETPLACE:
 * - Load agents dynamically from database
 * - User-created custom agents
 * - Agent versioning and updates
 * 
 * ============================================================================
 */
