export const INNOVATOR_FOUNDER_BASE_PATH = "/uk/innovatorfoundervisaassistant";

export function innovatorFounderPath(path: string = "/"): string {
  const value = String(path || "/");

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:")
  ) {
    return value;
  }

  if (
    value === INNOVATOR_FOUNDER_BASE_PATH ||
    value.startsWith(INNOVATOR_FOUNDER_BASE_PATH + "/") ||
    value.startsWith(INNOVATOR_FOUNDER_BASE_PATH + "?") ||
    value.startsWith(INNOVATOR_FOUNDER_BASE_PATH + "#")
  ) {
    return value;
  }

  if (value.startsWith("#")) {
    return `${INNOVATOR_FOUNDER_BASE_PATH}${value}`;
  }

  if (value === "/") {
    return INNOVATOR_FOUNDER_BASE_PATH;
  }

  if (value.startsWith("/")) {
    return `${INNOVATOR_FOUNDER_BASE_PATH}${value}`;
  }

  return `${INNOVATOR_FOUNDER_BASE_PATH}/${value}`;
}

export function isInnovatorFounderPath(path: string): boolean {
  return (
    path === INNOVATOR_FOUNDER_BASE_PATH ||
    path.startsWith(INNOVATOR_FOUNDER_BASE_PATH + "/") ||
    path.startsWith(INNOVATOR_FOUNDER_BASE_PATH + "?") ||
    path.startsWith(INNOVATOR_FOUNDER_BASE_PATH + "#")
  );
}
