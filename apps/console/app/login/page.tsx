"use client";

import { createAuthClient } from "better-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fw } from "@fireweaveai/web-sdk/start";
import { Button } from "../../components/Button";
import { COPY } from "../../lib/copy";
import { ERROR_CODES } from "../../lib/errors";

const authClient = createAuthClient();

function acceptTermsEnabled() {
  // @fireweave-controlpoint login-accept-terms
  return fw.controlPoints.getBooleanValue("login-accept-terms", false);
}

function useAcceptTerms() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(acceptTermsEnabled());
    return fw.subscribe(() => setOn(acceptTermsEnabled()));
  }, []);
  return on;
}

export default function LoginPage() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const acceptTerms = useAcceptTerms();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const { data, error: signInError } = await authClient.signIn.email({
      email,
      password: String(form.get("password") ?? ""),
    });
    if (signInError) {
      setPending(false);
      setError(COPY.signInError);
      return;
    }
    if (data?.user?.id) {
      await fw.identify(data.user.id, { email: data.user.email ?? email });
    }
    window.location.href = "/inbox";
  }

  return (
    <div className="auth">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Sign in</h1>
        {error ? (
          <p className="banner error">
            {error}
            <span className="code">{ERROR_CODES.AUTH_FAILED}</span>
          </p>
        ) : null}
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="username" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        {acceptTerms ? (
          <label className="auth-check" htmlFor="accept-terms">
            <input id="accept-terms" name="acceptTerms" type="checkbox" required />
            <span>{COPY.acceptTerms}</span>
          </label>
        ) : null}
        <Button variant="primary" type="submit" loading={pending}>
          Sign in
        </Button>
        <div className="switch">
          <span className="muted">New clinic?</span>
          <Link className="btn btn-ghost btn-md" href="/signup">
            Create a clinic
          </Link>
        </div>
      </form>
    </div>
  );
}
