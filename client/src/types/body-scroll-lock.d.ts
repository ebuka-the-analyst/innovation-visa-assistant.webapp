declare module 'body-scroll-lock' {
  export interface BodyScrollOptions {
    reserveScrollBarGap?: boolean;
    allowTouchMove?: (el: HTMLElement | Element) => boolean;
  }

  export function disableBodyScroll(
    targetElement: HTMLElement | Element,
    options?: BodyScrollOptions
  ): void;

  export function enableBodyScroll(targetElement: HTMLElement | Element): void;

  export function clearAllBodyScrollLocks(): void;
}
