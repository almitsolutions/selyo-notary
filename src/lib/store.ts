"use client";

// Demo data store. Everything lives in localStorage so the demo survives refreshes
// and stays in sync between tabs (open the client and notary portals side by side).
// When the real backend lands, swap these actions for API calls — the screens only
// depend on the action names and the types in lib/types.ts.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppearanceMode,
  DocumentItem,
  NotarialAct,
  Notarization,
  SessionState,
  Signer,
  User,
  Witness,
} from "@/lib/types";
import { DEMO_PRINCIPAL, emptySession, seedDocuments, seedNotarizations } from "@/lib/mock/seed";
import { findNotary } from "@/lib/mock/notaries";
import { uid } from "@/lib/utils";

const now = () => new Date().toISOString();

function deriveStatus(signers: Signer[]): DocumentItem["status"] {
  if (signers.every((s) => s.status === "signed")) return "completed";
  if (signers.some((s) => s.status === "signed")) return "in_progress";
  if (signers.some((s) => s.status === "notified")) return "pending";
  return "draft";
}

function fakeHash() {
  return Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
}

export interface NewDocumentInput {
  title: string;
  type: string;
  pages: number;
  sizeKb: number;
  hasFile: boolean;
  signers: Pick<Signer, "name" | "email" | "role" | "order">[];
}

export interface NewNotarizationInput {
  documentId: string;
  notaryId: string;
  act: NotarialAct;
  mode: AppearanceMode;
  scheduledAt: string;
  fee: number;
  witnesses: Omit<Witness, "id">[];
  notes?: string;
}

interface AppState {
  principal: User | null;
  notaryUser: User | null;
  documents: DocumentItem[];
  notarizations: Notarization[];
  credits: number;
  nextRegister: { docNo: number; pageNo: number; bookNo: number };

  signInPrincipal: (name?: string, email?: string) => void;
  signInNotary: () => void;
  signOut: (role: "principal" | "notary") => void;
  completeKyc: (method: "philsys" | "gov_id", idType: string) => void;

  addDocument: (input: NewDocumentInput) => string;
  deleteDocument: (id: string) => void;
  signDocument: (docId: string, signerId: string, signature: Signer["signature"]) => void;
  simulateOtherSigners: (docId: string) => void;

  requestNotarization: (input: NewNotarizationInput) => string;
  cancelNotarization: (id: string) => void;
  acceptAppointment: (id: string) => void;
  declineAppointment: (id: string, reason: string) => void;
  sendMessage: (id: string, from: "principal" | "notary", name: string, text: string) => void;
  updateSession: (id: string, patch: Partial<SessionState>, activity?: string) => void;
  startSession: (id: string) => void;
  requestPayment: (id: string) => void;
  payNotarization: (id: string, method: "gcash" | "maya" | "card" | "cash") => void;
  sealNotarization: (id: string) => void;

  recordFileHash: (id: string, hash: string) => void;
  buyCredits: (n: number) => void;
  resetDemo: () => void;
}

const initialData = () => ({
  principal: null,
  notaryUser: null,
  documents: seedDocuments(),
  notarizations: seedNotarizations(),
  credits: 38,
  nextRegister: { docNo: 120, pageNo: 24, bookNo: 3 },
});

