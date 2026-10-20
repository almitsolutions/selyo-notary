"use client";

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import QRCode from "qrcode";
import type { DocumentItem, Notarization, Notary, User } from "@/lib/types";
import { brand } from "@/lib/brand";
import { fileStore } from "@/lib/files";

const INK = rgb(0.043, 0.102, 0.18);
const MUTED = rgb(0.39, 0.43, 0.49);
const NAVY = rgb(0.055, 0.208, 0.345);
const GOLD = rgb(0.753, 0.541, 0.118);

function wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function paragraph(page: PDFPage, text: string, font: PDFFont, size: number, x: number, y: number, maxWidth: number, lead = 1.55) {
  for (const l of wrap(text, font, size, maxWidth)) {
    page.drawText(l, { x, y, size, font, color: INK });
    y -= size * lead;
  }
  return y;
}

const bodyFor = (doc: DocumentItem, principal: string) =>
  [
    `I, ${principal.toUpperCase()}, of legal age, Filipino, and a resident of the Philippines, after having been duly sworn in accordance with law, hereby depose and state that:`,
    `1. I am the person who executed this ${doc.type.toLowerCase()} and I do so freely and voluntarily, with full knowledge of its contents.`,
    `2. The statements contained in this document are true and correct of my own personal knowledge and/or based on authentic records.`,
    `3. I am executing this instrument to attest to the truth of the foregoing and for whatever legal purpose it may serve.`,
    `IN WITNESS WHEREOF, I have hereunto set my hand this ${new Date(doc.createdAt).toLocaleDateString("en-PH", { day: "numeric", month: "long", year: "numeric" })}.`,
  ];

async function drawSignature(pdf: PDFDocument, page: PDFPage, sig: DocumentItem["signers"][number], x: number, y: number, script: PDFFont) {
  if (sig.signature?.kind === "drawn" && sig.signature.value.startsWith("data:image/png")) {
    const png = await pdf.embedPng(sig.signature.value);
    const dims = png.scaleToFit(160, 42);
    page.drawImage(png, { x, y: y + 4, width: dims.width, height: dims.height });
  } else if (sig.status === "signed") {
    page.drawText(sig.signature?.value ?? sig.name, { x, y: y + 10, size: 18, font: script, color: NAVY });
  }
  page.drawLine({ start: { x, y }, end: { x: x + 180, y }, thickness: 0.7, color: INK });
}

