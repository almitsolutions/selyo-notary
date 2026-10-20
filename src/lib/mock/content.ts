import type { CreditPackage, NotarialAct } from "@/lib/types";

export const documentTypes = [
  "Affidavit",
  "Affidavit of Loss",
  "Special Power of Attorney",
  "Authorization Letter",
  "Deed of Absolute Sale",
  "Lease Agreement",
  "Loan Agreement",
  "Contract",
  "Secretary's Certificate",
  "Other",
];

export const notarialActs: { act: NotarialAct; description: string }[] = [
  { act: "Acknowledgment", description: "You confirm you signed the document voluntarily — deeds, SPAs, contracts." },
  { act: "Jurat", description: "You swear the contents are true — affidavits and sworn statements." },
  { act: "Oath or Affirmation", description: "A spoken oath before the notary, without a document of your own." },
  { act: "Copy Certification", description: "The notary certifies a copy matches the original." },
  { act: "Signature Witnessing", description: "The notary witnesses you sign and records it." },
];

export const notAccepted = ["Notarial wills", "Depositions", "Documents that must be signed in wet ink"];

export const creditPackages: CreditPackage[] = [
  { id: "c10", credits: 10, price: 990 },
  { id: "c50", credits: 50, price: 4250, popular: true },
  { id: "c150", credits: 150, price: 11250 },
  { id: "c500", credits: 500, price: 32500 },
];

export const faqs = [
  {
    q: "Is an electronically notarized document valid in the Philippines?",
    a: "Yes. Under the Supreme Court's Rules on Electronic Notarization (A.M. No. 24-10-14-SC), an electronic notarial act performed by a commissioned Electronic Notary Public through an accredited facility has the same force and effect as a traditional one.",
  },
  {
    q: "Do I need to be in the Philippines?",
    a: "No. You can join your session from anywhere, including abroad. Only the Electronic Notary Public needs to be in the Philippines.",
  },
  {
    q: "What ID do I need?",
    a: "Your PhilSys National ID (we check its QR code against the national registry), or a photo of another valid government ID such as a passport, driver's license, UMID, or PRC ID. Both are followed by a short face scan.",
  },
  {
    q: "How much does it cost?",
    a: "Creating an account and signing are free. Each notary sets their own fee per notarial act, usually ₱400–₱750, plus a one-time identity verification fee of ₱99. You see the full amount before you book.",
  },
  {
    q: "How do I pay?",
    a: "GCash, Maya, or credit/debit card through a secure payment link the notary sends during your session. Some notaries also accept cash for in-person appearances.",
  },
  {
    q: "What documents can't be notarized online?",
    a: "Notarial wills, depositions, and any document the law requires to be signed in wet ink.",
  },
  {
    q: "How long until I get my notarized document?",
    a: "Usually right after your session. Once the notary seals it, you can download the PDF with its notarial certificate and QR code.",
  },
  {
    q: "Can someone check that my document is real?",
    a: "Yes. Every notarized PDF has a QR code and a fingerprint (SHA-256 hash). Anyone can upload it on our Verify page to confirm it hasn't been changed.",
  },
];

export const idTypes = [
  "Passport",
  "Driver's License",
  "UMID",
  "PRC ID",
  "Postal ID",
  "Voter's ID",
  "SSS ID",
];

export const KYC_FEE = 99;
