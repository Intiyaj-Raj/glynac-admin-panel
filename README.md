# Glynac Enterprise Admin Panel

A frontend-only enterprise admin panel for the Glynac Wealth Management & Compliance Platform. Built with **Next.js (App Router)**, **TypeScript**, and **TailwindCSS**. This is **Task 3 (FE-3)** from the Frontend Engineering Platform task roadmap.

## Project Overview

The Enterprise Admin Panel allows System Administrators and Compliance Directors to:

- View platform-wide analytics and compliance metrics
- Manage user roles and permissions (RBAC)
- Configure compliance rules and their severity
- Monitor system health and review activity logs
- Toggle feature flags to enable/disable system capabilities

All data is mock/local state — no backend or database is connected.

## Features

### 1. Executive Metrics & Analytics Dashboard

- Four metric summary cards (Total Documents Reviewed, Compliance Violations Flagged, Pass Rate, Average Review Time)
- Interactive area chart showing review trends over 10 months
- Pie chart showing violation distribution by rule category, with an **eye icon button** to show/hide slice labels (a legend appears automatically when labels are hidden)
- Bar chart showing monthly review volume
- Built with Recharts

### 2. User & Role-Based Access Control (RBAC) Management

- Searchable user table with pagination (8 rows per page)
- Sorting by **Name, Email, Role, and Status** (click column headers). Every sortable column shows up/down arrow indicators; the active direction is highlighted and exposed via `aria-sort`
- Filter by role and status using dropdowns
- Status badges (Active, Pending, Suspended)
- Role & Permission Editor modal — assign roles (Admin, Compliance Officer, Advisor, Auditor) and toggle granular permissions (Read, Write, Approve, Admin)
- Changes persist in local React state

### 3. Compliance Rule Policy Manager

- Rule management table listing active platform rules (FINRA-2210, SEC-17a-4, DISC-09, etc.)
- Toggle rule active/inactive status with clear-state switches (green track + check/cross icon + "Active"/"Inactive" text label)
- Edit rule severity (Low, Medium, High, Critical) via edit modal
- Add new custom rules via "Add Rule" modal
- Search rules by name, ID, or category
- Consistent severity badges: one accent hue that increases in intensity from Low to Critical, plus a 4-step level meter (not color-only)

### 4. System Health & Activity Log Monitor

- System health summary cards (services operational, degraded count, avg latency, error rate)
- Service health table showing API latency, database status, and uptime
- Visual health bars for each service
- Filterable activity log stream with search, type filter (info/warning/error), and module filter
- Color-coded log type indicators

### 5. Feature Flag & Configuration Toggles

- Toggle switches for feature flags (Enable AI Substring Validation, Enable Presidio PII Masking, Enable Precedent Lookup, etc.)
- Summary cards showing total/enabled/disabled counts
- Search and category filter
- Instant visual feedback when toggling (enabled flags get a highlighted border)

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **TailwindCSS** (utility-first CSS)
- **Recharts** (charting library for analytics)

## Project Structure

```
project/
├── app/
│   ├── (admin)/                 # Admin route group with shared layout
│   │   ├── layout.tsx           # Sidebar + mobile header wrapper
│   │   ├── page.tsx             # Analytics Dashboard (/)
│   │   ├── users/
│   │   │   └── page.tsx         # User Management / RBAC (/users)
│   │   ├── rules/
│   │   │   └── page.tsx         # Compliance Rule Policy Manager (/rules)
│   │   ├── system/
│   │   │   └── page.tsx         # System Health & Activity Log (/system)
│   │   └── flags/
│   │       └── page.tsx         # Feature Flags (/flags)
│   ├── globals.css              # Global styles + Tailwind directives
│   └── layout.tsx               # Root layout
├── components/
│   ├── Sidebar.tsx              # Desktop sidebar navigation
│   ├── MobileHeader.tsx         # Mobile responsive header with menu
│   ├── PageHeader.tsx           # Reusable page title/subtitle header
│   ├── Modal.tsx                # Reusable modal with backdrop + Escape key
│   ├── Badges.tsx               # Status, severity, and log type badges
│   └── Toggle.tsx               # Reusable toggle switch (optional status label/icon)
├── data/
│   └── mockData.ts              # All mock data (users, rules, logs, flags, charts)
├── types/
│   └── index.ts                 # TypeScript type definitions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
└── next-env.d.ts
```

## Installation

```bash
# Install dependencies
npm install
```

## How to Run

```bash
# Start the development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Build

```bash
# Create a production build
npm run build

