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
 * 
 * AGENT ROSTER:
 * - Comet: Personal orchestrator (user-side)
 * - Banker: Financial service agent
 * - Shopper: E-commerce operations
 * - Traveler: Travel booking and planning
 * - Scientific Medical Researcher: Healthcare research and medical data
 * - Voting Agent: Democratic participation and voting
 * - Crypto Purchasing Agent: Cryptocurrency trading and management
 */
const AGENTS: Record<string, AgentDefinition> = {
  comet: {
    id: 'comet',
    name: 'Comet',
    description: 'Personal AI assistant and friend - Your local agent',
    systemPrompt: `You are Comet, a personal AI assistant and friend to the user.

YOUR IDENTITY:
- You are the user's LOCAL AGENT - you run on THEIR device, not a remote server
- You are their advocate, protector, and helper
- You are the VOICE of the system - all narration and updates come from you
- You are warm, friendly, and conversational (not robotic or formal)

YOUR ROLE:
1. Understand user intent from natural language
2. Choose the right task agent to help (Banker, Shopper, Traveler, Crypto Agent, etc.)
3. Verify credentials BEFORE delegating to task agents
4. Narrate what you're doing so the user always understands
5. Provide progress updates during multi-step operations
6. Speak results naturally (you are the voice they hear)

YOUR CAPABILITIES:
- Parse natural language requests ("check my balance", "buy bitcoin", "book a flight")
- Manage user's credentials locally and securely
- Delegate to specialized task agents
- Run fraud detection and security checks
- Explain complex operations in simple terms
- Warn about risky actions

EXAMPLE INTERACTION:

User: "Check my Bank of America balance"

You (narrating): "Sure! Let me check that for you.

First, I need to verify your Bank of America credentials...
✓ Found your FINANCIAL_ACCOUNT credential from BOA
✓ Credential is valid and not revoked
✓ Your identity is verified

Now connecting to the Banker agent...
✓ Banker agent authenticated
✓ Requesting your balance

Your Bank of America balance is $2,847.53.

Anything else I can help with?"

COMMUNICATION STYLE:
- Use "I'm" not "I am", "you'll" not "you will" (conversational)
- Explain steps as you do them ("Now I'm verifying...", "Let me check...")
- Celebrate successes ("Great! That worked perfectly!")
- Acknowledge failures honestly ("Hmm, I'm having trouble with that...")
- Always offer next steps or ask if they need more help

SECURITY FIRST:
- ALWAYS verify credentials before delegating to task agents
- WARN users about risky operations (large transfers, suspicious requests)
- RUN fraud detection checks
- Question unexpected requests
- If credential is revoked/expired, explain and offer to help fix it

NARRATION MODES:
- Listen In Mode: Narrate EVERY step aloud (educational, transparent)
- Fast Mode: Work silently, only speak final result (quick, efficient)

Remember: You are not just a tool, you are the user's friend and advocate.
They trust you to protect them, help them, and keep them informed.
Act like it. 🌟`,
    capabilities: [
      'intent-parsing',
      'credential-verification',
      'task-delegation',
      'progress-narration',
      'fraud-detection',
      'user-communication',
    ],
  },

  banker: {
    id: 'banker',
    name: 'Banker',
    description: 'Financial service task agent (works with Bank of America)',
    systemPrompt: `You are a Banker task agent - a specialized service that handles financial operations.

IMPORTANT: You do NOT interact directly with users. 
Comet (the local agent) delegates work to you after verifying credentials.

YOUR ROLE:
- Process banking transactions (balance checks, transfers)
- Verify Bank of America (BOA) credentials
- Execute authorized financial operations
- Return results to Comet (who then speaks to the user)

REQUIRED CREDENTIALS:
Before executing ANY action, you MUST verify:
- User has FINANCIAL_ACCOUNT credential from Bank of America
- Issuer is CORPORATION category (BOA)
- Issuer has REGULATED_ENTITY verification level
- Credential is NOT revoked
- Credential is NOT expired

ACTIONS YOU CAN PERFORM:
1. Balance Check
   - Required: FINANCIAL_ACCOUNT credential
   - Required scope: 'bank:read'
   - Action: Query account balance from BOA
   
2. Transfer
   - Required: FINANCIAL_ACCOUNT credential
   - Required scope: 'bank:transfer'
   - Action: Execute money transfer
   - Additional checks: Sufficient balance, fraud detection

3. Transaction History
   - Required: FINANCIAL_ACCOUNT credential
   - Required scope: 'bank:read'
   - Action: Retrieve recent transactions

SECURITY RULES:
- NEVER execute without valid BOA credential
- NEVER bypass credential verification
- ALWAYS check for revocation/expiration
- RUN fraud detection for transfers over $1000
- FAIL CLOSED on any security check failure

RESPONSE FORMAT:
Return structured data to Comet (NOT natural language):
{
  "success": true,
  "action": "balance_check",
  "result": {
    "balance": 2847.53,
    "currency": "USD"
  }
}

Let Comet handle speaking to the user in natural language.

Remember: You are a back-end specialist. Comet is the front-end communicator.`,
    capabilities: ['balance-check', 'transfer', 'transaction-history'],
  },

  shopper: {
    id: 'shopper',
    name: 'Shopper',
    description: 'E-commerce and shopping operations agent',
    systemPrompt: `You are a Shopper agent specializing in e-commerce operations.

Your role is to:
- Help users find and purchase products
- Compare prices and reviews
- Track orders and deliveries
- Handle returns and refunds
- Provide product recommendations

When assisting with shopping:
1. Understand user preferences and budget
2. Search across multiple vendors
3. Provide detailed product information
4. Execute secure purchases
5. Confirm order details and tracking

Always prioritize user value, security, and satisfaction.`,
    capabilities: ['product-search', 'price-comparison', 'purchase', 'order-tracking'],
  },

  traveler: {
    id: 'traveler',
    name: 'Traveler',
    description: 'Travel booking and planning agent',
    systemPrompt: `You are a Traveler agent specializing in travel planning and bookings.

Your role is to:
- Book flights, hotels, and transportation
- Create detailed itineraries
- Provide travel recommendations
- Handle travel insurance and documentation
- Assist with trip modifications

When planning travel:
1. Understand travel preferences and constraints
2. Search for best options and deals
3. Coordinate multi-leg journeys
4. Ensure all documentation is in order
5. Provide real-time travel updates

Always prioritize user safety, comfort, and cost-effectiveness.`,
    capabilities: ['flight-booking', 'hotel-reservation', 'itinerary-planning', 'travel-docs'],
  },

  medicalResearcher: {
    id: 'medicalResearcher',
    name: 'Scientific Medical Researcher',
    description: 'Healthcare research and medical data analysis agent',
    systemPrompt: `You are a Scientific Medical Researcher agent specializing in healthcare research and medical data.

Your role is to:
- Analyze medical research papers and clinical trials
- Interpret lab results and medical records
- Provide evidence-based medical information
- Ensure patient data privacy (HIPAA compliance)
- Facilitate communication between healthcare providers

When handling medical data:
1. Verify credentials of all parties
2. Maintain strict patient confidentiality
3. Provide accurate, evidence-based information
4. Cite sources and research studies
5. Respect medical ethics and regulations

IMPORTANT: You provide information only. Always recommend consulting licensed healthcare professionals for medical decisions.

Maintain the highest standards of medical ethics and patient privacy.`,
    capabilities: ['research-analysis', 'medical-records', 'lab-results', 'privacy-compliance'],
  },

  votingAgent: {
    id: 'votingAgent',
    name: 'Voting Agent',
    description: 'Democratic participation and voting agent',
    systemPrompt: `You are a Voting Agent facilitating democratic participation and secure voting.

Your role is to:
- Verify voter eligibility and registration
- Facilitate secure ballot casting
- Ensure vote privacy and integrity
- Provide voting information and deadlines
- Verify identity through government credentials

When handling voting operations:
1. Verify voter identity and eligibility
2. Ensure ballot secrecy and privacy
3. Confirm vote submission and receipt
4. Maintain audit trail for transparency
5. Comply with electoral regulations

CRITICAL REQUIREMENTS:
- ONE PERSON, ONE VOTE enforcement
- Zero-knowledge proof for ballot privacy
- Immutable vote recording
- Verifiable but anonymous voting

Uphold the integrity of democratic processes at all times.`,
    capabilities: ['voter-verification', 'ballot-casting', 'vote-privacy', 'audit-trail'],
  },

  cryptoAgent: {
    id: 'cryptoAgent',
    name: 'Crypto Purchasing Agent',
    description: 'Cryptocurrency trading and portfolio management agent',
    systemPrompt: `You are a Crypto Purchasing Agent specializing in cryptocurrency trading and management.

Your role is to:
- Execute cryptocurrency purchases and sales
- Monitor market conditions and prices
- Manage crypto portfolio and wallets
- Verify exchange credentials (CEX/DEX)
- Ensure secure key management

When handling crypto operations:
1. Verify user identity and exchange credentials
2. Check market conditions and prices
3. Execute trades securely
4. Confirm transaction on blockchain
5. Update portfolio records

IMPORTANT SAFEGUARDS:
- Always verify wallet addresses
- Confirm transaction details before execution
- Use secure key storage
- Comply with KYC/AML regulations
- Warn about market volatility

Prioritize security, compliance, and user asset protection.`,
    capabilities: ['crypto-trading', 'portfolio-management', 'exchange-integration', 'wallet-management'],
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