export async function buildNotarizedPdf(opts: {
  nz: Notarization;
  doc?: DocumentItem;
  notary: Notary;
  principal?: User | null;
  origin: string;
}) {
  const { nz, doc, notary, principal, origin } = opts;
  const pdf = await PDFDocument.create();
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const script = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const mono = await pdf.embedFont(StandardFonts.Courier);
  const when = new Date(nz.notarizedAt ?? nz.scheduledAt);
  pdf.setTitle(nz.documentTitle);
  pdf.setProducer(brand.name);
  pdf.setCreator(brand.name);
  pdf.setCreationDate(when);
  pdf.setModificationDate(when);

  // 1) The document itself — the uploaded file if we still have it, else a rendered stand-in.
  const original = doc ? fileStore.get(doc.id) : undefined;
  if (original) {
    const src = await PDFDocument.load(await original.arrayBuffer(), { ignoreEncryption: true });
    const pages = await pdf.copyPages(src, src.getPageIndices());
    pages.forEach((p) => pdf.addPage(p));
  } else {
    const page = pdf.addPage([612, 936]); // Philippine long bond paper (8.5 x 13 in)
    const { width } = page.getSize();
    page.drawText("REPUBLIC OF THE PHILIPPINES )", { x: 72, y: 860, size: 11, font: serif, color: INK });
    page.drawText(`${notary.city.toUpperCase()} ) S.S.`, { x: 72, y: 845, size: 11, font: serif, color: INK });
    const title = (doc?.type ?? nz.documentTitle).toUpperCase();
    page.drawText(title, { x: (width - serifBold.widthOfTextAtSize(title, 15)) / 2, y: 790, size: 15, font: serifBold, color: INK });
    let y = 740;
    for (const p of bodyFor(doc ?? ({ type: "document", createdAt: nz.createdAt } as DocumentItem), nz.principalName)) {
      y = paragraph(page, p, serif, 12, 72, y, width - 144) - 12;
    }
    y -= 40;
    const signers = doc?.signers ?? [];
    let x = 72;
    for (const s of signers.length ? signers : [{ id: "p", name: nz.principalName, email: "", role: "signer" as const, order: 1, status: "signed" as const }]) {
      await drawSignature(pdf, page, s, x, y, script);
      page.drawText(s.name.toUpperCase(), { x, y: y - 14, size: 10, font: serifBold, color: INK });
      page.drawText(s.role === "approver" ? "Approver" : "Affiant / Signer", { x, y: y - 27, size: 9, font: serif, color: MUTED });
      x += 240;
      if (x > width - 200) {
        x = 72;
        y -= 90;
      }
    }
  }

  // 2) Notarial certificate page.
  const cert = pdf.addPage([612, 936]);
  const W = cert.getSize().width;
  const verifyUrl = `${origin}/verify?id=${nz.id}`;
  const qr = await pdf.embedPng(await QRCode.toDataURL(verifyUrl, { margin: 1, width: 240 }));

  cert.drawRectangle({ x: 36, y: 36, width: W - 72, height: 864, borderColor: NAVY, borderWidth: 1 });
  const head = "NOTARIAL CERTIFICATE";
  cert.drawText(head, { x: (W - serifBold.widthOfTextAtSize(head, 16)) / 2, y: 840, size: 16, font: serifBold, color: INK });
  const sub = `Electronic Notarization · ${nz.mode === "remote" ? "Remote (REN)" : "In-person (IEN)"} · ${nz.act}`;
  cert.drawText(sub, { x: (W - sans.widthOfTextAtSize(sub, 9.5)) / 2, y: 822, size: 9.5, font: sans, color: MUTED });

  cert.drawText("REPUBLIC OF THE PHILIPPINES )", { x: 72, y: 780, size: 11, font: serif, color: INK });
  cert.drawText(`${notary.city.toUpperCase()} ) S.S.`, { x: 72, y: 765, size: 11, font: serif, color: INK });

  const dateLong = when.toLocaleDateString("en-PH", { day: "numeric", month: "long", year: "numeric" });
  const idText = principal?.kyc.idType ? `${principal.kyc.idType}` : "PhilSys National ID";
  const appear = nz.mode === "remote" ? "personally appeared through audio-visual communication" : "personally appeared";
  const wording =
    nz.act === "Jurat" || nz.act === "Oath or Affirmation"
      ? `SUBSCRIBED AND SWORN to before me, an Electronic Notary Public for and in ${notary.city}, Philippines, this ${dateLong}, by ${nz.principalName}, who ${appear} and exhibited competent evidence of identity, namely ${idText}, verified electronically, and who attested to the truth of the contents of the foregoing instrument.`
      : `BEFORE ME, an Electronic Notary Public for and in ${notary.city}, Philippines, this ${dateLong}, ${appear} ${nz.principalName}, identified through competent evidence of identity, namely ${idText}, verified electronically, who acknowledged that the foregoing instrument is their free and voluntary act and deed.`;
  let y = paragraph(cert, wording, serif, 12, 72, 725, W - 144) - 10;
  if (nz.witnesses.length) {
    y = paragraph(cert, `Also appearing as witness(es): ${nz.witnesses.map((w) => w.name).join(", ")}.`, serif, 12, 72, y, W - 144) - 10;
  }
  y = paragraph(cert, "WITNESS MY HAND AND ELECTRONIC NOTARIAL SEAL on the date and place first above written.", serif, 12, 72, y, W - 144);

  // Seal
  const sx = 150;
  const sy = y - 110;
  cert.drawCircle({ x: sx, y: sy, size: 58, borderColor: GOLD, borderWidth: 2, opacity: 0 });
  cert.drawCircle({ x: sx, y: sy, size: 48, borderColor: GOLD, borderWidth: 0.8, opacity: 0 });
  const sealLines = ["ELECTRONIC", "NOTARY PUBLIC", "PHILIPPINES"];
  sealLines.forEach((l, i) =>
    cert.drawText(l, { x: sx - sans.widthOfTextAtSize(l, 8) / 2, y: sy + 10 - i * 11, size: 8, font: sans, color: NAVY }),
  );

  // Notary signature block
  const nx = 330;
  cert.drawText(notary.name.replace("Atty. ", ""), { x: nx, y: sy + 26, size: 20, font: script, color: NAVY });
  cert.drawLine({ start: { x: nx, y: sy + 18 }, end: { x: W - 72, y: sy + 18 }, thickness: 0.7, color: INK });
  const info = [
    notary.name.toUpperCase(),
    "Electronic Notary Public",
    `Commission No. ${notary.commissionNo}`,
    `Valid until ${new Date(notary.commissionValidUntil).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}`,
    `Roll of Attorneys No. ${notary.rollNumber}`,
    `${notary.city}, ${notary.province}`,
  ];
  info.forEach((l, i) => cert.drawText(l, { x: nx, y: sy + 4 - i * 13, size: i === 0 ? 10 : 9.5, font: i === 0 ? serifBold : serif, color: INK }));

  // Register entry
  const ry = sy - 110;
  const reg = nz.register ?? { docNo: 0, pageNo: 0, bookNo: 0, series: when.getFullYear() };
  [`Doc. No. ${reg.docNo};`, `Page No. ${reg.pageNo};`, `Book No. ${reg.bookNo};`, `Series of ${reg.series}.`].forEach((l, i) =>
    cert.drawText(l, { x: 72, y: ry - i * 14, size: 11, font: serif, color: INK }),
  );

  // Verification footer
  cert.drawLine({ start: { x: 72, y: 190 }, end: { x: W - 72, y: 190 }, thickness: 0.5, color: MUTED });
  cert.drawImage(qr, { x: 72, y: 70, width: 100, height: 100 });
  const vx = 190;
  cert.drawText("VERIFY THIS DOCUMENT", { x: vx, y: 158, size: 9, font: sans, color: NAVY });
  paragraph(
    cert,
    `Scan the QR code or upload this PDF at ${origin.replace(/^https?:\/\//, "")}/verify. Any change to this file after sealing will cause verification to fail.`,
    sans,
    9,
    vx,
    142,
    W - vx - 72,
    1.5,
  );
  cert.drawText(`Record ID: ${nz.id.toUpperCase()}`, { x: vx, y: 98, size: 8.5, font: mono, color: MUTED });
  cert.drawText(`Sealed: ${when.toISOString()}`, { x: vx, y: 86, size: 8.5, font: mono, color: MUTED });
  cert.drawText(`Issued via ${brand.name} electronic notarization facility`, { x: vx, y: 74, size: 8.5, font: mono, color: MUTED });

  return pdf.save({ useObjectStreams: false });
}

export function downloadBytes(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
