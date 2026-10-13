"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import PageHeader from "@/components/PageHeader";
import {
  summaryMetrics,
  reviewTrendData,
  violationDistributionData,
} from "@/data/mockData";

// Metric summary card with icon, label, value and trend indicator
function MetricCard({
  label,
  value,
  icon,
  trend,
  trendUp,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
          {icon}
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {trend}
        </span>
      </div>
      <p className="text-sm text-slate-500 mt-4">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  // Controls whether the pie chart shows its slice labels
  const [showPieLabels, setShowPieLabels] = useState(true);

  return (
    <div>
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Platform-wide compliance metrics and review trends"
      />

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Documents Reviewed"
          value={summaryMetrics.totalDocumentsReviewed.toLocaleString()}
          trend="+12.5%"
          trendUp={true}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <MetricCard
          label="Compliance Violations Flagged"
          value={summaryMetrics.complianceViolationsFlagged}
          trend="+5.2%"
          trendUp={true}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <MetricCard
          label="Pass Rate"
          value={`${summaryMetrics.passRate}%`}
          trend="+1.8%"
          trendUp={true}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          label="Average Review Time"
          value={summaryMetrics.averageReviewTime}
          trend="-0.3 min"
          trendUp={false}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Review Trend Area Chart - takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Review Trends</h3>
          <p className="text-sm text-slate-500 mb-4">Documents reviewed vs. violations flagged over time</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={reviewTrendData}>
              <defs>
                <linearGradient id="colorReviewed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "13px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "13px" }} />
              <Area
                type="monotone"
                dataKey="reviewed"
                name="Documents Reviewed"
                stroke="#3b82f6"
                fill="url(#colorReviewed)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="flagged"
                name="Violations Flagged"
                stroke="#ef4444"
                fill="url(#colorFlagged)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Violation Distribution Pie Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Violation Distribution</h3>
              <p className="text-sm text-slate-500">By rule category</p>
            </div>
            {/* Show / hide labels toggle (eye icon) */}
            <button
              type="button"
              onClick={() => setShowPieLabels((v) => !v)}
              aria-pressed={showPieLabels}
              aria-label={showPieLabels ? "Hide chart labels" : "Show chart labels"}
              title={showPieLabels ? "Hide labels" : "Show labels"}
              className={`flex-shrink-0 p-2 rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                showPieLabels
                  ? "border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {showPieLabels ? (
                // Eye (labels visible)
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                // Eye with slash (labels hidden)
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={violationDistributionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={showPieLabels ? 0 : 50}
                outerRadius={showPieLabels ? 80 : 95}
                paddingAngle={showPieLabels ? 0 : 2}
                label={
                  showPieLabels
                    ? ({ name, value }) => `${name} ${value}%`
                    : false
                }
                labelLine={showPieLabels}
                isAnimationActive={false}
              >
                {violationDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value}%`, name]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "13px",
                }}
              />
              {/* With labels hidden, a legend keeps the colors identifiable */}
              {!showPieLabels && (
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px" }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Review Bar Chart */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Monthly Review Volume</h3>
        <p className="text-sm text-slate-500 mb-4">Total documents reviewed per month</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={reviewTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "13px",
              }}
            />
            <Bar dataKey="reviewed" name="Reviewed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
