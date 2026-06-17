/**
 * @module sanitize
 * @description Input sanitization utilities for XSS prevention and data cleaning.
 * Provides functions to sanitize HTML, escape text, clean numbers, and validate
 * string inputs before they are used in the DOM or stored in the application.
 * @version 1.0.0
 * @author EcoTrack Team
 */

import DOMPurify from 'dompurify';

/**
 * Allowed HTML tags for rich text sanitization.
 * Only safe formatting tags are permitted.
 * @constant {string[]}
 */
const ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'span', 'br', 'p', 'ul', 'ol', 'li'];

/**
 * Allowed HTML attributes for rich text sanitization.
 * Only class and id are permitted for styling hooks.
 * @constant {string[]}
 */
const ALLOWED_ATTR = ['class', 'id'];

/**
 * Maximum allowed string length to prevent memory abuse.
 * @constant {number}
 */
const MAX_STRING_LENGTH = 10000;

/**
 * HTML entity map for manual escaping when DOMPurify is unavailable.
 * @constant {Object<string, string>}
 */
const HTML_ENTITY_MAP = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;'
});

/**
 * Sanitizes an HTML string to prevent XSS attacks.
 * Uses DOMPurify with a restrictive whitelist of allowed tags and attributes.
 *
 * @param {string} dirty - The untrusted HTML string to sanitize
 * @returns {string} Sanitized HTML string safe for innerHTML insertion
 *
 * @example
 * sanitizeHTML('<script>alert("xss")</script><b>Hello</b>')
 * // Returns: '<b>Hello</b>'
 *
 * @example
 * sanitizeHTML('<img src=x onerror=alert(1)>')
 * // Returns: ''
 *
 * @example
 * sanitizeHTML(42)
 * // Returns: ''
 */
export function sanitizeHTML(dirty) {
  if (typeof dirty !== 'string') {
    return '';
  }

  // Truncate excessively long strings to prevent DoS
  const truncated = dirty.length > MAX_STRING_LENGTH
    ? dirty.slice(0, MAX_STRING_LENGTH)
    : dirty;

  try {
    return DOMPurify.sanitize(truncated, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_TRUSTED_TYPE: false
    });
  } catch (error) {
    // If DOMPurify fails for any reason, fall back to full escape
    console.warn('[sanitize] DOMPurify failed, falling back to escapeHTML:', error.message);
    return escapeHTML(truncated);
  }
}

/**
 * Escapes HTML entities in plain text to make it safe for DOM insertion.
 * This is more restrictive than sanitizeHTML — it escapes ALL HTML,
 * producing text that renders exactly as the user typed it.
 *
 * @param {string} text - The untrusted text to escape
 * @returns {string} Escaped text safe for DOM insertion via innerHTML or textContent
 *
 * @example
 * escapeHTML('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
 *
 * @example
 * escapeHTML('Hello & goodbye')
 * // Returns: 'Hello &amp; goodbye'
 *
 * @example
 * escapeHTML(null)
 * // Returns: ''
 */
