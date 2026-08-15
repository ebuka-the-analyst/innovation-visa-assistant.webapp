const ROOT_ID = "customer-360-admin-enhancer-root";
const ACCOUNT_VIEW_PATTERN = /Account View\s+—/i;

function findAccountDialog(): HTMLElement | null {
  return (
    Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]')).find((dialog) =>
      ACCOUNT_VIEW_PATTERN.test(dialog.textContent || ""),
    ) || null
  );
}

function ensureAccountTitleSeparator(dialog: HTMLElement) {
  const labelledBy = dialog.getAttribute("aria-labelledby");
  const labelledTitle = labelledBy ? document.getElementById(labelledBy) : null;

  const title =
    labelledTitle &&
    dialog.contains(labelledTitle) &&
    ACCOUNT_VIEW_PATTERN.test(labelledTitle.textContent || "")
      ? labelledTitle
      : Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'h1, h2, h3, h4, [data-slot="dialog-title"]',
          ),
        ).find((element) => ACCOUNT_VIEW_PATTERN.test(element.textContent || ""));

  if (!title) return;

  // Dialog textContent concatenates sibling elements without inserting spaces.
  // Customer360Enhancer reads the Account View email from that text. Without a
  // boundary, "user@gmail.com" + "Read-only support view" becomes
  // "user@gmail.comRead-only..." and the email regex sees "comRead" as the TLD.
  // A trailing text-node space is visually inert but creates a safe boundary.
  if (!/\s$/.test(title.textContent || "")) {
    title.appendChild(document.createTextNode(" "));
  }
}

function attachRootToDialog() {
  const dialog = findAccountDialog();
  if (!dialog) return;

  ensureAccountTitleSeparator(dialog);

  const root = document.getElementById(ROOT_ID);
  if (!root || root.parentElement === dialog) return;

  // Radix Dialog treats DOM outside DialogContent as an outside interaction.
  // Keep the Customer 360 root inside the existing DialogContent so pointer,
  // focus-trap and keyboard behaviour remain part of the same modal layer.
  dialog.appendChild(root);

  // The existing dialog is visually hidden by Customer360Enhancer. Visibility
  // can be explicitly restored for this child while keeping the old UI hidden.
  root.style.setProperty("visibility", "visible", "important");
  root.style.setProperty("pointer-events", "auto", "important");

  // Radix centres DialogContent with a transform. A transformed ancestor would
  // make the Customer 360 fixed overlay use the dialog as its containing block.
  // Inline transform:none lets the fixed overlay remain viewport-sized.
  dialog.style.setProperty("transform", "none", "important");
}

function recoverRootFromRemovedNodes(records: MutationRecord[]) {
  for (const record of records) {
    for (const node of Array.from(record.removedNodes)) {
      if (!(node instanceof HTMLElement)) continue;

      const removedRoot =
        node.id === ROOT_ID ? node : node.querySelector<HTMLElement>(`#${ROOT_ID}`);

      if (removedRoot && !removedRoot.isConnected) {
        document.body.appendChild(removedRoot);
        removedRoot.style.setProperty("visibility", "visible", "important");
        removedRoot.style.setProperty("pointer-events", "auto", "important");
      }
    }
  }
}

export function initCustomer360DialogBridge() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const stateWindow = window as any;
  if (stateWindow.__customer360DialogBridgeStarted) return;
  stateWindow.__customer360DialogBridgeStarted = true;

  const observer = new MutationObserver((records) => {
    recoverRootFromRemovedNodes(records);
    attachRootToDialog();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  attachRootToDialog();
}
