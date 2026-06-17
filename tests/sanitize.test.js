import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sanitizeHTML,
  escapeHTML,
  sanitizeNumber,
  sanitizeString,
  sanitizeEmail,
  sanitizeURL,
  sanitizeObject
} from '../src/js/utils/sanitize.js';

// Mock DOMPurify as we might not have it in vitest by default,
// or we can test the fallback if it's missing.
vi.mock('dompurify', () => {
  return {
    default: {
      sanitize: vi.fn((str, config) => {
        // Simple mock behavior: strip script tags
        return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      })
    }
  };
});

describe('Sanitize Utilities', () => {
  describe('sanitizeHTML', () => {
    it('should sanitize HTML strings', () => {
      const dirty = '<script>alert("xss")</script><b>Hello</b>';
      const clean = sanitizeHTML(dirty);
      expect(clean).toBe('<b>Hello</b>');
    });

    it('should handle non-strings gracefully', () => {
      expect(sanitizeHTML(null)).toBe('');
      expect(sanitizeHTML(42)).toBe('');
      expect(sanitizeHTML({})).toBe('');
    });
  });

  describe('escapeHTML', () => {
    it('should escape HTML entities', () => {
      const text = '<script>alert("xss")</script>';
      const escaped = escapeHTML(text);
      expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('should handle non-strings', () => {
      expect(escapeHTML(undefined)).toBe('');
      expect(escapeHTML(100)).toBe('');
    });
  });

  describe('sanitizeNumber', () => {
    it('should parse strings to numbers', () => {
      expect(sanitizeNumber('42.5')).toBe(42.5);
    });

    it('should bound numbers between min and max', () => {
      expect(sanitizeNumber(-5, 0, 100)).toBe(0);
      expect(sanitizeNumber(200, 0, 100)).toBe(100);
      expect(sanitizeNumber(50, 0, 100)).toBe(50);
    });

    it('should handle invalid numbers', () => {
      expect(sanitizeNumber('abc', 0, 100, 42)).toBe(42);
      expect(sanitizeNumber(NaN, 0, 100, 42)).toBe(42);
      expect(sanitizeNumber(Infinity, 0, 1000, 0)).toBe(0);
    });
  });

  describe('sanitizeString', () => {
    it('should trim and enforce length limits', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
      expect(sanitizeString('abcdef', { maxLength: 3 })).toBe('abc');
    });

    it('should force alphanumeric when option is set', () => {
      expect(sanitizeString('user_input-123!@#', { alphanumericOnly: true })).toBe('user_input-123');
    });

    it('should convert to lowercase', () => {
      expect(sanitizeString('HELLO', { lowercase: true })).toBe('hello');
    });

    it('should handle non-strings', () => {
      expect(sanitizeString(123)).toBe('123');
      expect(sanitizeString(null, { defaultValue: 'def' })).toBe('def');
    });
  });

  describe('sanitizeEmail', () => {
    it('should sanitize valid emails', () => {
      expect(sanitizeEmail('  USER@Example.COM  ')).toBe('user@example.com');
    });

    it('should reject invalid emails', () => {
      expect(sanitizeEmail('not-an-email')).toBe('');
      expect(sanitizeEmail('user@')).toBe('');
      expect(sanitizeEmail(null)).toBe('');
    });
  });

  describe('sanitizeURL', () => {
    it('should accept valid HTTP/HTTPS URLs', () => {
      expect(sanitizeURL('https://example.com')).toBe('https://example.com/');
    });

    it('should reject malicious protocols', () => {
      expect(sanitizeURL('javascript:alert(1)')).toBe('');
      expect(sanitizeURL('data:text/html,test')).toBe('');
    });

    it('should reject invalid URLs', () => {
      expect(sanitizeURL('not-a-url')).toBe('');
      expect(sanitizeURL(null)).toBe('');
    });
  });

  describe('sanitizeObject', () => {
    it('should deep escape strings in objects', () => {
      const obj = {
        name: '<script>alert(1)</script>',
        count: 5,
        nested: {
          text: 'a & b'
        },
        arr: ['<img src=x>']
      };

      const sanitized = sanitizeObject(obj);
      
      expect(sanitized.name).toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;');
      expect(sanitized.count).toBe(5);
      expect(sanitized.nested.text).toBe('a &amp; b');
      expect(sanitized.arr[0]).toBe('&lt;img src=x&gt;');
    });

    it('should prevent stack overflow via maxDepth', () => {
      const deeplyNested = { a: { b: { c: { d: 'val' } } } };
      const res = sanitizeObject(deeplyNested, 2);
      // It stops recursing after depth 2, returning the original object at that level
      expect(res.a.b).toEqual({ c: { d: 'val' } });
    });
  });
});
