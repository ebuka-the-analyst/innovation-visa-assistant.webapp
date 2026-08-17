const TAB_PARAM = "tab";

function normaliseTabLabel(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function requestedTab(): string | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get(TAB_PARAM);
  if (!value) return null;
  const normalised = normaliseTabLabel(value);
  return normalised || null;
}

function tabKey(tab: HTMLElement): string | null {
  const testId = tab.getAttribute("data-testid") || "";
  if (testId.startsWith("tab-")) {
    const fromTestId = normaliseTabLabel(testId.slice(4));
    if (fromTestId) return fromTestId;
  }

  const label = tab.textContent || "";
  const fromLabel = normaliseTabLabel(label);
  return fromLabel || null;
}

function activateRequestedTab() {
  const requested = requestedTab();
  if (!requested) return;

  const tabs = Array.from(document.querySelectorAll<HTMLElement>('[role="tab"]'));
  const tab = tabs.find((candidate) => tabKey(candidate) === requested);
  if (!tab) return;

  const selected = tab.getAttribute("aria-selected") === "true" || tab.getAttribute("data-state") === "active";
  if (!selected) tab.click();
}

function scheduleTabActivation() {
  window.setTimeout(activateRequestedTab, 0);
  window.setTimeout(activateRequestedTab, 80);
  window.setTimeout(activateRequestedTab, 240);
}

function persistCurrentTab(tab: HTMLElement) {
  const key = tabKey(tab);
  if (!key) return;

  const url = new URL(window.location.href);
  if (url.searchParams.get(TAB_PARAM) === key) return;
  url.searchParams.set(TAB_PARAM, key);
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

export function initContextualNavigation() {
  if (typeof window === "undefined" || typeof document === "undefined") return () => undefined;

  const onClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const tab = target.closest<HTMLElement>('[role="tab"]');
    if (tab) {
      window.setTimeout(() => persistCurrentTab(tab), 0);
      return;
    }

    const anchor = target.closest<HTMLAnchorElement>("a[href]");
    if (!anchor) return;

    let url: URL;
    try {
      url = new URL(anchor.href, window.location.href);
    } catch {
      return;
    }

    const isSameOrigin = url.origin === window.location.origin;
    const isDownload = anchor.hasAttribute("download") || url.pathname.startsWith("/api/");

    // Internal application navigation stays in the current browser tab. Explicit
    // downloads/API document previews keep their native behaviour.
    if (isSameOrigin && !isDownload && anchor.target === "_blank" && !isModifiedClick(event)) {
      anchor.target = "_self";
    }

    if (isSameOrigin && url.searchParams.has(TAB_PARAM)) {
      scheduleTabActivation();
    }
  };

  const observer = new MutationObserver(() => {
    if (requestedTab()) scheduleTabActivation();
  });

  document.addEventListener("click", onClick, true);
  window.addEventListener("popstate", scheduleTabActivation);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  scheduleTabActivation();

  return () => {
    document.removeEventListener("click", onClick, true);
    window.removeEventListener("popstate", scheduleTabActivation);
    observer.disconnect();
  };
}
