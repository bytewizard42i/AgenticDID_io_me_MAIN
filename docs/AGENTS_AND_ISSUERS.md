# AgenticDID Agents and Trusted Issuers

**Last Updated**: November 14, 2025, 12:30pm  
**Status**: Production specification

---

## 🤖 Task Agents (7 Total)

### 1. **Comet** (Personal Orchestrator)
- **ID**: `comet`
- **Role**: User-side personal AI agent
- **Capabilities**: `transfer`, `balance`, `transaction-history`
- **Use Cases**: Personal finance, daily transactions
- **Credential Requirements**: User identity verification

### 2. **Banker** (Financial Service Agent)
- **ID**: `banker`
- **Role**: Financial institution representative
- **Capabilities**: `transfer`, `balance`, `account-management`
- **Use Cases**: Banking operations, account services
- **Credential Requirements**: Banking institution credentials

### 3. **Shopper** (E-commerce Agent)
- **ID**: `shopper`
- **Role**: E-commerce and shopping operations
- **Capabilities**: `product-search`, `price-comparison`, `purchase`, `order-tracking`
- **Use Cases**: Online shopping, product research, order management
- **Credential Requirements**: User identity, payment verification

### 4. **Traveler** (Travel Agent)
- **ID**: `traveler`
- **Role**: Travel booking and planning
- **Capabilities**: `flight-booking`, `hotel-reservation`, `itinerary-planning`, `travel-docs`
- **Use Cases**: Travel arrangements, trip planning, documentation
- **Credential Requirements**: User identity, travel authorization

### 5. **Scientific Medical Researcher** ⭐ NEW
- **ID**: `medicalResearcher`
- **Role**: Healthcare research and medical data analysis
- **Capabilities**: `research-analysis`, `medical-records`, `lab-results`, `privacy-compliance`
- **Use Cases**: 
  - Medical record access and sharing
  - Lab result interpretation
  - Research paper analysis
  - Healthcare provider communication
  - HIPAA-compliant data handling
- **Credential Requirements**: 
  - Healthcare provider credentials (doctors, hospitals)
  - Patient consent verification
  - Medical license verification
  - HIPAA compliance attestation
- **Privacy**: HIGHEST - Full ZK proofs for all medical data

### 6. **Voting Agent** ⭐ NEW
- **ID**: `votingAgent`
- **Role**: Democratic participation and secure voting
- **Capabilities**: `voter-verification`, `ballot-casting`, `vote-privacy`, `audit-trail`
- **Use Cases**:
  - Voter registration verification
  - Secure ballot casting
  - Vote receipt generation
  - Electoral compliance
  - Audit trail maintenance
- **Credential Requirements**:
  - Government-issued voter ID
  - Electoral roll verification
  - Voting center authorization
  - Unique voter proof (prevent double-voting)
- **Privacy**: HIGHEST - Zero-knowledge ballot privacy
- **Security**: ONE PERSON, ONE VOTE enforcement with ZK proofs

### 7. **Crypto Purchasing Agent** ⭐ NEW
- **ID**: `cryptoAgent`
- **Role**: Cryptocurrency trading and portfolio management
- **Capabilities**: `crypto-trading`, `portfolio-management`, `exchange-integration`, `wallet-management`
- **Use Cases**:
  - CEX/DEX trading
  - Portfolio tracking
  - Wallet management
  - Market analysis
  - KYC/AML compliance
- **Credential Requirements**:
  - Exchange verification (CEX credentials)
  - Wallet ownership proof
  - KYC/AML compliance verification
  - Trading authorization
- **Privacy**: HIGH - Trade privacy with exchange compliance

---

## 🔐 Trusted Credential Issuers

### Issuer Categories (First-Class Citizens)

All issuers are **typed** with one of four categories. Each category has different:
- Onboarding/KYC requirements
- Allowed credential types
- Trust levels
- Fraud detection rules

#### Category Types

**1. SELF_SOVEREIGN**
- **Definition**: Individual user, small indie project, personal DID
- **Allowed to issue**:
  - Preference credentials ("I like hats", "notify me by SMS")
  - Low-risk attestations ("I attended this event", social graph)
  - Reputation scores
- **NOT allowed to issue**:
  - KYC, government-level identity
  - Major brand identities
  - Regulated-finance credentials