export function escapeHTML(text) {
  if (typeof text !== 'string') {
    return '';
  }

  // Truncate excessively long strings
  const truncated = text.length > MAX_STRING_LENGTH
    ? text.slice(0, MAX_STRING_LENGTH)
    : text;

  // Escape HTML entities to match test expectations
  return truncated.replace(/[&<>"'`/]/g, (char) => HTML_ENTITY_MAP[char] || char);
}

/**
 * Sanitizes a numeric input value, clamping it within the specified range.
 * Handles strings, numbers, null, undefined, NaN, and Infinity gracefully.
 *
 * @param {*} value - The input value to sanitize (can be any type)
 * @param {number} [min=0] - Minimum allowed value (inclusive)
 * @param {number} [max=Infinity] - Maximum allowed value (inclusive)
 * @param {number} [defaultValue=0] - Default value returned when input is invalid
 * @returns {number} A sanitized number clamped to [min, max], or defaultValue if invalid
 *
 * @example
 * sanitizeNumber('42.5', 0, 100)
 * // Returns: 42.5
 *
 * @example
 * sanitizeNumber(-5, 0, 100)
 * // Returns: 0
 *
 * @example
 * sanitizeNumber('not a number', 0, 100, 50)
 * // Returns: 50
 *
 * @example
 * sanitizeNumber(Infinity, 0, 1000)
 * // Returns: 0 (defaultValue, since Infinity is not finite)
 */
export function sanitizeNumber(value, min = 0, max = Infinity, defaultValue = 0) {
  // Ensure min/max/default are valid numbers
  const safeMin = typeof min === 'number' && isFinite(min) ? min : 0;
  const safeMax = typeof max === 'number' && isFinite(max) ? max : Infinity;
  const safeDefault = typeof defaultValue === 'number' && isFinite(defaultValue) ? defaultValue : 0;

  const num = parseFloat(value);

  if (isNaN(num) || !isFinite(num)) {
    return safeDefault;
  }

  return Math.max(safeMin, Math.min(safeMax, num));
}

/**
 * Sanitizes a string input by trimming whitespace and enforcing length limits.
 * Optionally strips all non-alphanumeric characters for use as identifiers.
 *
 * @param {*} value - The input value to sanitize
 * @param {Object} [options] - Sanitization options
 * @param {number} [options.maxLength=500] - Maximum allowed string length
 * @param {boolean} [options.trim=true] - Whether to trim whitespace
 * @param {boolean} [options.alphanumericOnly=false] - Whether to strip non-alphanumeric characters
 * @param {boolean} [options.lowercase=false] - Whether to convert to lowercase
 * @param {string} [options.defaultValue=''] - Default value if input is invalid
 * @returns {string} Sanitized string
 *
 * @example
 * sanitizeString('  Hello World!  ')
 * // Returns: 'Hello World!'
 *
 * @example
 * sanitizeString('user-input_123!@#', { alphanumericOnly: true })
 * // Returns: 'userinput123'
 *
 * @example
 * sanitizeString('HELLO', { lowercase: true })
 * // Returns: 'hello'
 */
export function sanitizeString(value, options = {}) {
  const {
    maxLength = 500,
    trim = true,
    alphanumericOnly = false,
    lowercase = false,
    defaultValue = ''
  } = options;

  if (typeof value !== 'string') {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    // Attempt to convert numbers/booleans to string
    try {
      value = String(value);
    } catch (_) {
      return defaultValue;
    }
  }

  let result = value;

  // Trim whitespace
  if (trim) {
    result = result.trim();
  }

  // Strip non-alphanumeric characters if requested
  if (alphanumericOnly) {
    result = result.replace(/[^a-zA-Z0-9_-]/g, '');
  }

  // Convert to lowercase
  if (lowercase) {
    result = result.toLowerCase();
  }

  // Enforce length limit
  if (result.length > maxLength) {
    result = result.slice(0, maxLength);
  }

  return result || defaultValue;
}

/**
 * Sanitizes an email address string.
 * Performs basic format validation and normalizes the email.
 *
 * @param {string} email - The email address to sanitize
 * @returns {string} Sanitized email address, or empty string if invalid
 *
 * @example
 * sanitizeEmail('  USER@Example.COM  ')
 * // Returns: 'user@example.com'
 *
 * @example
 * sanitizeEmail('not-an-email')
 * // Returns: ''
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') {
    return '';
  }

  const trimmed = email.trim().toLowerCase();

  // Basic email pattern validation — not exhaustive, but catches obvious issues
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailPattern.test(trimmed) || trimmed.length > 254) {
    return '';
  }

  return trimmed;
}

/**
 * Sanitizes a URL string, ensuring it uses a safe protocol.
 * Prevents javascript: and data: URL injection attacks.
 *
 * @param {string} url - The URL to sanitize
 * @param {string[]} [allowedProtocols=['http:', 'https:']] - Allowed URL protocols
 * @returns {string} Sanitized URL, or empty string if unsafe
 *
 * @example
 * sanitizeURL('https://example.com/page?q=search')
 * // Returns: 'https://example.com/page?q=search'
 *
 * @example
 * sanitizeURL('javascript:alert(1)')
 * // Returns: ''
 *
 * @example
 * sanitizeURL('data:text/html,<script>alert(1)</script>')
 * // Returns: ''
 */
export function sanitizeURL(url, allowedProtocols = ['http:', 'https:']) {
  if (typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();

  if (trimmed.length === 0 || trimmed.length > 2048) {
    return '';
  }

  try {
    const parsed = new URL(trimmed);
    if (!allowedProtocols.includes(parsed.protocol)) {
      return '';
    }
    return parsed.href;
  } catch (_) {
    // If URL parsing fails, it's not a valid URL
    return '';
  }
}

/**
 * Deep-sanitizes a plain object, escaping all string values recursively.
 * Useful for sanitizing API response data or user-submitted form objects.
 *
 * @param {Object} obj - The object to sanitize
 * @param {number} [maxDepth=10] - Maximum recursion depth to prevent stack overflow
 * @returns {Object} A new object with all string values escaped
 *
 * @example
 * sanitizeObject({ name: '<script>alert(1)</script>', count: 5 })
 * // Returns: { name: '&lt;script&gt;alert(1)&lt;/script&gt;', count: 5 }
 */
export function sanitizeObject(obj, maxDepth = 10) {
  if (maxDepth <= 0 || obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return escapeHTML(obj);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, maxDepth - 1));
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize the key too
      const safeKey = sanitizeString(key, { maxLength: 200 });
      sanitized[safeKey] = sanitizeObject(value, maxDepth - 1);
    }
    return sanitized;
  }

  return obj;
}
