// Helper to parse instruments field
export function parseInstruments(instruments: string | string[] | undefined): string[] {
  if (!instruments) return [];
  if (Array.isArray(instruments)) return instruments;
  try {
    return JSON.parse(instruments);
  } catch {
    return [];
  }
}
