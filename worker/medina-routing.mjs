export function medinaAssetPath(url) {
  if ((url.hostname === "medina.xmedyna.com" && url.pathname === "/") || url.pathname === "/medina" || url.pathname === "/medina/") return "/medina-document.txt";
  return null;
}
