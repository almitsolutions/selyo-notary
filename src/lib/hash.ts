export async function sha256Hex(bytes: ArrayBuffer | Uint8Array) {
  const buf = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
