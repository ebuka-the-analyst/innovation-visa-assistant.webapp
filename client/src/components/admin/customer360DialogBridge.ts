const ROOT_ID = "customer-360-admin-enhancer-root";
const ACCOUNT_VIEW_PATTERN = /Account View\s+—/i;

function findAccountDialog(): HTMLElement | null {
  return (
    Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]')).find((dialog) =>
      ACCOUNT_VIEW_PATTERN.test(dialog.textContent || ""),
    ) || null
  );
}

function attachRootToDialog() {
  const dialog = findAccountDialog();
  const root = document.getElementById(ROOT_ID);
  if (!dialog || !root || root.parentElement === dialog) return;

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