export const useApp = create<AppState>()(
  persist(
    (set, get) => {
      const patchNz = (id: string, fn: (n: Notarization) => Notarization) =>
        set((s) => ({ notarizations: s.notarizations.map((n) => (n.id === id ? fn(n) : n)) }));
      const log = (text: string) => ({ id: uid("a"), at: now(), text });
      const sys = (text: string) => ({ id: uid("m"), from: "system" as const, name: "System", text, at: now() });

      return {
        ...initialData(),

        signInPrincipal: (name, email) =>
          set((s) => ({
            principal: {
              id: DEMO_PRINCIPAL.id,
              name: name || s.principal?.name || DEMO_PRINCIPAL.name,
              email: email || s.principal?.email || "juan@example.com",
              role: "principal",
              kyc: s.principal?.kyc ?? { status: "unverified" },
            },
          })),

        signInNotary: () =>
          set({
            notaryUser: {
              id: "u_notary",
              name: findNotary("n1")!.name,
              email: "maria.santos@example.com",
              role: "notary",
              kyc: { status: "verified" },
              notaryId: "n1",
            },
          }),

        signOut: (role) => set(role === "principal" ? { principal: null } : { notaryUser: null }),

        completeKyc: (method, idType) =>
          set((s) => {
            if (!s.principal) return s;
            const expires = new Date();
            expires.setFullYear(expires.getFullYear() + 3);
            return {
              principal: {
                ...s.principal,
                kyc: { status: "verified", method, idType, verifiedAt: now(), expiresAt: expires.toISOString() },
              },
            };
          }),

        addDocument: (input) => {
          const id = uid("d");
          const signers: Signer[] = input.signers.map((sg, i) => ({
            ...sg,
            id: uid("s"),
            status: i === 0 || sg.order === 1 ? "notified" : "waiting",
          }));
          const doc: DocumentItem = {
            id,
            title: input.title,
            type: input.type,
            pages: input.pages,
            sizeKb: input.sizeKb,
            hasFile: input.hasFile,
            createdAt: now(),
            updatedAt: now(),
            ownerId: get().principal?.id ?? DEMO_PRINCIPAL.id,
            signers,
            status: deriveStatus(signers),
          };
          set((s) => ({ documents: [doc, ...s.documents] }));
          return id;
        },

        deleteDocument: (id) => set((s) => ({ documents: s.documents.filter((d) => d.id !== id) })),

        signDocument: (docId, signerId, signature) =>
          set((s) => ({
            documents: s.documents.map((d) => {
              if (d.id !== docId) return d;
              const signed = d.signers.map((sg) =>
                sg.id === signerId ? { ...sg, status: "signed" as const, signedAt: now(), signature } : sg,
              );
              // Once an order group is done, notify the next group.
              const pendingOrders = signed.filter((x) => x.status !== "signed").map((x) => x.order);
              const nextOrder = pendingOrders.length ? Math.min(...pendingOrders) : null;
              const signers = signed.map((x) =>
                x.status === "waiting" && x.order === nextOrder ? { ...x, status: "notified" as const } : x,
              );
              return { ...d, signers, status: deriveStatus(signers), updatedAt: now() };
            }),
          })),

        simulateOtherSigners: (docId) =>
          set((s) => ({
            documents: s.documents.map((d) => {
              if (d.id !== docId) return d;
              const signers = d.signers.map((sg) =>
                sg.status === "signed"
                  ? sg
                  : { ...sg, status: "signed" as const, signedAt: now(), signature: { kind: "typed" as const, value: sg.name } },
              );
              return { ...d, signers, status: "completed", updatedAt: now() };
            }),
          })),

        requestNotarization: (input) => {
          const id = uid("z");
          const doc = get().documents.find((d) => d.id === input.documentId);
          const principal = get().principal;
          const nz: Notarization = {
            id,
            documentId: input.documentId,
            documentTitle: doc?.title ?? "Document",
            principalId: principal?.id ?? DEMO_PRINCIPAL.id,
            principalName: principal?.name ?? DEMO_PRINCIPAL.name,
            notaryId: input.notaryId,
            act: input.act,
            mode: input.mode,
            scheduledAt: input.scheduledAt,
            createdAt: now(),
            status: "awaiting_review",
            fee: input.fee,
            payment: { status: "unpaid" },
            witnesses: input.witnesses.map((w) => ({ ...w, id: uid("w") })),
            notes: input.notes,
            messages: [sys("Appointment requested. The notary will review it shortly.")],
            activity: [log("Appointment requested")],
            session: { ...emptySession },
          };
          set((s) => ({
            notarizations: [nz, ...s.notarizations],
            documents: s.documents.map((d) => (d.id === input.documentId ? { ...d, notarizationId: id } : d)),
          }));
          return id;
        },

        cancelNotarization: (id) =>
          patchNz(id, (n) => ({ ...n, status: "cancelled", messages: [...n.messages, sys("Appointment cancelled by principal.")] })),

        acceptAppointment: (id) =>
          patchNz(id, (n) => ({
            ...n,
            status: "confirmed",
            messages: [...n.messages, sys("Appointment confirmed by the notary.")],
            activity: [...n.activity, log("Appointment confirmed by notary")],
          })),

        declineAppointment: (id, reason) =>
          patchNz(id, (n) => ({
            ...n,
            status: "declined",
            messages: [...n.messages, sys(`Appointment declined${reason ? `: ${reason}` : "."}`)],
          })),

        sendMessage: (id, from, name, text) =>
          patchNz(id, (n) => ({ ...n, messages: [...n.messages, { id: uid("m"), from, name, text, at: now() }] })),

        updateSession: (id, patch, activity) =>
          patchNz(id, (n) => ({
            ...n,
            session: { ...n.session, ...patch },
            activity: activity ? [...n.activity, log(activity)] : n.activity,
          })),

        startSession: (id) =>
          patchNz(id, (n) =>
            n.status === "confirmed" ? { ...n, status: "in_session", activity: [...n.activity, log("Session started")] } : n,
          ),

        requestPayment: (id) =>
          patchNz(id, (n) => ({
            ...n,
            status: "pending_payment",
            payment: { ...n.payment, status: "requested" },
            activity: [...n.activity, log(`Payment requested: ₱${n.fee.toFixed(2)}`)],
          })),

        payNotarization: (id, method) =>
          patchNz(id, (n) => ({
            ...n,
            status: n.status === "pending_payment" ? "in_session" : n.status,
            payment: {
              status: "paid",
              method,
              paidAt: now(),
              reference: `${method.slice(0, 2).toUpperCase()}-${Math.floor(10000000 + Math.random() * 89999999)}`,
            },
            activity: [...n.activity, log(`Payment received via ${method === "card" ? "card" : method.toUpperCase()}`)],
          })),

        sealNotarization: (id) => {
          patchNz(id, (n) => ({ ...n, status: "sealing", activity: [...n.activity, log(`Notarial act performed: ${n.act}`)] }));
          setTimeout(() => {
            const reg = get().nextRegister;
            set((s) => ({
              credits: Math.max(0, s.credits - 1),
              nextRegister: { ...reg, docNo: reg.docNo + 1, pageNo: reg.docNo % 5 === 4 ? reg.pageNo + 1 : reg.pageNo },
              documents: s.documents.map((d) =>
                s.notarizations.find((z) => z.id === id)?.documentId === d.id ? { ...d, status: "completed" } : d,
              ),
            }));
            patchNz(id, (n) => ({
              ...n,
              status: "notarized",
              notarizedAt: now(),
              hash: fakeHash(),
              register: { ...reg, series: new Date().getFullYear() },
              activity: [...n.activity, log("Document sealed and entered in the notarial register")],
              messages: [...n.messages, sys("Your document is notarized and ready to download.")],
            }));
          }, 2200);
        },

        recordFileHash: (id, hash) =>
          patchNz(id, (n) => ({ ...n, fileHashes: Array.from(new Set([...(n.fileHashes ?? []), hash])) })),

        buyCredits: (n) => set((s) => ({ credits: s.credits + n })),

        resetDemo: () => set(initialData()),
      };
    },
    { name: "selyo-demo-v1", skipHydration: true },
  ),
);

