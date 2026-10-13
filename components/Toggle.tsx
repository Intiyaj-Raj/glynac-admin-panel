"use client";

// Toggle switch used for feature flags and rule active status.
// With `showStatus`, the current state is made explicit: green track + check icon
// when on, grey track + cross icon when off, and a text label ("Active"/"Inactive").
export default function Toggle({
  checked,
  onChange,
  label,
  showStatus = false,
  onText = "Active",
  offText = "Inactive",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  showStatus?: boolean;
  onText?: string;
  offText?: string;
}) {
  const onColor = showStatus ? "bg-green-600" : "bg-primary-600";

  const button = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        showStatus
          ? "focus-visible:ring-green-500"
          : "focus-visible:ring-primary-500"
      } ${checked ? onColor : "bg-slate-300"}`}
    >
      <span
        className={`pointer-events-none inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          checked ? "translate-x-5" : "translate-x-0.5"
        } mt-0.5`}
      >
        {showStatus &&
          (checked ? (
            <svg
              className="w-3 h-3 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              className="w-3 h-3 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          ))}
      </span>
    </button>
  );

  if (!showStatus) return button;

  return (
    <div className="inline-flex items-center gap-2">
      {button}
      <span
        className={`text-xs font-medium w-14 ${checked ? "text-green-700" : "text-slate-500"}`}
        aria-live="polite"
      >
        {checked ? onText : offText}
      </span>
    </div>
  );
}
