"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Mail, Smartphone } from "lucide-react";
import { Button, Field, Input, Segmented, Spinner } from "@/components/ui";
import { useApp } from "@/lib/store";
import { sleep } from "@/lib/utils";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4">
      <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
      <path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.7-4.1zM13.9 5c.7-.9 1.2-2 1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.3-.6 3.1-1.5z" />
    </svg>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const signInPrincipal = useApp((s) => s.signInPrincipal);
  const signInNotary = useApp((s) => s.signInNotary);
  const [as, setAs] = useState<"principal" | "notary">(params.get("as") === "notary" ? "notary" : "principal");
  const [step, setStep] = useState<"start" | "otp">("start");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const next = params.get("next");

  async function finish(provider: string) {
    setBusy(provider);
    await sleep(700);
    if (as === "notary") {
      signInNotary();
      router.push(next ?? "/notary");
    } else {
      signInPrincipal(name || undefined, email || undefined);
      const kyc = useApp.getState().principal?.kyc.status;
      router.push(mode === "signup" || kyc !== "verified" ? `/onboarding/verify-id${next ? `?next=${encodeURIComponent(next)}` : ""}` : next ?? "/app");
    }
  }

  if (step === "otp") {
    return (
      <div className="animate-fade-up">
        <h1 className="text-[34px] leading-[1.08] font-normal">
          Check your email
          <br />
          <span className="text-soft">for a 6-digit code</span>
        </h1>
        <p className="mt-4 text-[14.5px]">
          We sent it to <span className="text-ink">{email || "your email"}</span>. Demo: any 6 digits work.
        </p>
        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            finish("otp");
          }}
        >
          <Input
            autoFocus
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="••••••"
            className="h-14 text-center font-mono text-[24px] tracking-[0.5em]"
          />
          <Button type="submit" size="lg" className="mt-4 w-full" disabled={otp.length !== 6 || !!busy}>
            {busy ? <Spinner /> : "Continue"}
          </Button>
        </form>
        <button onClick={() => setStep("start")} className="mt-5 text-[14px] text-primary underline underline-offset-4">
          Use a different email
        </button>
      </div>
    );
  }

  const providers = [
    { id: "egov", label: "Continue with eGovPH", icon: <Smartphone className="size-4 text-[#0038a8]" /> },
    { id: "google", label: "Continue with Google", icon: <GoogleIcon /> },
    { id: "apple", label: "Continue with Apple", icon: <AppleIcon /> },
    { id: "sso", label: "Continue with SSO", icon: <Building2 className="size-4" /> },
  ];

  return (
    <div>
      <h1 className="text-[34px] leading-[1.08] font-normal sm:text-[38px]">
        {mode === "login" ? "Sign in" : "Create your account"}
        <br />
        <span className="text-soft">{mode === "login" ? "to your account" : "it's free"}</span>
      </h1>

      <Segmented
        className="mt-6 w-full [&>button]:flex-1 [&>button]:justify-center"
        value={as}
        onChange={setAs}
        options={[
          { value: "principal", label: "I need a notary" },
          { value: "notary", label: "I'm a notary" },
        ]}
      />

      <div className="mt-5 space-y-2.5">
        {providers.map((p) => (
          <Button key={p.id} variant="secondary" size="lg" className="w-full justify-start gap-3 font-normal" onClick={() => finish(p.id)} disabled={!!busy}>
            {busy === p.id ? <Spinner /> : p.icon}
            {p.label}
          </Button>
        ))}
      </div>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-line-strong" />
        <span className="mono-label">or</span>
        <span className="h-px flex-1 bg-line-strong" />
      </div>

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setStep("otp");
        }}
      >
        {mode === "signup" && (
          <>
            <Field label="Full name (as on your ID)">
              <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Dela Cruz" autoComplete="name" />
            </Field>
            <Field label="Mobile number">
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63 9XX XXX XXXX" autoComplete="tel" />
            </Field>
          </>
        )}
        <Field label={mode === "signup" ? "Email" : ""} className={mode === "login" ? "[&>span:first-child]:hidden" : ""}>
          <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g., juan@example.com" autoComplete="email" />
        </Field>
        <Button type="submit" size="lg" className="w-full" disabled={!email}>
          <Mail className="size-4" /> Continue with email
        </Button>
      </form>

      <div className="mt-6 space-y-2 border-t border-line pt-5 text-[13px] text-muted">
        <p>
          By continuing, you agree to our <Link href="#" className="text-primary underline underline-offset-2">terms of service</Link> and{" "}
          <Link href="#" className="text-primary underline underline-offset-2">privacy policy</Link>.
        </p>
        <p>
          {mode === "login" ? (
            <>New here? <Link href="/signup" className="text-primary underline underline-offset-2">Create an account</Link></>
          ) : (
            <>Already have an account? <Link href="/login" className="text-primary underline underline-offset-2">Sign in</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
