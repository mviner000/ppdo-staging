import TrustFundsTable from "./TrustFundsTable";
import { TrustFundsPageHeader } from "./TrustFundsPageHeader";
import TrustFundStatistics from "./TrustFundsStatistics";
import { mockTrustFunds } from "./mockData";

export default function TrustFundsPage() {
  // Calculate totals from mockTrustFunds
  const totals = mockTrustFunds.reduce(
    (acc, item) => {
      acc.received += item.received;
      acc.utilized += item.utilized;
      acc.balance += item.balance;
      return acc;
    },
    { received: 0, utilized: 0, balance: 0 }
  );

  return (
    <div className="p-6">
      <TrustFundsPageHeader />

      {/* Add stats here */}
      <TrustFundStatistics
        totalReceived={totals.received}
        totalUtilized={totals.utilized}
        totalBalance={totals.balance}
        totalProjects={mockTrustFunds.length}
      />

      <TrustFundsTable data={mockTrustFunds} />
    </div>
  );
}
