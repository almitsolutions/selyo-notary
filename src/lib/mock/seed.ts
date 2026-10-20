import type { DocumentItem, Notarization, SessionState } from "@/lib/types";

const DEMO_PRINCIPAL = { id: "u_principal", name: "Juan Dela Cruz" };

function at(dayOffset: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const emptySession: SessionState = {
  identity: false,
  location: false,
  consentRequested: false,
  consent: false,
  actConfirmed: false,
  principalJoined: false,
  notaryJoined: false,
};

export function seedDocuments(): DocumentItem[] {
  return [
    {
      id: "d1",
      title: "Special Power of Attorney — Lot Sale in Tagaytay",
      type: "Special Power of Attorney",
      createdAt: at(-6, 10),
      updatedAt: at(-5, 9),
      pages: 3,
      sizeKb: 214,
      status: "completed",
      ownerId: DEMO_PRINCIPAL.id,
      notarizationId: "z1",
      signers: [
        { id: "s1", name: DEMO_PRINCIPAL.name, email: "juan@example.com", role: "signer", order: 1, status: "signed", signedAt: at(-6, 10, 20), signature: { kind: "typed", value: DEMO_PRINCIPAL.name } },
      ],
    },
    {
      id: "d2",
      title: "Affidavit of Loss — Driver's License",
      type: "Affidavit of Loss",
      createdAt: at(-1, 15),
      updatedAt: at(-1, 15, 30),
      pages: 1,
      sizeKb: 88,
      status: "completed",
      ownerId: DEMO_PRINCIPAL.id,
      notarizationId: "z2",
      signers: [
        { id: "s2", name: DEMO_PRINCIPAL.name, email: "juan@example.com", role: "signer", order: 1, status: "signed", signedAt: at(-1, 15, 30), signature: { kind: "typed", value: DEMO_PRINCIPAL.name } },
      ],
    },
    {
      id: "d3",
      title: "Lease Agreement — Unit 12B, Mandaue",
      type: "Lease Agreement",
      createdAt: at(-2, 9),
      updatedAt: at(-1, 11),
      pages: 5,
      sizeKb: 402,
      status: "in_progress",
      ownerId: DEMO_PRINCIPAL.id,
      signers: [
        { id: "s3", name: DEMO_PRINCIPAL.name, email: "juan@example.com", role: "signer", order: 1, status: "signed", signedAt: at(-1, 11), signature: { kind: "typed", value: DEMO_PRINCIPAL.name } },
        { id: "s4", name: "Lourdes R. Bautista", email: "lourdes@example.com", role: "signer", order: 2, status: "notified" },
        { id: "s5", name: "Ana Cruz", email: "ana@example.com", role: "approver", order: 2, status: "notified" },
      ],
    },
    {
      id: "d4",
      title: "Authorization Letter — PSA Request",
      type: "Authorization Letter",
      createdAt: at(0, 8),
      updatedAt: at(0, 8),
      pages: 1,
      sizeKb: 46,
      status: "draft",
      ownerId: DEMO_PRINCIPAL.id,
      signers: [
        { id: "s6", name: DEMO_PRINCIPAL.name, email: "juan@example.com", role: "signer", order: 1, status: "waiting" },
      ],
    },
  ];
}

export function seedNotarizations(): Notarization[] {
  return [
    {
      id: "z1",
      documentId: "d1",
      documentTitle: "Special Power of Attorney — Lot Sale in Tagaytay",
      principalId: DEMO_PRINCIPAL.id,
      principalName: DEMO_PRINCIPAL.name,
      notaryId: "n1",
      act: "Acknowledgment",
      mode: "remote",
      scheduledAt: at(-5, 14),
      createdAt: at(-6, 10, 30),
      status: "notarized",
      fee: 600,
      payment: { status: "paid", method: "gcash", paidAt: at(-5, 14, 18), reference: "GC-88412093" },
      witnesses: [],
      messages: [
        { id: "m1", from: "system", name: "System", text: "Appointment requested.", at: at(-6, 10, 30) },
        { id: "m2", from: "notary", name: "Atty. Maria Isabel Santos", text: "Confirmed. Please have your ID ready.", at: at(-6, 11) },
      ],
      activity: [
        { id: "a1", at: at(-5, 14), text: "Principal joined the session" },
        { id: "a2", at: at(-5, 14, 12), text: "Notarial act performed: Acknowledgment" },
        { id: "a3", at: at(-5, 14, 18), text: "Payment received via GCash" },
        { id: "a4", at: at(-5, 14, 20), text: "Document sealed and entered in register" },
      ],
      session: { ...emptySession, identity: true, location: true, consentRequested: true, consent: true, actConfirmed: true },
      register: { docNo: 118, pageNo: 24, bookNo: 3, series: new Date().getFullYear() },
      hash: "9f2c4e71b0a8d36e55c1f0b7a2e4d9c86b3f1a0e7d2c5b4a39f8e6d1c0b7a2e4",
      notarizedAt: at(-5, 14, 20),
    },
    {
      id: "z2",
      documentId: "d2",
      documentTitle: "Affidavit of Loss — Driver's License",
      principalId: DEMO_PRINCIPAL.id,
      principalName: DEMO_PRINCIPAL.name,
      notaryId: "n1",
      act: "Jurat",
      mode: "remote",
      scheduledAt: at(0, 16, 30),
      createdAt: at(-1, 15, 40),
      status: "confirmed",
      fee: 500,
      payment: { status: "unpaid" },
      witnesses: [],
      messages: [
        { id: "m3", from: "system", name: "System", text: "Appointment requested.", at: at(-1, 15, 40) },
        { id: "m4", from: "notary", name: "Atty. Maria Isabel Santos", text: "Hi Juan, confirmed for today. Join 5 minutes early so we can check your camera.", at: at(-1, 17) },
      ],
      activity: [{ id: "a5", at: at(-1, 17), text: "Appointment confirmed by notary" }],
      session: { ...emptySession },
    },
    {
      id: "z3",
      documentId: "x1",
      documentTitle: "Deed of Absolute Sale — Toyota Vios 2019",
      principalId: "u_other1",
      principalName: "Maricel P. Gonzales",
      notaryId: "n1",
      act: "Acknowledgment",
      mode: "remote",
      scheduledAt: at(1, 10),
      createdAt: at(0, 7, 45),
      status: "awaiting_review",
      fee: 600,
      payment: { status: "unpaid" },
      witnesses: [{ id: "w1", name: "Ramon Gonzales", email: "ramon@example.com" }],
      notes: "Buyer will join from Dubai.",
      messages: [{ id: "m5", from: "system", name: "System", text: "Appointment requested.", at: at(0, 7, 45) }],
      activity: [],
      session: { ...emptySession },
    },
    {
      id: "z4",
      documentId: "x2",
      documentTitle: "Secretary's Certificate — Board Resolution 2026-07",
      principalId: "u_other2",
      principalName: "Edgardo L. Mercado",
      notaryId: "n1",
      act: "Jurat",
      mode: "in_person",
      scheduledAt: at(2, 13, 30),
      createdAt: at(0, 9, 10),
      status: "awaiting_review",
      fee: 500,
      payment: { status: "unpaid" },
      witnesses: [],
      messages: [{ id: "m6", from: "system", name: "System", text: "Appointment requested.", at: at(0, 9, 10) }],
      activity: [],
      session: { ...emptySession },
    },
    {
      id: "z5",
      documentId: "x3",
      documentTitle: "Affidavit of Undertaking — Seafarer",
      principalId: "u_other3",
      principalName: "Rodel V. Manalo",
      notaryId: "n1",
      act: "Jurat",
      mode: "remote",
      scheduledAt: at(-2, 11),
      createdAt: at(-3, 18),
      status: "notarized",
      fee: 500,
      payment: { status: "paid", method: "maya", paidAt: at(-2, 11, 15), reference: "MY-55190211" },
      witnesses: [],
      messages: [],
      activity: [{ id: "a6", at: at(-2, 11, 16), text: "Document sealed and entered in register" }],
      session: { ...emptySession, identity: true, location: true, consentRequested: true, consent: true, actConfirmed: true },
      register: { docNo: 119, pageNo: 24, bookNo: 3, series: new Date().getFullYear() },
      hash: "1b7e90c3d5a2f48e6c0b9d17a3e5f2c8d4b6a19e0f3c7d2b5a8e1f4c6d9b0a37",
      notarizedAt: at(-2, 11, 16),
    },
  ];
}

export { DEMO_PRINCIPAL, emptySession };
