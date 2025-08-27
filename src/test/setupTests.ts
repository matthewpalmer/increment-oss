
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
