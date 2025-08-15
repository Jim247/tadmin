// Helper to parse instruments (handles string or array)
  export const toArray = (val: string | string[]) =>
    Array.isArray(val) ? val : typeof val === "string" ? val.split(",").map(s => s.trim()) : [];