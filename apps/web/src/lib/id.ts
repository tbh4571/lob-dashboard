const TOKEN_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function randomToken(length = 6): string {
  let token = '';
  for (let i = 0; i < length; i++) {
    token += TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)];
  }
  return token;
}

/** URL/id-safe form of a human-readable name, e.g. "Billing & Payments" -> "billing-payments". */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** `<rebase|repave>-<applicationName>-<componentName>-<randomToken>`, used as both the
 * run's id and its display name so a run's identity is self-describing everywhere
 * it's shown, not just in the URL. */
export function makeRunName(type: 'rebase' | 'repave', applicationName: string, componentName: string): string {
  return `${type}-${slugify(applicationName)}-${slugify(componentName)}-${randomToken()}`;
}
