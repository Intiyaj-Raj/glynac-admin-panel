"use client";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import Toggle from "@/components/Toggle";
export default function HomePage() {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(true);
  return (
    <main className="min-h-screen bg-slate-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Admin UI Components"
          subtitle="Modal and toggle interactions are now visible"
        />
        <div className="bg-white rounded-xl p-6 border border-slate-200 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">
              Role & Permission Editor
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Open the modal to preview the reusable dialog.
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium"
          >
            Open Editor
          </button>
        </div>
        <div className="mt-4 bg-white rounded-xl p-5 border border-slate-200 flex justify-between">
          <span className="text-sm font-medium">Demo feature</span>
          <Toggle checked={enabled} onChange={setEnabled} />
        </div>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Role & Permission Editor"
        >
          <p className="text-sm text-slate-600">
            Reusable modal is working. This will be used by the admin management
            screens.
          </p>
          <button
            onClick={() => setOpen(false)}
            className="mt-5 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm"
          >
            Close
          </button>
        </Modal>
      </div>
    </main>
  );
}
