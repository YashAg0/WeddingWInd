"use client";

import { useEffect } from "react";

/**
 * app/global-error.tsx
 *
 * Root-level error boundary — catches errors in the root layout itself.
 * Must include its own <html> and <body> tags since it replaces the layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error.message, error.digest);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          backgroundColor: "#fdfaf7",
          color: "#1a1a1a",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: 480 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#fef2f2",
              border: "1px solid #fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              fontSize: "1.5rem",
            }}
          >
            ⚠️
          </div>
          <h1
            style={{
              fontWeight: 700,
              fontSize: "1.5rem",
              marginBottom: "0.5rem",
              color: "#1a1a1a",
            }}
          >
            Critical Error
          </h1>
          <p style={{ color: "#6d6d6d", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
            A critical application error occurred. Please refresh the page.
            {error.digest && (
              <span style={{ display: "block", marginTop: "0.5rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#888" }}>
                Error ID: {error.digest}
              </span>
            )}
          </p>
          <button
            onClick={reset}
            style={{
              background: "#6b1026",
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "0.625rem 1.5rem",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
