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

5. **[ISSUERS_AND_AGENTS_CHART.md](./ISSUERS_AND_AGENTS_CHART.md)** ⭐ NEW
   - Complete registry of all 7 TIs and 8 RAs
   - Issuer→Agent relationships
   - Credential type matrix
   - Stanford multi-domain showcase

6. **[THREE_AXIS_ISSUER_MODEL.md](./THREE_AXIS_ISSUER_MODEL.md)** ⭐ NEW
   - IssuerType + IssuerDomain + AssuranceLevel
   - Why we need three independent axes
   - Real-world examples (Stanford, health insurance, etc.)
   - Policy enforcement examples

7. **[REGISTRY_STATUS.md](./REGISTRY_STATUS.md)**
   - Complete registry status (DEPRECATED - see ISSUERS_AND_AGENTS_CHART.md)
   - Implementation roadmap
   - TD Bank philosophy

8. **[INDEXING_ARCHITECTURE.md](./INDEXING_ARCHITECTURE.md)**
   - Registered Agents (RAs) indexing
   - Trusted Issuers (TIs) indexing
   - Three-tier caching (< 1ms lookups)

10. **[COMET_PERSONALITY.md](./COMET_PERSONALITY.md)**
    - Comet as friend and assistant
    - Narration modes (Listen In vs Fast)
    - Communication style

11. **[FIRST_THREE_ISSUERS.md](./FIRST_THREE_ISSUERS.md)**
    - BOA, Kraken, Visa selection rationale
    - Adaptive DNA pattern
    - Forward-thinking institutions

---

### **Developer Guides**

12. **[CASSIE_GUIDE.md](./CASSIE_GUIDE.md)**
    - Developer guide for contributors
    - Code style and conventions
    - Protocol fidelity principles

13. **[LESSONS_LEARNED.md](./LESSONS_LEARNED.md)**
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
→ **[protocol/issuers/ti-agenticdid-protocol-issuer.ts](../protocol/issuers/ti-agenticdid-protocol-issuer.ts)** (Template)

### **I'm Building a Task Agent**
→ **[ISSUERS_AND_AGENTS_CHART.md](./ISSUERS_AND_AGENTS_CHART.md)**  
→ **[backend/agents/src/executor.ts](../backend/agents/src/executor.ts)** (Examples)
→ **[protocol/agents/registered-agents.ts](../protocol/agents/registered-agents.ts)** (Configs)

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
| **ISSUERS_AND_AGENTS_CHART.md** | ✅ Complete | Registry chart (7 TIs, 8 RAs) |
| **THREE_AXIS_ISSUER_MODEL.md** | ✅ Complete | Three-axis model guide |
| **REGISTRY_STATUS.md** | ⚠️ Deprecated | See ISSUERS_AND_AGENTS_CHART.md |
| **INDEXING_ARCHITECTURE.md** | ✅ Complete | RA/TI indexing |
| **COMET_PERSONALITY.md** | ✅ Complete | Comet character |
| **FIRST_THREE_ISSUERS.md** | ✅ Complete | BOA/Kraken/Visa |
| **CASSIE_GUIDE.md** | ✅ Complete | Developer guide |
| **LESSONS_LEARNED.md** | ✅ Complete | Mesh.js insights |

---

**Questions?** Start with **[PROTOCOL_RULES.md](./PROTOCOL_RULES.md)** - it links to everything else. 💙
