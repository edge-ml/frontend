import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers.jsx';

// Mock window.matchMedia (needed by ReactHooksService.useMediaQuery)
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}

// jsdom's Blob (through jsdom 26) does not implement the standard async
// readers `arrayBuffer()` and `text()`, which browsers and Node both provide.
// Code under test uses them to read binary downloads and to recover error
// messages from JSON error bodies, so back them with FileReader, which jsdom
// does implement, keeping the standard semantics.
if (typeof Blob !== 'undefined') {
  const readBlob = (blob, method) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader[method](blob);
    });

  if (!Blob.prototype.arrayBuffer) {
    Blob.prototype.arrayBuffer = function () {
      return readBlob(this, 'readAsArrayBuffer');
    };
  }

  if (!Blob.prototype.text) {
    Blob.prototype.text = function () {
      return readBlob(this, 'readAsText');
    };
  }
}

export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});

afterAll(() => {
  server.close();
});
