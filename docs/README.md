# AgenticDID Protocol Documentation

**Start here for all protocol documentation**

---

## 🎯 **START HERE: Protocol Rules**

**👉 [PROTOCOL_RULES.md](./PROTOCOL_RULES.md) - THE CANONICAL REFERENCE**

All protocol rules in one organized document:
- Core principles
- Canonical identities
- DID rules
- Issuer rules
- Agent rules
- KYC trust tiers
- Credential rules
- Fraud detection rules
- Verification rules
- Indexing rules
- Implementation rules

**If you're new to AgenticDID, read this first.** ✅

---

## 📚 Documentation Structure

### **Core Architecture** (Read in Order)

1. **[PROTOCOL_RULES.md](./PROTOCOL_RULES.md)** ⭐ **START HERE**
   - All rules organized and cross-referenced
   - Quick reference for developers

2. **[ONE_PERFECT_CHECK.md](./ONE_PERFECT_CHECK.md)**
   - TD Bank philosophy applied
   - Why build one perfectly, then replicate
   - BOA + Banker + Comet as the template

3. **[ISSUER_0_CANONICAL_FLOW.md](./ISSUER_0_CANONICAL_FLOW.md)**
   - Complete end-to-end flow (A → B → C → D)
   - JSON examples
   - Success criteria

4. **[DID_AND_KYC_ARCHITECTURE.md](./DID_AND_KYC_ARCHITECTURE.md)**
   - Self-sovereign DIDs (DIDz)
   - KYC trust tiers (0-4)
   - Progressive access model

---

### **Domain-Specific Guides**

5. **[AGENTS_AND_ISSUERS.md](./AGENTS_AND_ISSUERS.md)**
   - Agent definitions (Comet, Banker, Crypto, etc.)
   - Issuer categories and types
   - Credential verification matrix

6. **[INDEXING_ARCHITECTURE.md](./INDEXING_ARCHITECTURE.md)**
   - Registered Agents (RAs) indexing
   - Trusted Issuers (TIs) indexing
   - Three-tier caching (< 1ms lookups)

7. **[COMET_PERSONALITY.md](./COMET_PERSONALITY.md)**
   - Comet as friend and assistant
   - Narration modes (Listen In vs Fast)
   - Communication style

8. **[FIRST_THREE_ISSUERS.md](./FIRST_THREE_ISSUERS.md)**
   - BOA, Kraken, Visa selection rationale
   - Adaptive DNA pattern
   - Forward-thinking institutions

---

### **Developer Guides**

9. **[CASSIE_GUIDE.md](./CASSIE_GUIDE.md)**
   - Developer guide for contributors
   - Code style and conventions
   - Protocol fidelity principles

10. **[LESSONS_LEARNED.md](./LESSONS_LEARNED.md)**
    - Mesh.js patterns analysis
    - What worked, what to avoid
    - Implementation insights

---

## 🔑 Quick Links by Role

### **I'm a User**
→ **[DID_AND_KYC_ARCHITECTURE.md](./DID_AND_KYC_ARCHITECTURE.md)**  
Learn about DIDs, KYC tiers, and what you can do

### **I'm Building an Issuer**
→ **[PROTOCOL_RULES.md](./PROTOCOL_RULES.md)** (Issuer Rules section)  
→ **[protocol/issuers/trusted-issuer-0.ts](../protocol/issuers/trusted-issuer-0.ts)** (Template)

### **I'm Building a Task Agent**
→ **[AGENTS_AND_ISSUERS.md](./AGENTS_AND_ISSUERS.md)**  
→ **[backend/agents/src/executor.ts](../backend/agents/src/executor.ts)** (Examples)

### **I'm Integrating the Verifier**
→ **[PROTOCOL_RULES.md](./PROTOCOL_RULES.md)** (Verification Rules section)  
→ **[backend/midnight/README.md](../backend/midnight/README.md)** (API docs)

### **I'm Contributing Code**
→ **[CASSIE_GUIDE.md](./CASSIE_GUIDE.md)**  
→ **[PROTOCOL_RULES.md](./PROTOCOL_RULES.md)** (Implementation Rules section)

---

## 🎯 The TD Bank Principle

> **"We don't want to make a million checks perfectly.  
> We want to make ONE check perfectly and copy that process."**

**Applied to AgenticDID:**
1. Build ONE perfect issuer (trusted_issuer_0)
2. Build ONE perfect issuer agent (agent_0)
3. Build ONE perfect local agent (canonical_agent_101 / Comet)
4. Test end-to-end with ONE real user (John's KYC)
5. Then replicate for BOA, Kraken, Visa, etc.

See: **[ONE_PERFECT_CHECK.md](./ONE_PERFECT_CHECK.md)**

---

## 🔐 Canonical Identities (Protocol Law)

These are reserved and NEVER change:

```
trusted_issuer_0     → AgenticDID Foundation (root issuer)
agent_0              → AgenticDID Issuer Agent (handles KYC)
canonical_agent_101  → Comet (user's personal assistant)
agent_0..agent_100   → Reserved for protocol/system agents
```

See: **[PROTOCOL_RULES.md](./PROTOCOL_RULES.md#canonical-identities)**

---

## 📋 Documentation Status

| Document | Status | Purpose |
|----------|--------|---------|
| **PROTOCOL_RULES.md** | ✅ Complete | All rules in one place |
| **ONE_PERFECT_CHECK.md** | ✅ Complete | TD Bank philosophy |
| **ISSUER_0_CANONICAL_FLOW.md** | ✅ Complete | End-to-end flow |
| **DID_AND_KYC_ARCHITECTURE.md** | ✅ Complete | DIDz + KYC tiers |
| **AGENTS_AND_ISSUERS.md** | ✅ Complete | Agents + issuers |
| **INDEXING_ARCHITECTURE.md** | ✅ Complete | RA/TI indexing |
| **COMET_PERSONALITY.md** | ✅ Complete | Comet character |
| **FIRST_THREE_ISSUERS.md** | ✅ Complete | BOA/Kraken/Visa |
| **CASSIE_GUIDE.md** | ✅ Complete | Developer guide |
| **LESSONS_LEARNED.md** | ✅ Complete | Mesh.js insights |

---

**Questions?** Start with **[PROTOCOL_RULES.md](./PROTOCOL_RULES.md)** - it links to everything else. 💙
