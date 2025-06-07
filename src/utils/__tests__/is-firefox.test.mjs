import { isFirefox } from '../is-firefox.mjs';

describe('isFirefox', () => {
  let userAgentSpy;
  let initialUserAgent; // To store the original userAgent if it exists

  beforeEach(() => {
    if (typeof global.navigator !== 'object' || global.navigator === null) {
      // If navigator doesn't exist, create a mock one
      global.navigator = {};
    }

    // Store the original userAgent value and its descriptor
    const descriptor = Object.getOwnPropertyDescriptor(global.navigator, 'userAgent');
    if (descriptor) {
      initialUserAgent = descriptor.get ? descriptor.get() : descriptor.value;
    } else {
      initialUserAgent = undefined; // Or some default if navigator.userAgent was never there
    }

    // Ensure userAgent is defined with a getter and setter for spyOn 'get' to work
    let currentAgent = initialUserAgent || ''; // Default to empty string if not present
    Object.defineProperty(global.navigator, 'userAgent', {
      get: () => currentAgent,
      set: (value) => { currentAgent = value; },
      configurable: true,
    });

    userAgentSpy = jest.spyOn(global.navigator, 'userAgent', 'get');
  });

  afterEach(() => {
    userAgentSpy.mockRestore();
    // Restore the original userAgent property definition if necessary
    // This is tricky because the original might not have been a getter/setter
    // For simplicity, if initialUserAgent was undefined, we can delete it.
    // Or, redefine it based on its original state if that's critical.
    // Often, just restoring the spy is enough for isolated tests.
    // If global.navigator.userAgent was originally a value property:
    if (initialUserAgent !== undefined) {
         Object.defineProperty(global.navigator, 'userAgent', {
            value: initialUserAgent,
            configurable: true,
            writable: true, // Assuming it was writable
        });
    } else {
        // If it didn't exist, or to be very clean, delete it
        delete global.navigator.userAgent;
    }
    // If global.navigator itself was created, it might need cleanup too,
    // but that's more involved and depends on test environment expectations.
  });

  test('should return true for Firefox user agent', () => {
    userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0');
    expect(isFirefox()).toBe(true);
  });

  test('should return true for Firefox user agent with mixed case', () => {
    userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:90.0) Gecko/20100101 FireFox/90.0');
    expect(isFirefox()).toBe(true);
  });

  test('should return false for Chrome user agent', () => {
    userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    expect(isFirefox()).toBe(false);
  });

  test('should return false for Safari user agent', () => {
    userAgentSpy.mockReturnValue('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15');
    expect(isFirefox()).toBe(false);
  });

  test('should return false for Edge user agent', () => {
    userAgentSpy.mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59');
    expect(isFirefox()).toBe(false);
  });

  test('should return false for an empty user agent', () => {
    userAgentSpy.mockReturnValue('');
    expect(isFirefox()).toBe(false);
  });

  test('should throw TypeError when userAgent is null', () => {
    userAgentSpy.mockReturnValue(null);
    expect(() => isFirefox()).toThrow(TypeError);
  });

  test('should throw TypeError when userAgent is undefined', () => {
    userAgentSpy.mockReturnValue(undefined);
    expect(() => isFirefox()).toThrow(TypeError);
  });

});