# Start the production server
npm start
```

## Main Functionality

### Dashboard (`/`)

- View 4 metric summary cards with trend indicators
- Interactive area chart (reviewed vs flagged documents over time)
- Pie chart (violation distribution by category) — click the eye icon in the card header to hide/show labels
- Bar chart (monthly review volume)

### User Management (`/users`)

- Search users by name or email
- Filter by role (Admin, Compliance Officer, Advisor, Auditor) and status
- Sort by clicking column headers (name, email, role, status); arrows on every sortable column show the current sort direction
- Click "Edit Role" to open the permission editor modal
- In the modal: select a role and toggle permissions (Read, Write, Approve, Admin)
- Save changes — the table updates in real time
- Paginate through users (8 per page)

### Policy Manager (`/rules`)

- Search rules by name, ID, or category
- Toggle rule active/inactive with the switch; its state is shown by color, icon and the text label "Active"/"Inactive"
- Click "Edit" to change severity, category, or description
- Click "Add Rule" to create a new custom compliance rule
- Severity options: Low, Medium, High, Critical

### System Health (`/system`)

- View overall health summary (operational/degraded counts, avg latency, error rate)
- Service health table with latency, uptime, and visual health bars
- Activity log stream with search, type filter, and module filter
- Color-coded log entries (blue=info, yellow=warning, red=error)

### Feature Flags (`/flags`)

- View total/enabled/disabled flag counts
- Search flags by name or description
- Filter by category
- Toggle any flag on/off with instant visual feedback

## UI Review Updates

| Area                           | Change                                                                                                                                                                                                   |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard – Pie chart          | Eye icon button in the card header toggles slice labels. When hidden, the chart becomes a donut with a color legend so categories stay identifiable.                                                     |
| User Management                | Name, Email, Role and Status all show sort arrows (neutral when inactive, highlighted for the active direction). Headers are real buttons (keyboard accessible) with `aria-sort`. Email is now sortable. |
| Policy Manager – Severity      | Replaced four different colors with a single-hue scale (neutral → rose, increasing intensity) and a 4-bar level meter.                                                                                   |
| Policy Manager – Active toggle | `Toggle` has an optional `showStatus` prop: green track, check/cross icon in the knob, and an "Active"/"Inactive" label. Feature Flags keeps the original toggle.                                        |

Files touched: `app/(admin)/page.tsx`, `app/(admin)/users/page.tsx`, `app/(admin)/rules/page.tsx`, `components/Badges.tsx`, `components/Toggle.tsx`.

## Mock Data / State

All data is stored in `data/mockData.ts` and managed with React `useState` in each page component:

- **mockUsers** — 12 users with roles, statuses, permissions, and last active timestamps
- **mockRules** — 8 compliance rules (FINRA, SEC, AML, etc.) with severity and active status
- **mockServices** — 6 system services with latency, uptime, and status
- **mockActivityLogs** — 10 audit log entries with user, action, module, and type
- **mockFeatureFlags** — 6 feature flags with categories and descriptions
- **reviewTrendData** — 10 months of review/violation data for charts
- **violationDistributionData** — 5 categories with percentage values for pie chart
- **summaryMetrics** — 4 metric values for dashboard cards

No external API or database is used. All state changes (role edits, rule toggles, flag toggles) happen in local React state and reset on page reload.

## Task Requirements Completed

From the Task 3 (FE-3) requirements:

- [x] **Analytics Dashboard:** Metric summary cards (Total Documents Reviewed, Compliance Violations Flagged, Pass Rate %, Average Review Time) and interactive charts (area, pie, bar) showing review trends and violation distribution
- [x] **RBAC Management:** Searchable user table with pagination, sorting, and status badges + Role & Permission Editor modal with granular permissions (Read, Write, Approve, Admin)
- [x] **Policy Manager:** Rule management table with severity editing (Low, Medium, High, Critical), active status toggles, and custom rule creation
- [x] **System Health:** Service health monitoring (API latency, database status, error rate) + filterable real-time audit log stream
- [x] **Feature Flags:** Toggle switch panel with instant state feedback and active status indicators
- [x] Responsive layout with TailwindCSS
- [x] TypeScript types for all data models
- [x] Reusable components (Modal, Toggle, Badges, PageHeader)
- [x] Review feedback applied: pie chart label show/hide, sort indicators on all sortable columns, consistent severity badges, clearer Active toggle

## Future Improvements

- Add dark/light mode toggle
- Connect to a real backend API for persistent data
- Add user creation and deletion flows
- Implement role-based UI restrictions (hide certain actions for non-admins)
- Add real-time WebSocket updates for activity logs
- Export analytics reports as PDF/CSV
- Add bulk user operations (import/export)
- Add rule versioning and change history

## Author

Built as part of the Glynac Frontend Engineering Platform task.
