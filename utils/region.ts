// utils/region.ts
export async function getUserRegion(): Promise<string> {
  try {
    const res = await fetch("https://ip2c.org/southafrica");
    // returns e.g. "1;ZA;ZAF;South Africa"
    const text = await res.text();
    return text.split(";")[1] || "US";
  } catch {
    return "US";
  }
}
