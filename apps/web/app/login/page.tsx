"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f4f8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "DM Sans, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "2.5rem 3rem",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          textAlign: "center",
          maxWidth: "380px",
          width: "100%",
        }}
      >
        {/* Logo / wordmark */}
        <div style={{ marginBottom: "1.5rem" }}>
          <span
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "2.25rem",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.02em",
            }}
          >
            ODIN
          </span>
          <div
            style={{
              width: "32px",
              height: "3px",
              background: "#2563eb",
              borderRadius: "2px",
              margin: "0.25rem auto 0",
            }}
          />
        </div>

        <p
          style={{
            color: "#64748b",
            margin: "0 0 2rem",
            fontSize: "0.875rem",
            lineHeight: 1.5,
          }}
        >
          DeepSea Developments
          <br />
          Project Management Platform
        </p>

        <GoogleSignInButton />

        <p
          style={{
            color: "#94a3b8",
            fontSize: "0.75rem",
            margin: "1.5rem 0 0",
          }}
        >
          Internal tool — team members only
        </p>
      </div>
    </div>
  );
}

function GoogleSignInButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.625rem",
        width: "100%",
        padding: "0.75rem 1.25rem",
        background: "#fff",
        border: "1.5px solid #e2e8f0",
        borderRadius: "8px",
        fontSize: "0.9375rem",
        fontWeight: 500,
        cursor: "pointer",
        color: "#0f172a",
        fontFamily: "inherit",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = "#2563eb";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = "#e2e8f0";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <GoogleIcon />
      Sign in with Google
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.59.102-1.167.282-1.707V4.961H.957C.347 6.174 0 7.548 0 9s.348 2.826.957 4.039l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
