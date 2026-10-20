/** Allow established browser push services, never arbitrary subscriber URLs. */
export function isAllowedPushEndpoint(value) {
  if (typeof value !== "string" || value.length > 2000) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.hash) return false;
    return url.hostname === "fcm.googleapis.com" ||
      url.hostname === "updates.push.services.mozilla.com" ||
      url.hostname === "web.push.apple.com" ||
      /^[a-z0-9-]+\.notify\.windows\.com$/.test(url.hostname);
  } catch { return false; }
}

export function isValidPushKeys(p256dh, auth) {
  function decode(value) {
    if (typeof value !== "string" || !/^[A-Za-z0-9_-]+={0,2}$/.test(value)) return null;
    try { return Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0)); }
    catch { return null; }
  }
  const publicKey = decode(p256dh);
  const secret = decode(auth);
  return publicKey?.length === 65 && publicKey[0] === 4 && secret?.length === 16;
}
