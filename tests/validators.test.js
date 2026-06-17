import { describe, it, expect } from 'vitest';
import {
  ValidationResult,
  validateNumber,
  validateCategory,
  validateSubType,
  validateDateRange,
  validateEmissionEntry,
  validateGoal,
  validateString,
  validateEmissionEntries
} from '../src/js/utils/validators.js';

describe('Validators', () => {
  describe('ValidationResult', () => {
    it('should represent success state correctly', () => {
      const res = ValidationResult.success(42, ['Warning msg']);
      expect(res.isValid).toBe(true);
      expect(res.value).toBe(42);
      expect(res.warnings).toEqual(['Warning msg']);
      expect(res.toString()).toContain('Validation passed');
      expect(res.toString()).toContain('1 warning(s)');
    });

    it('should represent failure state correctly', () => {
      const res = ValidationResult.failure('Error msg');
      expect(res.isValid).toBe(false);
      expect(res.errors).toEqual(['Error msg']);
      expect(res.toString()).toContain('Validation failed: Error msg');
    });

    it('should allow chaining errors and warnings', () => {
      const res = new ValidationResult(true, 'val');
      res.addWarning('Warn').addError('Err');
      expect(res.isValid).toBe(false);
      expect(res.warnings).toEqual(['Warn']);
      expect(res.errors).toEqual(['Err']);
    });
  });

  describe('validateNumber', () => {
    it('should validate valid numbers within bounds', () => {
      const res = validateNumber(50, 0, 100);
      expect(res.isValid).toBe(true);
      expect(res.value).toBe(50);
    });

    it('should reject non-numbers', () => {
      expect(validateNumber('abc').isValid).toBe(false);
      expect(validateNumber(NaN).isValid).toBe(false);
    });

    it('should check bounds', () => {
      expect(validateNumber(-10, 0, 100).isValid).toBe(false);
      expect(validateNumber(200, 0, 100).isValid).toBe(false);
    });

    it('should parse valid string numbers', () => {
      const res = validateNumber('42.5');
      expect(res.isValid).toBe(true);
      expect(res.value).toBe(42.5);
    });

    it('should enforce integer requirement', () => {
      expect(validateNumber(42.5, 0, 100, { integer: true }).isValid).toBe(false);
      expect(validateNumber(42, 0, 100, { integer: true }).isValid).toBe(true);
    });

    it('should handle optional requirement', () => {
      expect(validateNumber(null, 0, 100, { required: false }).isValid).toBe(true);
      expect(validateNumber(null, 0, 100, { required: true }).isValid).toBe(false);
    });
  });

  describe('validateCategory and validateSubType', () => {
    it('should validate correct categories', () => {
      expect(validateCategory('transport').isValid).toBe(true);
      expect(validateCategory(' FOOD ').value).toBe('food');
    });

    it('should reject invalid categories', () => {
      expect(validateCategory('magic').isValid).toBe(false);
      expect(validateCategory('').isValid).toBe(false);
      expect(validateCategory(null).isValid).toBe(false);
    });

    it('should validate correct subtypes', () => {
      expect(validateSubType('transport', 'car_petrol').isValid).toBe(true);
      expect(validateSubType('food', 'beef').isValid).toBe(true);
    });

    it('should reject invalid subtypes', () => {
      expect(validateSubType('transport', 'beef').isValid).toBe(false);
      expect(validateSubType('invalidCat', 'car_petrol').isValid).toBe(false);
      expect(validateSubType('transport', '').isValid).toBe(false);
    });
  });

  describe('validateDateRange', () => {
    it('should validate correct date ranges', () => {
      const res = validateDateRange('2025-01-01', '2025-01-10');
      expect(res.isValid).toBe(true);
      expect(res.value.start).toBeInstanceOf(Date);
      expect(res.value.rangeDays).toBe(9);
    });

    it('should reject inverted dates', () => {
      expect(validateDateRange('2025-01-10', '2025-01-01').isValid).toBe(false);
    });

    it('should enforce allowSameDay false', () => {
      expect(validateDateRange('2025-01-01', '2025-01-01', { allowSameDay: false }).isValid).toBe(false);
      expect(validateDateRange('2025-01-01', '2025-01-01', { allowSameDay: true }).isValid).toBe(true);
    });

    it('should check future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 10);
      expect(validateDateRange('2020-01-01', futureDate.toISOString(), { allowFuture: false }).isValid).toBe(false);
    });

    it('should reject invalid date formats', () => {
      expect(validateDateRange('not-a-date', '2025-01-01').isValid).toBe(false);
    });
  });

  describe('validateEmissionEntry', () => {
    it('should validate a correct entry', () => {
      const entry = {
        category: 'transport',
        type: 'car_petrol',
        amount: 50,
        unit: 'km',
        frequency: 'daily',
        notes: 'Commute'
      };
      const res = validateEmissionEntry(entry);
      expect(res.isValid).toBe(true);
      expect(res.value.category).toBe('transport');
      expect(res.value.amount).toBe(50);
      expect(res.value.date).toBeDefined(); // defaults to today
    });

    it('should reject invalid combinations', () => {
      const entry = {
        category: 'transport',
        type: 'beef', // mismatch
        amount: 50
      };
      expect(validateEmissionEntry(entry).isValid).toBe(false);
    });

    it('should validate amount limits and emit warnings', () => {
      const entry = {
        category: 'transport',
        type: 'car_petrol',
        amount: 40000 // Very high
      };
      const res = validateEmissionEntry(entry);
      expect(res.isValid).toBe(true);
      expect(res.warnings.length).toBeGreaterThan(0);
      
      const entryInvalid = {
        category: 'transport',
        type: 'car_petrol',
        amount: 100000 // Exceeds absolute max
      };
      expect(validateEmissionEntry(entryInvalid).isValid).toBe(false);
    });

    it('should reject invalid frequencies', () => {
      const entry = { category: 'transport', type: 'car_petrol', amount: 10, frequency: 'hourly' };
      expect(validateEmissionEntry(entry).isValid).toBe(false);
    });
  });

  describe('validateGoal', () => {
    it('should validate a correct goal', () => {
      const goal = {
        title: 'Reduce Driving',
        targetReductionKg: 100,
        category: 'transport',
        startDate: '2025-01-01',
        endDate: '2025-12-31'
      };
      const res = validateGoal(goal);
      expect(res.isValid).toBe(true);
      expect(res.value.difficulty).toBe('medium'); // Default
    });

    it('should reject invalid titles', () => {
      expect(validateGoal({ title: 'A', targetReductionKg: 100, category: 'all', startDate: '2025-01-01', endDate: '2025-12-31' }).isValid).toBe(false);
    });

    it('should allow "all" or "overall" categories', () => {
      const goal = {
        title: 'All emissions',
        targetReductionKg: 100,
        category: 'all',
        startDate: '2025-01-01',
        endDate: '2025-12-31'
      };
      expect(validateGoal(goal).isValid).toBe(true);
    });
  });

  describe('validateString', () => {
    it('should validate standard strings', () => {
      expect(validateString('hello', { minLength: 2, maxLength: 10 }).isValid).toBe(true);
    });

    it('should enforce min and max lengths', () => {
      expect(validateString('a', { minLength: 2 }).isValid).toBe(false);
      expect(validateString('hello', { maxLength: 3 }).isValid).toBe(false);
    });

    it('should test patterns', () => {
      expect(validateString('abc', { pattern: /^[a-z]+$/ }).isValid).toBe(true);
      expect(validateString('123', { pattern: /^[a-z]+$/ }).isValid).toBe(false);
    });
  });

  describe('validateEmissionEntries', () => {
    it('should validate multiple entries', () => {
      const res = validateEmissionEntries([
        { category: 'transport', type: 'car_petrol', amount: 50 },
        { category: 'food', type: 'beef', amount: 2 }
      ]);
      expect(res.isValid).toBe(true);
      expect(res.value.validEntries.length).toBe(2);
    });

    it('should handle mixed valid and invalid entries', () => {
      const res = validateEmissionEntries([
        { category: 'transport', type: 'car_petrol', amount: 50 },
        { category: 'invalid', type: 'beef', amount: 2 }
      ]);
      expect(res.isValid).toBe(false);
      expect(res.value.validEntries.length).toBe(1);
      expect(res.value.invalidEntries.length).toBe(1);
    });
    
    it('should enforce maxEntries limit', () => {
      expect(validateEmissionEntries([{ category: 'transport', type: 'bus', amount: 5 }], { maxEntries: 0 }).isValid).toBe(false);
    });
  });
});
