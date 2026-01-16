export function TrustFundsPageHeader() {
  return (
    <div className="mb-6 no-print">
      <div className="flex items-center justify-between gap-4 mb-1">
        <h1
          className="text-3xl sm:text-4xl font-semibold text-zinc-900 dark:text-zinc-100"
          style={{ fontFamily: "var(--font-cinzel), serif" }}
        >
          Trust Funds
        </h1>
      </div>

      <p className="text-zinc-600 dark:text-zinc-400">
        Monitor Funds allocation, utilization, and project status
      </p>
    </div>
  );
}
