import { summaryMetrics } from "@/data/mockData";

export default function HomePage() {
  const metrics = [
    ["Documents Reviewed", summaryMetrics.totalDocumentsReviewed],
    ["Violations Flagged", summaryMetrics.complianceViolationsFlagged],
    ["Pass Rate", `${summaryMetrics.passRate}%`],
    ["Avg. Review Time", summaryMetrics.averageReviewTime],
  ];
  return (
    <main className="min-h-screen bg-slate-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mt-2">
          Analytics Foundation
        </h1>
        <p className="text-slate-500 mt-2">
          Mock data and TypeScript models are now visible in the UI.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {metrics.map(([label, value]) => (
            <div
              key={label}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm"
            >
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
