/**
 * Sanitizes URLs to prevent XSS (Cross-Site Scripting) attacks.
 * Blocks dangerous protocols like javascript: or data: and ensures
 * only http:// or https:// (or other safe formats) are allowed.
 */
export const sanitizeUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  const trimmed = url.trim();
  
  // Prevent javascript:, vbscript:, or data: URL injection
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return undefined;
  }
  
  // Allow only HTTP/HTTPS protocols
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  
  // If no protocol is specified but it looks like a valid path or host, prepend https://
  if (trimmed.length > 0 && !trimmed.includes(':')) {
    return `https://${trimmed}`;
  }
  
  return undefined;
};
