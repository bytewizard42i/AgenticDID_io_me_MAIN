/**
 * Type Definitions for Midnight Gateway
 * 
 * Core types for AgenticDID protocol including issuer categories,
 * verification levels, and fraud detection.
 * 
 * These types align with the on-chain AgenticDIDRegistry contract
 * and enforce protocol-level constraints.
 */

/**
 * Issuer Category
 * 
 * Defines the type of credential issuer.
 * Each category has different onboarding requirements and allowed credential types.
 * 
 * Categories:
 * - SELF_SOVEREIGN: Individual or personal DID
 *   - Allowed: preference credentials, low-risk attestations
 *   - Not allowed: KYC, government identity, major brand identities
 * 
 * - CORPORATION: Verified business or brand (Amazon, Coinbase, Bank of America)
 *   - Allowed: brand-linked credentials, financial credentials
 *   - Requires: strong KYC, corporate verification, possibly stake/bond
 * 
 * - GOVERNMENT_ENTITY: Official government issuer (DMV, passport office, voting center)
 *   - Allowed: legal identity, voting eligibility, residency proofs
 *   - Highest trust tier, tightest scope and governance
 * 
 * - INSTITUTION: Universities, hospitals, clinics, research institutes
 *   - Allowed: medical credentials, educational credentials, specialized trust
 *   - Requires: institutional verification and licensing
 */
export enum IssuerCategory {
  SELF_SOVEREIGN = 'SELF_SOVEREIGN',
  CORPORATION = 'CORPORATION',
  GOVERNMENT_ENTITY = 'GOVERNMENT_ENTITY',
  INSTITUTION = 'INSTITUTION',
}

/**
 * Verification Level
 * 
 * Indicates the strength of issuer verification/onboarding.
 * Higher levels required for sensitive credential types.
 * 
 * Levels:
 * - UNVERIFIED: No formal verification (self-registered)
 * - BASIC_KYC: Basic identity verification completed
 * - REGULATED_ENTITY: Fully regulated entity (banking, finance, healthcare)
 * - SYSTEM_CRITICAL: Government or critical infrastructure (highest trust)
 */
export enum VerificationLevel {
  UNVERIFIED = 'UNVERIFIED',
  BASIC_KYC = 'BASIC_KYC',
  REGULATED_ENTITY = 'REGULATED_ENTITY',
  SYSTEM_CRITICAL = 'SYSTEM_CRITICAL',
}

/**
 * Credential Type
 * 
 * Types of credentials that can be issued.
 * Each type has allowed issuer categories defined in protocol.
 */
export enum CredentialType {
  // Identity & KYC
  AGE_OVER_18 = 'AGE_OVER_18',
  AGE_OVER_21 = 'AGE_OVER_21',
  KYC_LEVEL_1 = 'KYC_LEVEL_1',
  KYC_LEVEL_2 = 'KYC_LEVEL_2',
  IDENTITY_VERIFIED = 'IDENTITY_VERIFIED',
  
  // Government
  VOTER_ELIGIBILITY = 'VOTER_ELIGIBILITY',
  CITIZENSHIP = 'CITIZENSHIP',
  RESIDENCY = 'RESIDENCY',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  
  // Financial
  FINANCIAL_ACCOUNT = 'FINANCIAL_ACCOUNT',
  CRYPTO_EXCHANGE_KYC = 'CRYPTO_EXCHANGE_KYC',
  ACCREDITED_INVESTOR = 'ACCREDITED_INVESTOR',
  
  // Healthcare
  MEDICAL_RECORD = 'MEDICAL_RECORD',
  PRESCRIPTION = 'PRESCRIPTION',
  MEDICAL_LICENSE = 'MEDICAL_LICENSE',
  PATIENT_CONSENT = 'PATIENT_CONSENT',
  
  // Education & Professional
  DEGREE = 'DEGREE',
  PROFESSIONAL_LICENSE = 'PROFESSIONAL_LICENSE',
  CERTIFICATION = 'CERTIFICATION',
  
  // Personal & Social
  USER_PREFERENCE = 'USER_PREFERENCE',
  SOCIAL_ATTESTATION = 'SOCIAL_ATTESTATION',
  REPUTATION = 'REPUTATION',
  
  // Travel
  TRAVEL_AUTHORIZATION = 'TRAVEL_AUTHORIZATION',
  VISA = 'VISA',
  
  // Commerce
  MERCHANT_VERIFICATION = 'MERCHANT_VERIFICATION',
  PURCHASE_AUTHORIZATION = 'PURCHASE_AUTHORIZATION',
}

/**
 * Risk Score
 * 
 * Indicates the risk level of a credential or issuer.
 * Used for fraud detection and user warnings.
 */
export enum RiskScore {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Risk Assessment Result
 * 
 * Output of fraud detection analysis.
 */
export interface RiskAssessment {
  riskScore: RiskScore;
  reason?: string;
  flags?: string[];
  recommendation?: 'ALLOW' | 'WARN' | 'BLOCK';
}

/**
 * Issuer Record
 * 
 * Complete metadata about a registered credential issuer.
 * This structure mirrors the on-chain AgenticDIDRegistry.
 */
export interface IssuerRecord {
  // Identity
  issuerDid: string;
  category: IssuerCategory;
  verificationLevel: VerificationLevel;
  
