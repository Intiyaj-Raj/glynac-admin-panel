import PageHeader from "@/components/PageHeader";
export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Desktop sidebar and mobile navigation are now connected"
      />
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Navigation</p>
          <p className="font-semibold mt-1">Sidebar ready</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Responsive</p>
          <p className="font-semibold mt-1">Mobile header ready</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Layout</p>
          <p className="font-semibold mt-1">Admin shell ready</p>
        </div>
      </div>
    </div>
  );
}
