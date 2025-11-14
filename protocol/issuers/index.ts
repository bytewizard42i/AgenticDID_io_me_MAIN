/**
 * Trusted Issuers Registry
 * 
 * All trusted issuers in the AgenticDID protocol.
 * Organized by category and activation status.
 */

// Active issuers
export { TRUSTED_ISSUER_0_CONFIG } from './trusted-issuer-0.js';

// Inactive issuers (placeholders until implementation)
export { BANK_ISSUER_CONFIG, BANK_ISSUER_DID } from './bank-issuer.js';
export { AMAZON_ISSUER_CONFIG, AMAZON_ISSUER_DID } from './amazon-issuer.js';
export { AIRLINE_ISSUER_CONFIG, AIRLINE_ISSUER_DID } from './airline-issuer.js';
export { ECUADORIAN_VOTING_ISSUER_CONFIG, ECUADORIAN_VOTING_ISSUER_DID } from './ecuadorian-voting-issuer.js';
export { HOSPITAL_ISSUER_CONFIG, HOSPITAL_ISSUER_DID } from './hospital-issuer.js';
export { DOCTORS_OFFICE_ISSUER_CONFIG, DOCTORS_OFFICE_ISSUER_DID } from './doctors-office-issuer.js';
export { IVF_CENTER_ISSUER_CONFIG, IVF_CENTER_ISSUER_DID } from './ivf-center-issuer.js';

/**
 * All issuers registry
 * 
 * Import all issuer configs for easy access.
 */
import { TRUSTED_ISSUER_0_CONFIG } from './trusted-issuer-0.js';
import { BANK_ISSUER_CONFIG } from './bank-issuer.js';
import { AMAZON_ISSUER_CONFIG } from './amazon-issuer.js';
import { AIRLINE_ISSUER_CONFIG } from './airline-issuer.js';
import { ECUADORIAN_VOTING_ISSUER_CONFIG } from './ecuadorian-voting-issuer.js';
import { HOSPITAL_ISSUER_CONFIG } from './hospital-issuer.js';
import { DOCTORS_OFFICE_ISSUER_CONFIG } from './doctors-office-issuer.js';
import { IVF_CENTER_ISSUER_CONFIG } from './ivf-center-issuer.js';

export const ALL_ISSUERS = [
  TRUSTED_ISSUER_0_CONFIG,       // ACTIVE
  BANK_ISSUER_CONFIG,             // INACTIVE
  AMAZON_ISSUER_CONFIG,           // INACTIVE
  AIRLINE_ISSUER_CONFIG,          // INACTIVE
  ECUADORIAN_VOTING_ISSUER_CONFIG,// INACTIVE
  HOSPITAL_ISSUER_CONFIG,         // INACTIVE
  DOCTORS_OFFICE_ISSUER_CONFIG,   // INACTIVE
  IVF_CENTER_ISSUER_CONFIG,       // INACTIVE
] as const;

export const ACTIVE_ISSUERS = ALL_ISSUERS.filter(issuer => issuer.isActive);
export const INACTIVE_ISSUERS = ALL_ISSUERS.filter(issuer => !issuer.isActive);