- **Onboarding**: Self-registration (no formal verification)
- **Verification Level**: `UNVERIFIED` or `BASIC_KYC`

**2. CORPORATION**
- **Definition**: Amazon, Coinbase, Bank of America, verified business
- **Allowed to issue**:
  - Brand-linked credentials ("Official Amazon Shopping Agent")
  - Financial credentials (within regulatory rules)
  - Merchant verification
  - Crypto exchange KYC
- **Onboarding**: Strong KYC, corporate verification, possibly stake/bond
- **Verification Level**: `REGULATED_ENTITY` (typically)
- **Metadata Required**: Jurisdiction, license IDs, legal name

**3. GOVERNMENT_ENTITY**
- **Definition**: DMV, passport office, voting center, national tax authority
- **Allowed to issue**:
  - Legal identity ("Citizen of X", "ID Verified")
  - Voting eligibility
  - Residency proofs
  - Driver's licenses
  - Visas
- **Onboarding**: Highest tier governance, tightest scope
- **Verification Level**: `SYSTEM_CRITICAL`
- **Trust**: Highest, but also tightest scope

**4. INSTITUTION**
- **Definition**: Universities, hospitals, clinics, research institutes
- **Allowed to issue**:
  - Medical credentials (patient records, prescriptions)
  - Educational credentials (degrees, certifications)
  - Professional licenses
- **Onboarding**: Institutional verification, licensing checks
- **Verification Level**: `BASIC_KYC` to `REGULATED_ENTITY`

---

### Verification Levels

Indicates strength of issuer verification/onboarding:

1. **UNVERIFIED**: No formal verification (self-registered)
2. **BASIC_KYC**: Basic identity verification completed
3. **REGULATED_ENTITY**: Fully regulated entity (banking, finance, healthcare)
4. **SYSTEM_CRITICAL**: Government or critical infrastructure (highest trust)

---

### Fraud Detection Rules

**Core Anti-Fraud Primitive:**
> **"Self-sovereign claiming to be Amazon = instant red flag"**

#### Brand Impersonation Detection

**Rule**: If an issuer with category `SELF_SOVEREIGN` claims a well-known brand name (Amazon, Google, Bank of America, Coinbase, etc.), it is **automatically flagged as CRITICAL risk** and **blocked**.

**Well-Known Brands Registry**:
- Amazon, Google, Microsoft, Apple
- Bank of America, JPMorgan, Wells Fargo, Citibank
- Coinbase, Binance, Kraken
- Delta, American Airlines, United Airlines

**Implementation**:
```typescript
if (
  issuerCategory === 'SELF_SOVEREIGN' &&
  isWellKnownBrand(claimedBrandName)
) {
  return { 
    riskScore: 'CRITICAL', 
    reason: 'BRAND_IMPERSONATION',
    recommendation: 'BLOCK'
  };
}
```

#### Category-Credential Matching

**Rule**: Each credential type has allowed issuer categories. Mismatches are blocked.

**Examples**:
- `VOTER_ELIGIBILITY` → ONLY `GOVERNMENT_ENTITY` allowed
- `MEDICAL_RECORD` → ONLY `INSTITUTION` allowed
- `CRYPTO_EXCHANGE_KYC` → ONLY `CORPORATION` with `REGULATED_ENTITY` level
- `USER_PREFERENCE` → Any category allowed

---

### Managed via Smart Contracts
All trusted issuers are registered in `protocol/contracts/AgenticDIDRegistry.compact`

### Issuer Registry Structure

```typescript
type IssuerRecord = {
  issuerDid: Did
  category: IssuerCategory  // SELF_SOVEREIGN | CORPORATION | GOVERNMENT_ENTITY | INSTITUTION
  verificationLevel: VerificationLevel
  legalName: String
  claimedBrandName: Option<String>  // "Amazon", "Bank of America", etc.
  jurisdiction: Option<String>       // "US-DE", "EU", etc.
  metadataHash: Option<Hash>         // Off-chain docs, licenses
  registeredBy: Did
  stakeAmount: Option<BigNum>
  isRevoked: Bool
  createdAt: Timestamp
}
```

---

### 1. **Government Agencies** (Identity & Voting)
**Category**: `GOVERNMENT_ENTITY`  
**Verification Level**: `SYSTEM_CRITICAL`

