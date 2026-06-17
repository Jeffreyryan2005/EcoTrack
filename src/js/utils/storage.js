/**
 * @module storage
 * @description Secure localStorage wrapper for the EcoTrack application.
 * Provides namespaced, versioned, size-limited storage with JSON serialization,
 * data integrity validation via checksums, and comprehensive error handling
 * that never throws to the caller.
 * @version 1.0.0
 * @author EcoTrack Team
 */

/**
 * Default configuration for SecureStorage instances.
 * @constant {Object}
 */
const DEFAULT_CONFIG = Object.freeze({
  prefix: 'ecotrack',
  version: 1,
  maxSizeBytes: 5 * 1024 * 1024, // 5MB — typical localStorage limit
  maxItemSizeBytes: 1 * 1024 * 1024, // 1MB per item
  enableIntegrity: true,
  enableCompression: false
});

/**
 * Simple checksum for data integrity verification.
 * Uses a fast DJB2-like hash to detect data corruption.
 *
 * @param {string} str - The string to hash
 * @returns {string} Hex checksum string
 * @private
 */
function computeChecksum(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xFFFFFFFF;
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Estimates the byte size of a string in UTF-16 encoding (how JS stores strings).
 *
 * @param {string} str - The string to measure
 * @returns {number} Estimated byte size
 * @private
 */
function estimateByteSize(str) {
  if (typeof str !== 'string') return 0;
  // Each char in JS is 2 bytes (UTF-16), but localStorage implementations vary.
  // Use a conservative Blob-based measurement when available.
  try {
    return new Blob([str]).size;
  } catch (_) {
    return str.length * 2;
  }
}

/**
 * A secure, namespaced localStorage wrapper with JSON serialization,
 * data integrity validation, versioning support, and graceful error handling.
 *
 * @class SecureStorage
 *
 * @example
 * const storage = new SecureStorage({ prefix: 'myapp', version: 2 });
 * storage.set('user', { name: 'Alice', score: 100 });
 * const user = storage.get('user');
 * console.log(user); // { name: 'Alice', score: 100 }
 */
export class SecureStorage {
  /**
   * Creates a new SecureStorage instance.
   *
   * @param {Object} [config] - Configuration options
   * @param {string} [config.prefix='ecotrack'] - Namespace prefix for all keys
   * @param {number} [config.version=1] - Schema version for migration support
   * @param {number} [config.maxSizeBytes=5242880] - Maximum total storage size (5MB default)
   * @param {number} [config.maxItemSizeBytes=1048576] - Maximum size per item (1MB default)
   * @param {boolean} [config.enableIntegrity=true] - Enable checksum-based integrity checking
   */
  constructor(config = {}) {
    /** @type {Object} Merged configuration */
    this._config = { ...DEFAULT_CONFIG, ...config };

    /** @type {string} Key prefix including version */
    this._prefix = `${this._config.prefix}_v${this._config.version}_`;

    /** @type {boolean} Whether localStorage is available */
    this._isAvailable = this._checkAvailability();

    if (!this._isAvailable) {
      console.warn('[SecureStorage] localStorage is not available. Using in-memory fallback.');
      /** @type {Map<string, string>} In-memory fallback store */
      this._fallbackStore = new Map();
    }
  }

  /**
   * Checks whether localStorage is available and writable.
   *
   * @returns {boolean} True if localStorage is available
   * @private
   */
  _checkAvailability() {
    try {
      const testKey = '__ecotrack_storage_test__';
      localStorage.setItem(testKey, 'test');
      const result = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      return result === 'test';
    } catch (_) {
      return false;
    }
  }

  /**
   * Generates the full prefixed key for storage.
   *
   * @param {string} key - The user-facing key
   * @returns {string} The full namespaced key
   * @private
   */
  _getFullKey(key) {
    return `${this._prefix}${key}`;
  }

  /**
   * Wraps a value in a storage envelope with metadata and optional integrity checksum.
   *
   * @param {*} value - The value to wrap
   * @returns {string} JSON string of the envelope
   * @private
   */
  _createEnvelope(value) {
    const dataStr = JSON.stringify(value);
    const envelope = {
      data: value,
      timestamp: Date.now(),
      version: this._config.version
    };

    if (this._config.enableIntegrity) {
      envelope.checksum = computeChecksum(dataStr);
    }

    return JSON.stringify(envelope);
  }

  /**
   * Unwraps a storage envelope, validating integrity if enabled.
   *
   * @param {string} raw - The raw JSON string from storage
   * @returns {{ valid: boolean, data: *, timestamp: number|null, version: number|null }} Parsed result
   * @private
   */
  _parseEnvelope(raw) {
    const invalid = { valid: false, data: null, timestamp: null, version: null };

    if (typeof raw !== 'string' || raw.length === 0) {
      return invalid;
    }

    try {
      const envelope = JSON.parse(raw);

      // Validate envelope structure
      if (envelope === null || typeof envelope !== 'object' || !('data' in envelope)) {
        // It might be a legacy value stored without an envelope
        return { valid: true, data: envelope, timestamp: null, version: null };
      }

      // Validate integrity checksum if enabled
      if (this._config.enableIntegrity && envelope.checksum) {
        const dataStr = JSON.stringify(envelope.data);
        const expectedChecksum = computeChecksum(dataStr);
        if (envelope.checksum !== expectedChecksum) {
          console.warn('[SecureStorage] Data integrity check failed. Data may be corrupted.');
          return invalid;
        }
      }

      return {
        valid: true,
        data: envelope.data,
        timestamp: envelope.timestamp || null,
        version: envelope.version || null
      };
    } catch (error) {
      console.warn('[SecureStorage] Failed to parse stored data:', error.message);
      return invalid;
    }
  }

  /**
   * Low-level read from the underlying storage mechanism.
   *
   * @param {string} fullKey - The full namespaced key
   * @returns {string|null} Raw stored value or null
   * @private
   */
  _rawGet(fullKey) {
    if (this._isAvailable) {
      return localStorage.getItem(fullKey);
    }
    return this._fallbackStore.get(fullKey) || null;
  }

  /**
   * Low-level write to the underlying storage mechanism.
   *
   * @param {string} fullKey - The full namespaced key
   * @param {string} value - The value to store
   * @returns {boolean} True if write succeeded
   * @private
   */
  _rawSet(fullKey, value) {
    try {
      if (this._isAvailable) {
        localStorage.setItem(fullKey, value);
      } else {
        this._fallbackStore.set(fullKey, value);
      }
      return true;
    } catch (error) {
      // QuotaExceededError is the most common failure
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        console.error('[SecureStorage] Storage quota exceeded.');
      } else {
        console.error('[SecureStorage] Failed to write to storage:', error.message);
      }
      return false;
    }
  }

  /**
   * Low-level delete from the underlying storage mechanism.
   *
   * @param {string} fullKey - The full namespaced key
   * @returns {boolean} True if deletion succeeded
   * @private
   */
  _rawRemove(fullKey) {
    try {
      if (this._isAvailable) {
        localStorage.removeItem(fullKey);
      } else {
        this._fallbackStore.delete(fullKey);
      }
      return true;
    } catch (error) {
      console.error('[SecureStorage] Failed to remove from storage:', error.message);
      return false;
    }
  }

  /**
   * Retrieves a value from storage by key.
   *
   * @param {string} key - The key to retrieve
   * @param {*} [defaultValue=null] - Value to return if key doesn't exist or data is invalid
   * @returns {*} The stored value, or defaultValue if not found/invalid
   *
   * @example
   * const theme = storage.get('theme', 'light');
   * // Returns stored theme or 'light' if not found
   */
  get(key, defaultValue = null) {
    try {
      if (typeof key !== 'string' || key.length === 0) {
        console.warn('[SecureStorage] Invalid key provided to get()');
        return defaultValue;
      }

      const fullKey = this._getFullKey(key);
      const raw = this._rawGet(fullKey);

      if (raw === null) {
        return defaultValue;
      }

      const result = this._parseEnvelope(raw);
      return result.valid ? result.data : defaultValue;
    } catch (error) {
      console.error('[SecureStorage] Unexpected error in get():', error.message);
      return defaultValue;
    }
  }

  /**
   * Stores a value in storage with the given key.
   *
   * @param {string} key - The key under which to store the value
   * @param {*} value - The value to store (must be JSON-serializable)
   * @returns {boolean} True if the value was stored successfully
   *
   * @example
   * const success = storage.set('emissions', [{ type: 'car', km: 50 }]);
   * if (!success) console.log('Failed to save data');
   */
  set(key, value) {
    try {
      if (typeof key !== 'string' || key.length === 0) {
        console.warn('[SecureStorage] Invalid key provided to set()');
        return false;
      }

      // Create the envelope
      const envelope = this._createEnvelope(value);

      // Check item size limit
      const itemSize = estimateByteSize(envelope);
      if (itemSize > this._config.maxItemSizeBytes) {
        console.warn(
          `[SecureStorage] Item size (${itemSize} bytes) exceeds limit (${this._config.maxItemSizeBytes} bytes)`
        );
        return false;
      }

      // Check total storage size
      const currentSize = this.getUsedSize();
      if (currentSize + itemSize > this._config.maxSizeBytes) {
        console.warn(
          `[SecureStorage] Total storage would exceed limit (${this._config.maxSizeBytes} bytes)`
        );
        return false;
      }

      const fullKey = this._getFullKey(key);
      return this._rawSet(fullKey, envelope);
    } catch (error) {
      console.error('[SecureStorage] Unexpected error in set():', error.message);
      return false;
    }
  }

  /**
   * Removes a value from storage by key.
   *
   * @param {string} key - The key to remove
   * @returns {boolean} True if the removal succeeded
   *
   * @example
   * storage.remove('oldData');
   */
  remove(key) {
    try {
      if (typeof key !== 'string' || key.length === 0) {
        console.warn('[SecureStorage] Invalid key provided to remove()');
        return false;
      }

      const fullKey = this._getFullKey(key);
      return this._rawRemove(fullKey);
    } catch (error) {
      console.error('[SecureStorage] Unexpected error in remove():', error.message);
      return false;
    }
  }

  /**
   * Checks whether a key exists in storage and contains valid data.
   *
   * @param {string} key - The key to check
   * @returns {boolean} True if the key exists and has valid data
   *
   * @example
   * if (storage.has('userProfile')) {
   *   // Load user profile
   * }
   */
  has(key) {
    try {
      if (typeof key !== 'string' || key.length === 0) {
        return false;
      }

      const fullKey = this._getFullKey(key);
      const raw = this._rawGet(fullKey);

      if (raw === null) {
        return false;
      }

      const result = this._parseEnvelope(raw);
      return result.valid;
    } catch (error) {
      console.error('[SecureStorage] Unexpected error in has():', error.message);
      return false;
    }
  }

  /**
   * Removes all keys belonging to this storage instance's namespace.
   * Does not affect keys from other namespaces or applications.
   *
   * @returns {boolean} True if the clear operation succeeded
   *
   * @example
   * storage.clear(); // Only clears EcoTrack data
   */
  clear() {
    try {
      const keys = this._getNamespacedKeys();
      let success = true;

      for (const fullKey of keys) {
        if (!this._rawRemove(fullKey)) {
          success = false;
        }
      }

      return success;
    } catch (error) {
      console.error('[SecureStorage] Unexpected error in clear():', error.message);
      return false;
    }
  }

  /**
   * Retrieves all key-value pairs belonging to this storage namespace.
   *
   * @returns {Object<string, *>} Object with all stored key-value pairs
   *
   * @example
   * const allData = storage.getAll();
   * // { emissions: [...], goals: [...], theme: 'dark' }
   */
  getAll() {
    try {
      const keys = this._getNamespacedKeys();
      const result = {};

      for (const fullKey of keys) {
        const userKey = fullKey.slice(this._prefix.length);
        const raw = this._rawGet(fullKey);

        if (raw !== null) {
          const parsed = this._parseEnvelope(raw);
          if (parsed.valid) {
            result[userKey] = parsed.data;
          }
        }
      }

      return result;
    } catch (error) {
      console.error('[SecureStorage] Unexpected error in getAll():', error.message);
      return {};
    }
  }

  /**
   * Returns all localStorage keys that belong to this namespace.
   *
   * @returns {string[]} Array of full (prefixed) keys
   * @private
   */
  _getNamespacedKeys() {
    const keys = [];

    try {
      if (this._isAvailable) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(this._prefix)) {
            keys.push(key);
          }
        }
      } else {
        for (const key of this._fallbackStore.keys()) {
          if (key.startsWith(this._prefix)) {
            keys.push(key);
          }
        }
      }
    } catch (error) {
      console.error('[SecureStorage] Error enumerating keys:', error.message);
    }

    return keys;
  }

  /**
   * Returns the list of user-facing keys (without prefix) in this namespace.
   *
   * @returns {string[]} Array of key names
   *
   * @example
   * const keys = storage.keys();
   * // ['emissions', 'goals', 'theme']
   */
  keys() {
    try {
      return this._getNamespacedKeys().map((fullKey) => fullKey.slice(this._prefix.length));
    } catch (error) {
      console.error('[SecureStorage] Unexpected error in keys():', error.message);
      return [];
    }
  }

  /**
   * Calculates the total byte size used by this namespace in storage.
   *
   * @returns {number} Used storage size in bytes
   *
   * @example
   * const usedBytes = storage.getUsedSize();
   * console.log(`Using ${(usedBytes / 1024).toFixed(1)} KB`);
   */
  getUsedSize() {
    try {
      let total = 0;
      const keys = this._getNamespacedKeys();

      for (const fullKey of keys) {
        const raw = this._rawGet(fullKey);
        if (raw !== null) {
          total += estimateByteSize(fullKey) + estimateByteSize(raw);
        }
      }

      return total;
    } catch (error) {
      console.error('[SecureStorage] Error calculating size:', error.message);
      return 0;
    }
  }

  /**
   * Returns storage usage statistics for this namespace.
   *
   * @returns {{ usedBytes: number, maxBytes: number, percentUsed: number, itemCount: number }}
   *
   * @example
   * const stats = storage.getStats();
   * console.log(`${stats.percentUsed}% storage used (${stats.itemCount} items)`);
   */
  getStats() {
    try {
      const usedBytes = this.getUsedSize();
      const maxBytes = this._config.maxSizeBytes;
      const keys = this._getNamespacedKeys();

      return {
        usedBytes,
        maxBytes,
        percentUsed: maxBytes > 0 ? parseFloat(((usedBytes / maxBytes) * 100).toFixed(2)) : 0,
        itemCount: keys.length
      };
    } catch (error) {
      console.error('[SecureStorage] Error getting stats:', error.message);
      return { usedBytes: 0, maxBytes: this._config.maxSizeBytes, percentUsed: 0, itemCount: 0 };
    }
  }

  /**
   * Retrieves the metadata (timestamp, version) for a stored item without
   * returning its data. Useful for checking freshness or migration needs.
   *
   * @param {string} key - The key to inspect
   * @returns {{ timestamp: number|null, version: number|null }|null} Metadata or null
   *
   * @example
   * const meta = storage.getMetadata('emissions');
   * if (meta && Date.now() - meta.timestamp > 86400000) {
   *   console.log('Data is stale');
   * }
   */
  getMetadata(key) {
    try {
      if (typeof key !== 'string' || key.length === 0) {
        return null;
      }

      const fullKey = this._getFullKey(key);
      const raw = this._rawGet(fullKey);

      if (raw === null) {
        return null;
      }

      const result = this._parseEnvelope(raw);
      if (!result.valid) {
        return null;
      }

      return {
        timestamp: result.timestamp,
        version: result.version
      };
    } catch (error) {
      console.error('[SecureStorage] Unexpected error in getMetadata():', error.message);
      return null;
    }
  }

  /**
   * Migrates data from an older version of the storage schema to the current one.
   * Accepts a migration function that transforms old data into the new format.
   *
   * @param {number} fromVersion - The version to migrate from
   * @param {Function} migrateFn - Function that takes (key, oldData) and returns new data
   * @returns {{ migrated: number, failed: number, skipped: number }} Migration results
   *
   * @example
   * storage.migrate(1, (key, data) => {
   *   // Transform v1 data to v2 format
   *   return { ...data, unit: data.unit || 'kg' };
   * });
   */
  migrate(fromVersion, migrateFn) {
    const results = { migrated: 0, failed: 0, skipped: 0 };

    try {
      if (typeof fromVersion !== 'number' || typeof migrateFn !== 'function') {
        console.warn('[SecureStorage] Invalid migration parameters');
        return results;
      }

      const oldPrefix = `${this._config.prefix}_v${fromVersion}_`;

      // Find all keys from the old version
      const oldKeys = [];
      if (this._isAvailable) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(oldPrefix)) {
            oldKeys.push(key);
          }
        }
      } else {
        for (const key of this._fallbackStore.keys()) {
          if (key.startsWith(oldPrefix)) {
            oldKeys.push(key);
          }
        }
      }

      for (const oldFullKey of oldKeys) {
        const userKey = oldFullKey.slice(oldPrefix.length);
        const raw = this._rawGet(oldFullKey);

        if (raw === null) {
          results.skipped++;
          continue;
        }

        try {
          const oldParsed = JSON.parse(raw);
          const oldData = oldParsed && typeof oldParsed === 'object' && 'data' in oldParsed
            ? oldParsed.data
            : oldParsed;

          const newData = migrateFn(userKey, oldData);

          if (newData !== undefined) {
            const success = this.set(userKey, newData);
            if (success) {
              this._rawRemove(oldFullKey);
              results.migrated++;
            } else {
              results.failed++;
            }
          } else {
            results.skipped++;
          }
        } catch (error) {
          console.warn(`[SecureStorage] Migration failed for key "${userKey}":`, error.message);
          results.failed++;
        }
      }
    } catch (error) {
      console.error('[SecureStorage] Unexpected error during migration:', error.message);
    }

    return results;
  }

  /**
   * Sets a value with a Time-To-Live (TTL). The value will be considered expired
   * after the TTL duration and get() will return the default value.
   *
   * @param {string} key - The key under which to store the value
   * @param {*} value - The value to store
   * @param {number} ttlMs - Time-to-live in milliseconds
   * @returns {boolean} True if stored successfully
   *
   * @example
   * // Cache API response for 5 minutes
   * storage.setWithTTL('apiCache', responseData, 5 * 60 * 1000);
   */
  setWithTTL(key, value, ttlMs) {
    try {
      if (typeof ttlMs !== 'number' || ttlMs <= 0) {
        console.warn('[SecureStorage] Invalid TTL provided');
        return false;
      }

      const wrappedValue = {
        __ttl: true,
        value,
        expiresAt: Date.now() + ttlMs
      };

      return this.set(key, wrappedValue);
    } catch (error) {
      console.error('[SecureStorage] Unexpected error in setWithTTL():', error.message);
      return false;
    }
  }

  /**
   * Retrieves a value that was stored with setWithTTL. If the TTL has expired,
   * the key is automatically removed and the default value is returned.
   *
   * @param {string} key - The key to retrieve
   * @param {*} [defaultValue=null] - Value to return if expired or not found
   * @returns {*} The stored value, or defaultValue if expired/not found
   *
   * @example
   * const cached = storage.getWithTTL('apiCache');
   * if (cached === null) {
   *   // Re-fetch from API
   * }
   */
  getWithTTL(key, defaultValue = null) {
    try {
      const stored = this.get(key, null);

      if (stored === null) {
        return defaultValue;
      }

      // Check if this is a TTL-wrapped value
      if (stored && typeof stored === 'object' && stored.__ttl === true) {
        if (Date.now() > stored.expiresAt) {
          // Expired — clean up
          this.remove(key);
          return defaultValue;
        }
        return stored.value;
      }

      // Not a TTL value, return as-is
      return stored;
    } catch (error) {
      console.error('[SecureStorage] Unexpected error in getWithTTL():', error.message);
      return defaultValue;
    }
  }
}

/**
 * Default storage instance for the EcoTrack application.
 * @type {SecureStorage}
 */
export const storage = new SecureStorage();
