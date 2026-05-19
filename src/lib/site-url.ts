export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured.startsWith("http") ? configured : `https://${configured}`;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel}`;
  }

  return "http://localhost:3000";
}
