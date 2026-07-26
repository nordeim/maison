/**
 * Maison — Sign-up page
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Maison account.",
};

export default function SignUpPage() {
  return (
    <main
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: 400, width: "100%" }}>
        <p className="eyebrow">Join Maison</p>
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "2.5rem",
            fontWeight: 400,
            marginBottom: "2rem",
          }}
        >
          Create your <em style={{ color: "#a86b4a" }}>account</em>
        </h1>

        <form
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          action="/api/auth/sign-up/email"
          method="POST"
        >
          <label>
            <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8a8178" }}>
              Name
            </span>
            <input
              type="text"
              name="name"
              required
              style={{
                display: "block",
                width: "100%",
                padding: "0.75rem",
                marginTop: "0.5rem",
                border: "1px solid #e5ddd1",
                background: "#ffffff",
                fontSize: 16,
              }}
            />
          </label>
          <label>
            <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8a8178" }}>
              Email
            </span>
            <input
              type="email"
              name="email"
              required
              style={{
                display: "block",
                width: "100%",
                padding: "0.75rem",
                marginTop: "0.5rem",
                border: "1px solid #e5ddd1",
                background: "#ffffff",
                fontSize: 16,
              }}
            />
          </label>
          <label>
            <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8a8178" }}>
              Password (min 8 characters)
            </span>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              style={{
                display: "block",
                width: "100%",
                padding: "0.75rem",
                marginTop: "0.5rem",
                border: "1px solid #e5ddd1",
                background: "#ffffff",
                fontSize: 16,
              }}
            />
          </label>
          <button
            type="submit"
            style={{
              padding: "0.95rem 1.75rem",
              background: "#a86b4a",
              color: "#faf8f5",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              border: "none",
              cursor: "pointer",
              marginTop: "0.5rem",
            }}
          >
            Create Account
          </button>
        </form>

        <p style={{ marginTop: "2rem", fontSize: "0.875rem", color: "#8a8178" }}>
          Already have an account?{" "}
          <a href="/auth/sign-in" style={{ color: "#a86b4a", borderBottom: "1px solid #a86b4a" }}>
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}
