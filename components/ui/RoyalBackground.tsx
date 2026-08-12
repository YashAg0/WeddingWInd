import React from "react";

export function RoyalBackground() {
  return (
    <div
      className="fixed inset-0 w-full h-full -z-50 pointer-events-none"
      style={{
        background: "linear-gradient(180deg, #fdfaf7 0%, #faf5ef 50%, #fdfaf7 100%)",
      }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 w-full h-full opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236b1026' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[var(--color-gold-500)] opacity-[0.05] blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[var(--color-gold-300)] opacity-[0.04] blur-3xl" />
    </div>
  );
}
