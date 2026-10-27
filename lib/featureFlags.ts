import type { FeatureFlag } from "@/types";

export const FLAGS_STORAGE_KEY = "glynac.admin.featureFlags.v1";
const STORAGE_VERSION = 1;

export const FLAG_IDS = {
  AI_SUBSTRING_VALIDATION: "flag-1",
  PRESIDIO_PII_MASKING: "flag-2",
  PRECEDENT_LOOKUP: "flag-3",
} as const;

export const REQUIRED_FLAG_IDS: string[] = Object.values(FLAG_IDS);

export function flagLabel(flag: { name?: string; id: string }): string {
  const name = typeof flag.name === "string" ? flag.name.trim() : "";
  return name ? name.replace(/^Enable\s+/i, "") : flag.id;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "";
}

export function sanitizeFlagList(input: unknown): FeatureFlag[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: FeatureFlag[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const f = raw as Partial<FeatureFlag>;
    if (
      !isNonEmptyString(f.id) ||
      !isNonEmptyString(f.name) ||
      typeof f.enabled !== "boolean" ||
      seen.has(f.id)
    ) {
      continue;
    }
    seen.add(f.id);
    out.push({
      id: f.id,
      name: f.name,
      description: typeof f.description === "string" ? f.description : "",
      category: isNonEmptyString(f.category) ? f.category : "General",
      configKey: isNonEmptyString(f.configKey) ? f.configKey : f.id,
      enabled: f.enabled,
      updatedAt: typeof f.updatedAt === "string" ? f.updatedAt : undefined,
      updatedBy: typeof f.updatedBy === "string" ? f.updatedBy : undefined,
    });
  }
  return out;
}
export function buildDefaultFlags(defaults: FeatureFlag[]): FeatureFlag[] {
  const clean = sanitizeFlagList(defaults);
  const missing = REQUIRED_FLAG_IDS.filter(
    (id) => !clean.some((f) => f.id === id),
  );
  if (missing.length > 0) {
    console.error("Missing required feature flags in defaults:", missing);
  }
  return clean;
}

type PersistedShape = {
  version: number;
  flags: Record<
    string,
    { enabled: boolean; updatedAt?: string; updatedBy?: string }
  >;
};

export type LoadResult =
  | { status: "empty"; flags: FeatureFlag[] } // nothing saved yet
  | { status: "ok"; flags: FeatureFlag[] }
  | { status: "invalid"; flags: FeatureFlag[] } // saved data was corrupt
  | { status: "unavailable"; flags: FeatureFlag[] }; // storage not accessible

export type SaveResult = { ok: true } | { ok: false; error: unknown };

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage ?? null; // may throw (privacy mode, blocked cookies)
  } catch {
    return null;
  }
}

export function loadPersistedFlags(defaults: FeatureFlag[]): LoadResult {
  const base = buildDefaultFlags(defaults);
  const storage = getStorage();
  if (!storage) return { status: "unavailable", flags: base };

  let raw: string | null;
  try {
    raw = storage.getItem(FLAGS_STORAGE_KEY);
  } catch {
    return { status: "unavailable", flags: base };
  }
  if (raw === null) return { status: "empty", flags: base };

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedShape> | null;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.version !== STORAGE_VERSION ||
      !parsed.flags ||
      typeof parsed.flags !== "object" ||
      Array.isArray(parsed.flags)
    ) {
      return { status: "invalid", flags: base };
    }
    const saved = parsed.flags;
    const merged = base.map((f) => {
      const s = saved[f.id];
      if (!s || typeof s !== "object" || typeof s.enabled !== "boolean")
        return f;
      return {
        ...f,
        enabled: s.enabled,
        updatedAt: typeof s.updatedAt === "string" ? s.updatedAt : f.updatedAt,
        updatedBy: typeof s.updatedBy === "string" ? s.updatedBy : f.updatedBy,
      };
    });
    return { status: "ok", flags: merged };
  } catch {
    return { status: "invalid", flags: base };
  }
}

export function savePersistedFlags(flags: FeatureFlag[]): SaveResult {
  const storage = getStorage();
  if (!storage)
    return { ok: false, error: new Error("localStorage unavailable") };
  try {
    const payload: PersistedShape = {
      version: STORAGE_VERSION,
      flags: Object.fromEntries(
        flags.map((f) => [
          f.id,
          {
            enabled: f.enabled,
            updatedAt: f.updatedAt,
            updatedBy: f.updatedBy,
          },
        ]),
      ),
    };
    storage.setItem(FLAGS_STORAGE_KEY, JSON.stringify(payload));
    return { ok: true };
  } catch (error) {
    return { ok: false, error }; // quota exceeded, access denied, ...
  }
}
