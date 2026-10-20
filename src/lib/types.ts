// Domain types. These mirror the tables a real database will need later.

export type Role = "principal" | "notary";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  /** Identity verification (KYC) — principals only */
  kyc: KycStatus;
  /** For role === "notary": which notary profile this account owns */
  notaryId?: string;
}

export interface KycStatus {
  status: "unverified" | "pending" | "verified";
  method?: "philsys" | "gov_id";
  idType?: string;
  verifiedAt?: string;
  expiresAt?: string;
}

export type NotarialAct =
  | "Acknowledgment"
  | "Jurat"
  | "Oath or Affirmation"
  | "Copy Certification"
  | "Signature Witnessing";

export interface NotaryService {
  act: NotarialAct;
  fee: number;
}

export interface Notary {
  id: string;
  name: string;
  city: string;
  province: string;
  languages: string[];
  rollNumber: string;
  rollSignedDate: string;
  commissionNo: string;
  commissionValidUntil: string;
  services: NotaryService[];
  modes: AppearanceMode[];
  minNoticeHours: number;
  rating: number;
  sessions: number;
  bio: string;
  avatarColor: string;
  badges: string[];
}

export type AppearanceMode = "remote" | "in_person";

export type DocumentStatus = "draft" | "pending" | "in_progress" | "completed";

export interface Signer {
  id: string;
  name: string;
  email: string;
  role: "signer" | "approver";
  order: number;
  status: "waiting" | "notified" | "signed";
  signedAt?: string;
  /** data URL (drawn) or plain text (typed) */
  signature?: { kind: "drawn" | "typed"; value: string };
}

export interface DocumentItem {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  pages: number;
  sizeKb: number;
  status: DocumentStatus;
  signers: Signer[];
  ownerId: string;
  /** In-memory only (object URL) until real storage exists */
  hasFile?: boolean;
  notarizationId?: string;
}

export type NotarizationStatus =
  | "awaiting_review"
  | "confirmed"
  | "in_session"
  | "pending_payment"
  | "sealing"
  | "notarized"
  | "declined"
  | "cancelled";

export interface Message {
  id: string;
  from: "principal" | "notary" | "system";
  name: string;
  text: string;
  at: string;
}

export interface ActivityItem {
  id: string;
  at: string;
  text: string;
}

export interface Witness {
  id: string;
  name: string;
  email: string;
}

export interface SessionState {
  identity: boolean;
  location: boolean;
  consentRequested: boolean;
  consent: boolean;
  actConfirmed: boolean;
  principalJoined: boolean;
  notaryJoined: boolean;
}

export interface Notarization {
  id: string;
  documentId: string;
  documentTitle: string;
  principalId: string;
  principalName: string;
  notaryId: string;
  act: NotarialAct;
  mode: AppearanceMode;
  scheduledAt: string;
  createdAt: string;
  status: NotarizationStatus;
  fee: number;
  payment: {
    status: "unpaid" | "requested" | "paid";
    method?: "gcash" | "maya" | "card" | "cash";
    paidAt?: string;
    reference?: string;
  };
  witnesses: Witness[];
  notes?: string;
  messages: Message[];
  activity: ActivityItem[];
  session: SessionState;
  register?: { docNo: number; pageNo: number; bookNo: number; series: number };
  hash?: string;
  /** SHA-256 of every PDF we generated for download — used by /verify */
  fileHashes?: string[];
  notarizedAt?: string;
}

export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  popular?: boolean;
}