#### A. **Voter Registration Centers** ⭐ NEW
- **Role**: Electoral authority
- **Issues**: 
  - Voter registration credentials
  - Voter eligibility proofs
  - Voting authorization
- **Verification**: 
  - Government-issued ID cross-check
  - Electoral roll verification
  - Citizenship proof
- **Use Case**: Voting Agent verification
- **Smart Contract**: `AgenticDIDRegistry` + `CredentialVerifier`

#### B. **DMV / Identity Bureaus**
- **Role**: Government identity authority
- **Issues**:
  - Driver's licenses
  - State IDs
  - Identity credentials
- **Verification**: Government databases
- **Use Case**: General identity verification

#### C. **Passport Offices**
- **Role**: Federal identity authority
- **Issues**:
  - Passport credentials
  - International travel authorization
- **Verification**: Federal databases
- **Use Case**: Traveler Agent verification

---

### 2. **Healthcare Providers** ⭐ NEW
**Category**: `INSTITUTION`  
**Verification Level**: `BASIC_KYC` to `REGULATED_ENTITY`

#### A. **Doctors' Offices**
- **Role**: Primary care provider
- **Issues**:
  - Medical practitioner credentials
  - Patient consent forms
  - Treatment authorization
  - Prescription records
- **Verification**:
  - Medical license verification
  - NPI (National Provider Identifier) check
  - HIPAA compliance attestation
- **Use Case**: Scientific Medical Researcher access
- **Privacy**: Full ZK proofs for patient data

#### B. **Hospitals**
- **Role**: Healthcare institution
- **Issues**:
  - Patient medical records
  - Lab results
  - Diagnostic reports
  - Treatment history
  - Hospital admission credentials
- **Verification**:
  - Hospital accreditation
  - Healthcare provider licensing
  - HIPAA compliance
  - DEA registration (for controlled substances)
- **Use Case**: Medical Researcher data access
- **Privacy**: HIPAA-compliant ZK proofs

#### C. **Medical Research Institutions**
- **Role**: Research authority
- **Issues**:
  - Research credentials
  - IRB approval
  - Clinical trial authorization
- **Verification**: IRB certification
- **Use Case**: Medical Researcher authentication

---

### 3. **Financial Institutions**
**Category**: `CORPORATION`  
**Verification Level**: `REGULATED_ENTITY`

#### A. **Banks**
- **Role**: Financial service provider
- **Issues**:
  - Account verification
  - Credit history
  - Transaction authorization
- **Verification**: FDIC registration, banking licenses
- **Use Case**: Banker Agent authentication

#### B. **Credit Unions**
- **Role**: Member financial services
- **Issues**: Similar to banks
- **Verification**: NCUA registration

---

### 4. **Cryptocurrency Exchanges** ⭐ NEW
**Category**: `CORPORATION`  
**Verification Level**: `REGULATED_ENTITY`

#### A. **Centralized Exchanges (CEX)**
- **Role**: Crypto trading platform
- **Issues**:
  - KYC verification credentials
  - Trading authorization
  - Account verification
  - Withdrawal approval
  - Tax reporting credentials
- **Verification**:
  - Exchange licensing (FinCEN, SEC, CFTC)
  - KYC/AML compliance
  - Reserve proof attestation
  - Regulatory compliance
- **Use Case**: Crypto Purchasing Agent verification
- **Privacy**: Trade privacy with regulatory compliance

#### B. **Decentralized Exchanges (DEX)**
- **Role**: Decentralized trading
- **Issues**:
  - Wallet ownership proof
  - Smart contract interaction authorization
- **Verification**: Blockchain verification
- **Use Case**: Crypto Agent DEX operations

#### C. **Crypto Custodians**
- **Role**: Crypto asset storage
- **Issues**:
  - Custody credentials
  - Asset verification
- **Verification**: Regulatory licenses
- **Use Case**: Secure wallet management

---

### 5. **Service Providers**
**Category**: `CORPORATION`  
**Verification Level**: `BASIC_KYC`

#### A. **E-commerce Platforms**
- **Role**: Online marketplace
- **Issues**: Merchant/buyer verification
- **Use Case**: Shopper Agent

#### B. **Travel Agencies**
- **Role**: Travel service provider
- **Issues**: Booking authorization
- **Use Case**: Traveler Agent

---

## 🔒 Credential Type Policies

