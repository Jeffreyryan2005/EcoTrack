import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SecureStorage } from '../src/js/utils/storage.js';

// Mock localStorage globally
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn(i => Object.keys(store)[i] || null)
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
});

describe('SecureStorage', () => {
  let storage;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    storage = new SecureStorage({ prefix: 'test', version: 1, enableIntegrity: true });
  });

  describe('Availability & Fallback', () => {
    it('should use localStorage when available', () => {
      expect(storage._isAvailable).toBe(true);
      storage.set('key1', 'value1');
      expect(localStorage.setItem).toHaveBeenCalled();
      expect(storage.get('key1')).toBe('value1');
    });

    it('should use memory fallback when localStorage is unavailable', () => {
      // Simulate localStorage failure
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => { throw new Error('QuotaExceededError'); });
      
      const fallbackStorage = new SecureStorage({ prefix: 'fb', version: 1 });
      // Since availability check throws, _isAvailable becomes false
      expect(fallbackStorage._isAvailable).toBe(false);
      
      fallbackStorage.set('fbKey', 'fbValue');
      expect(fallbackStorage.get('fbKey')).toBe('fbValue');
      
      // Restore
      localStorage.setItem = originalSetItem;
    });
  });

  describe('get and set', () => {
    it('should store and retrieve simple values', () => {
      storage.set('num', 42);
      expect(storage.get('num')).toBe(42);
      
      storage.set('str', 'hello');
      expect(storage.get('str')).toBe('hello');
      
      storage.set('bool', true);
      expect(storage.get('bool')).toBe(true);
    });

    it('should store and retrieve objects/arrays', () => {
      const obj = { a: 1, b: [2, 3] };
      storage.set('obj', obj);
      expect(storage.get('obj')).toEqual(obj);
    });

    it('should return defaultValue if key not found', () => {
      expect(storage.get('missing', 'default')).toBe('default');
    });

    it('should return null if key not found and no default provided', () => {
      expect(storage.get('missing')).toBeNull();
    });

    it('should handle invalid keys gracefully', () => {
      expect(storage.set('', 123)).toBe(false);
      expect(storage.get('', 'def')).toBe('def');
    });
  });

  describe('Integrity & Parsing', () => {
    it('should detect data corruption', () => {
      storage.set('data', { valid: true });
      
      // Tamper with the raw storage data directly
      const fullKey = storage._getFullKey('data');
      const raw = localStorage.getItem(fullKey);
      const parsed = JSON.parse(raw);
      parsed.data.valid = false; // tamper
      localStorage.setItem(fullKey, JSON.stringify(parsed));
      
      // Now fetching it should fail integrity check and return default
      expect(storage.get('data')).toBeNull();
    });
    
    it('should handle legacy (unenveloped) data gracefully', () => {
      const fullKey = storage._getFullKey('legacy');
      localStorage.setItem(fullKey, JSON.stringify("plain value"));
      
      expect(storage.get('legacy')).toBe("plain value");
    });
  });

  describe('remove and has', () => {
    it('should check existence correctly', () => {
      expect(storage.has('item')).toBe(false);
      storage.set('item', 123);
      expect(storage.has('item')).toBe(true);
    });

    it('should remove items correctly', () => {
      storage.set('item', 123);
      storage.remove('item');
      expect(storage.has('item')).toBe(false);
      expect(storage.get('item')).toBeNull();
    });
  });

  describe('clear and getAll', () => {
    it('should only clear items with the same prefix', () => {
      storage.set('k1', 'v1');
      storage.set('k2', 'v2');
      
      // Add an item from outside the namespace
      localStorage.setItem('other_app_key', 'should remain');
      
      storage.clear();
      expect(storage.has('k1')).toBe(false);
      expect(storage.has('k2')).toBe(false);
      expect(localStorage.getItem('other_app_key')).toBe('should remain');
    });

    it('should getAll key-value pairs', () => {
      storage.set('k1', 'v1');
      storage.set('k2', 2);
      
      expect(storage.getAll()).toEqual({ k1: 'v1', k2: 2 });
    });
  });

  describe('keys and Stats', () => {
    it('should return all user keys', () => {
      storage.set('a', 1);
      storage.set('b', 2);
      
      expect(storage.keys().sort()).toEqual(['a', 'b']);
    });

    it('should calculate stats correctly', () => {
      storage.set('x', 'value');
      const stats = storage.getStats();
      
      expect(stats.itemCount).toBe(1);
      expect(stats.usedBytes).toBeGreaterThan(0);
      expect(stats.maxBytes).toBe(5 * 1024 * 1024);
    });
  });

  describe('Metadata and TTL', () => {
    it('should return metadata', () => {
      storage.set('data', 'val');
      const meta = storage.getMetadata('data');
      expect(meta.timestamp).toBeGreaterThan(0);
      expect(meta.version).toBe(1);
    });

    it('should handle TTL correctly', async () => {
      storage.setWithTTL('temp', 'value', 100); // 100ms TTL
      
      expect(storage.getWithTTL('temp')).toBe('value');
      
      // Mock Date.now to simulate time passing
      const originalNow = Date.now;
      Date.now = vi.fn(() => originalNow() + 150);
      
      // Should expire
      expect(storage.getWithTTL('temp', 'expired')).toBe('expired');
      expect(storage.has('temp')).toBe(false); // Key is removed
      
      Date.now = originalNow;
    });
  });

  describe('Migration', () => {
    it('should migrate old data format to new format', () => {
      const v1Storage = new SecureStorage({ prefix: 'app', version: 1, enableIntegrity: false });
      v1Storage.set('user', { n: 'Bob' });
      
      const v2Storage = new SecureStorage({ prefix: 'app', version: 2 });
      
      const results = v2Storage.migrate(1, (key, oldData) => {
        if (key === 'user') {
          return { name: oldData.n }; // Transform
        }
      });
      
      expect(results.migrated).toBe(1);
      expect(v2Storage.get('user')).toEqual({ name: 'Bob' });
      expect(v1Storage.has('user')).toBe(false); // Old key should be deleted
    });
  });
});
