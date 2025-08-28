
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom';

class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}

Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserver,
});

Object.defineProperty(global, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserver,
});

// If your runner doesn't define PointerEvent, add a minimal shim
if (typeof window.PointerEvent === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    class PointerEvent extends MouseEvent { }
    // @ts-expect-error allow assign
    window.PointerEvent = PointerEvent as unknown as typeof window.PointerEvent;
}

// JSDOM lacks these Element methods used by Radix
for (const method of ['hasPointerCapture', 'setPointerCapture', 'releasePointerCapture'] as const) {
    if (!(method in Element.prototype)) {
        Object.defineProperty(Element.prototype, method, {
            value: () => { },
            writable: true,
            configurable: true,
        });
    }
}

if (!('scrollIntoView' in Element.prototype)) {
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
        value: () => { }, // noop
        writable: true,
        configurable: true,
    });
}

// (Optional) if something references HTMLElement specifically:
if (!('scrollIntoView' in HTMLElement.prototype)) {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
        value: () => { },
        writable: true,
        configurable: true,
    });
}