**Maps credential types to allowed issuer categories and minimum verification levels.**

| Credential Type | Allowed Categories | Min Verification Level | Stakes Required |
|----------------|-------------------|----------------------|----------------|
| `VOTER_ELIGIBILITY` | `GOVERNMENT_ENTITY` only | `SYSTEM_CRITICAL` | No |
| `MEDICAL_RECORD` | `INSTITUTION` only | `BASIC_KYC` | No |
| `CRYPTO_EXCHANGE_KYC` | `CORPORATION` only | `REGULATED_ENTITY` | Yes |
| `FINANCIAL_ACCOUNT` | `CORPORATION` only | `REGULATED_ENTITY` | Yes |
| `CITIZENSHIP` | `GOVERNMENT_ENTITY` only | `SYSTEM_CRITICAL` | No |
| `KYC_LEVEL_2` | `CORPORATION`, `GOVERNMENT_ENTITY` | `REGULATED_ENTITY` | No |
| `USER_PREFERENCE` | Any category | `UNVERIFIED` | No |
| `SOCIAL_ATTESTATION` | `SELF_SOVEREIGN`, `CORPORATION` | `UNVERIFIED` | No |

---

## 🔒 Credential Verification Matrix

| Agent | Required Credentials | Trusted Issuers | Privacy Level |
|-------|---------------------|-----------------|---------------|
| Comet | User identity | Government (DMV/Passport) | MEDIUM |
| Banker | Banking authorization | Banks, Credit Unions | MEDIUM |
| Shopper | User identity, Payment | E-commerce, Banks | LOW |
| Traveler | Travel authorization | Travel agencies, Passport offices | MEDIUM |
| Medical Researcher | Healthcare provider license | Doctors, Hospitals, Medical boards | **HIGHEST** |
| Voting Agent | Voter registration | Voting centers, Electoral authorities | **HIGHEST** |
| Crypto Agent | Exchange KYC, Wallet proof | CEX, DEX, Crypto custodians | HIGH |

---

## 🛡️ Zero-Knowledge Proof Requirements

### Critical Privacy Use Cases

#### 1. **Medical Data** (Highest Privacy)
- **Requirement**: Patient must never expose medical records
- **Implementation**: Full ZK proofs for all medical data access
- **Issuers**: Doctors' offices, Hospitals
- **Agent**: Medical Researcher
- **Compliance**: HIPAA, GDPR

#### 2. **Voting** (Highest Privacy)
- **Requirement**: Ballot must be secret, but vote must be verifiable
- **Implementation**: ZK proofs for voter eligibility + anonymous ballot
- **Issuers**: Voting centers, Electoral authorities  
- **Agent**: Voting Agent
- **Compliance**: Electoral law, ONE PERSON ONE VOTE

#### 3. **Cryptocurrency Trading** (High Privacy)
- **Requirement**: Trade privacy with exchange compliance
- **Implementation**: ZK proofs for identity + private trade execution
- **Issuers**: CEX, DEX
- **Agent**: Crypto Agent
- **Compliance**: KYC/AML, FinCEN, SEC

---

## 📊 Smart Contract Integration

All issuers registered on-chain via:

```typescript
// protocol/contracts/AgenticDIDRegistry.compact
contract AgenticDIDRegistry {
  // Register trusted issuer
  registerIssuer(issuerDID, issuerType, capabilities);
  
  // Verify issuer status
  verifyIssuer(issuerDID) -> bool;
  
  // Revoke issuer (if compromised)
  revokeIssuer(issuerDID);
}
```

### Issuer Types:
- `GOVERNMENT_AGENCY`
- `HEALTHCARE_PROVIDER`
- `FINANCIAL_INSTITUTION`
- `CRYPTO_EXCHANGE`
- `SERVICE_PROVIDER`

---

## 🚀 Implementation Status

| Component | Status |
|-----------|--------|
| Agent definitions | ✅ Complete (7 agents) |
| Smart contract registry | ✅ Migrated |
| Issuer types defined | ✅ Complete |
| ZK proof verification | ⏳ Phase 3 (building now) |
| Healthcare compliance | ⏳ Phase 3 |
| Voting system | ⏳ Phase 3 |
| Crypto exchange integration | ⏳ Phase 3 |

---

**Next**: Complete Phase 3 Midnight Gateway with issuer verification logic 🚀
