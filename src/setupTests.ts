import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

// Mock IntersectionObserver
class IntersectionObserverMock {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [];
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

// @ts-ignore
window.IntersectionObserver = IntersectionObserverMock as unknown;

// ---------------------------------------------------------------------------
// Global fetch mock – avoids network calls in unit tests
// ---------------------------------------------------------------------------

// Override global fetch with a mock that returns predictable data
// @ts-ignore
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    systems: [],
    generators: [],
    missions: [],
    shipIdentity: {
      name: 'Test Ship',
      type: 'Test Type',
      imo: 'IMO-TEST',
      flag: 'Testland',
      status: 'in-port',
      currentOperation: 'Testing'
    }
  })
});
