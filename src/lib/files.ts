"use client";

// Uploaded PDFs are kept in memory for the demo (lost on refresh).
// Replace with object storage (S3 / Supabase Storage) later.
const files = new Map<string, File>();

export const fileStore = {
  set: (docId: string, file: File) => files.set(docId, file),
  get: (docId: string) => files.get(docId),
  url: (docId: string) => {
    const f = files.get(docId);
    return f ? URL.createObjectURL(f) : null;
  },
};