  // Legal Information
  legalName: string;
  claimedBrandName?: string;  // "Amazon", "Bank of America", etc.
  jurisdiction?: string;        // "US-DE", "EU", etc.
  
  // Metadata
  metadataHash?: string;        // Hash of off-chain details (licenses, docs)
  registeredBy: string;         // DID of entity that onboarded this issuer
  stakeAmount?: bigint;         // Optional stake/bond amount
  
  // Status
  isRevoked: boolean;
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt?: Date;
  revokedAt?: Date;
}

/**
 * Credential Type Policy
 * 
 * Defines which issuer categories can issue a specific credential type
 * and what minimum verification level is required.
 */
export interface CredentialTypePolicy {
  credentialType: CredentialType;
  allowedIssuerCategories: IssuerCategory[];
  minVerificationLevel: VerificationLevel;
  requiresStake?: boolean;
  description: string;
}

/**
 * Task Agent Policy
 * 
 * Defines what credentials a task agent requires to authorize actions.
 */
export interface TaskAgentPolicy {
  agentId: string;
  agentName: string;
  requiredCredentials: {
    credentialType: CredentialType;
    allowedIssuerCategories: IssuerCategory[];
    minVerificationLevel: VerificationLevel;
  }[];
}

/**
 * Verification Request
 * 
 * Request to verify a credential presentation.
 */
export interface VerificationRequest {
  credentialType: CredentialType;
  issuerDid: string;
  proof: string;  // ZK proof
  challenge?: string;
}

/**
 * Verification Response
 * 
 * Result of credential verification including issuer metadata.
 */
export interface VerificationResponse {
  valid: boolean;
  
  // Issuer Information
  issuerDid?: string;
  issuerCategory?: IssuerCategory;
  verificationLevel?: VerificationLevel;
  
  // Credential Information
  credentialType?: CredentialType;
  
  // Risk Assessment
  riskScore?: RiskScore;
  riskFlags?: string[];
  
  // Error (if invalid)
  error?: string;
  errorCode?: string;
}

/**
 * Well-Known Brand
 * 
 * Represents a verified major brand that should only be claimed by
 * CORPORATION issuers with high verification levels.
 * 
 * Used for fraud detection: if a SELF_SOVEREIGN claims to be one of these,
 * it's an instant red flag.
 */
export interface WellKnownBrand {
  brandName: string;
  aliases: string[];  // Alternative names/spellings
  expectedIssuerDid?: string;  // Known legitimate issuer DID
  minCategory: IssuerCategory;
  minVerificationLevel: VerificationLevel;
}

/**
 * Credential Status
 * 
 * Lifecycle status of a credential.
 */
export enum CredentialStatus {
  VALID = 'valid',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  UNKNOWN = 'unknown',
}

/**
 * Proof Metadata
 * 
 * Additional context about a ZK proof.
 */
export interface ProofMetadata {
  proofType: string;
  createdAt: Date;
  expiresAt?: Date;
  nonce?: string;
  chainId?: string;
}

/**
 * Action Validation Request
 * 
 * Request to validate if an agent can perform an action.
 */
export interface ActionValidationRequest {
  agentDid: string;
  agentRole: string;
  agentScopes: string[];
  requiredRole: string;
  requiredScope: string;
  credentialType?: CredentialType;
}

/**
 * Action Validation Response
 * 
 * Result of action validation.
 */
export interface ActionValidationResponse {
  allowed: boolean;
  reason?: string;
  missingCredentials?: CredentialType[];
  insufficientVerification?: boolean;
}

/**
 * Agent Role
 * 
 * Defines the type/purpose of an agent in the system.
 */
export enum AgentRole {
  LOCAL_AGENT = 'LOCAL_AGENT',           // User's personal agent (e.g., Comet)
  ISSUER_AGENT = 'ISSUER_AGENT',         // Issues credentials for a trusted issuer (e.g., agent_0)
  TASK_AGENT = 'TASK_AGENT',             // Performs specific tasks (e.g., Banker, Crypto)
  VERIFIER_AGENT = 'VERIFIER_AGENT',     // Verifies credentials
}

/**
 * Agent Record
 * 
 * Registered agent in the AgenticDID protocol.
 * Indexed for fast lookups.
 */
export interface AgentRecord {
  // Identity
  agentDid: string;
  agentId: string;  // Short ID (e.g., 'agent_0', 'canonical_agent_101')
  
  // Role and relationships
  role: AgentRole;
  parentIssuerDid?: string;  // For ISSUER_AGENTs, which issuer they represent
  
  // Metadata
  description: string;
  capabilities?: string[];   // List of capabilities (e.g., ['kyc', 'credential_issuance'])
  
  // System classification
  isSystemAgent: boolean;    // True if agent_0..agent_100
  
  // Status
  isActive: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Agent Query Filters
 * 
 * Filters for searching registered agents.
 */
export interface AgentQueryFilters {
  role?: AgentRole;
  parentIssuerDid?: string;
  isSystemAgent?: boolean;
  isActive?: boolean;
  capability?: string;
}

/**
 * Issuer Query Filters
 * 
 * Filters for searching trusted issuers.
 */
export interface IssuerQueryFilters {
  category?: IssuerCategory;
  verificationLevel?: VerificationLevel;
  isActive?: boolean;
  isRevoked?: boolean;
  allowsCredentialType?: CredentialType;
}
