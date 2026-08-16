const TOKEN_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function randomToken(length = 6): string {
  let token = '';
  for (let i = 0; i < length; i++) {
    token += TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)];
  }
  return token;
}

/** `<rebase|repave>-<applicationId>-<componentId>-<randomToken>`, used as both the
 * run's id and its display name so a run's identity is self-describing everywhere
 * it's shown, not just in the URL. */
export function makeRunName(type: 'rebase' | 'repave', applicationId: string, componentId: string): string {
  return `${type}-${applicationId}-${componentId}-${randomToken()}`;
}
