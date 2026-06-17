import { describe, it, expect, vi } from 'vitest';
import {
  calculateTransportEmission,
  calculateEnergyEmission,
  calculateFoodEmission,
  calculateShoppingEmission,
  calculateTotalFootprint,
  getAnnualizedFootprint,
  getCarbonEquivalent,
  compareToAverage,
  EMISSION_FACTORS,
  NATIONAL_AVERAGES
} from '../src/js/models/carbon.js';

describe('Carbon Models', () => {
  describe('calculateTransportEmission', () => {
    it('should calculate correct emissions for a given transport type', () => {
      expect(calculateTransportEmission('car_petrol', 100)).toBeCloseTo(21); // 100 * 0.21
      expect(calculateTransportEmission('car_electric', 100)).toBeCloseTo(5); // 100 * 0.05
    });

    it('should return 0 for unknown type', () => {
      expect(calculateTransportEmission('spaceship', 100)).toBe(0);
    });

    it('should handle string values by sanitizing them', () => {
      expect(calculateTransportEmission('train', '100')).toBeCloseTo(4.1); // 100 * 0.041
    });

    it('should handle undefined or negative distance via sanitization', () => {
      expect(calculateTransportEmission('car_diesel', -50)).toBe(0); // sanitize to 0
    });
  });

  describe('calculateEnergyEmission', () => {
    it('should calculate correct emissions for energy type with household division', () => {
      // electricity: 0.233 per kWh
      expect(calculateEnergyEmission('electricity', 1000, 2)).toBeCloseTo(116.5); // 1000 * 0.233 / 2
      expect(calculateEnergyEmission('natural_gas', 100, 1)).toBeCloseTo(200); // 100 * 2.0
    });

    it('should return 0 for unknown type', () => {
      expect(calculateEnergyEmission('magic', 100)).toBe(0);
    });

    it('should handle zero or missing household members by defaulting/sanitizing', () => {
      // sanitizeNumber bounds householdMembers to 1-50
      expect(calculateEnergyEmission('heating_oil', 100, 0)).toBeCloseTo(252); // 100 * 2.52 / 1
    });
  });

  describe('calculateFoodEmission', () => {
    it('should calculate correct food emissions', () => {
      // beef: 27.0
      expect(calculateFoodEmission('beef', 2)).toBeCloseTo(54);
    });

    it('should return 0 for unknown food type', () => {
      expect(calculateFoodEmission('unicorn_meat', 10)).toBe(0);
    });
  });

  describe('calculateShoppingEmission', () => {
    it('should calculate correct shopping emissions', () => {
      // clothing_item: 10.0
      expect(calculateShoppingEmission('clothing_item', 5)).toBeCloseTo(50);
    });

    it('should return 0 for unknown shopping type', () => {
      expect(calculateShoppingEmission('quantum_computer', 1)).toBe(0);
    });
  });

  describe('calculateTotalFootprint', () => {
    it('should return 0 for invalid inputs', () => {
      expect(calculateTotalFootprint(null)).toEqual({ total: 0, byCategory: {} });
      expect(calculateTotalFootprint(undefined)).toEqual({ total: 0, byCategory: {} });
    });

    it('should calculate total and categorical breakdown', () => {
      const entries = [
        { category: 'transport', type: 'car_petrol', value: 100 }, // 21
        { category: 'energy', type: 'electricity', value: 100, metadata: { householdMembers: 1 } }, // 23.3
        { category: 'food', type: 'beef', value: 2 }, // 54
        { category: 'shopping', type: 'clothing_item', value: 1 } // 10
      ];

      const result = calculateTotalFootprint(entries);
      expect(result.total).toBeCloseTo(108.3);
      expect(result.byCategory.transport).toBeCloseTo(21);
      expect(result.byCategory.energy).toBeCloseTo(23.3);
      expect(result.byCategory.food).toBeCloseTo(54);
      expect(result.byCategory.shopping).toBeCloseTo(10);
    });

    it('should handle unknown categories gracefully', () => {
      const entries = [{ category: 'unknown', type: 'x', value: 100 }];
      const result = calculateTotalFootprint(entries);
      expect(result.total).toBe(0);
    });
  });

  describe('getAnnualizedFootprint', () => {
    it('should calculate annual amount from weekly', () => {
      expect(getAnnualizedFootprint(10, 'weekly')).toBe(0.52); // 10 * 52 / 1000
    });

    it('should calculate annual amount from monthly', () => {
      expect(getAnnualizedFootprint(100, 'monthly')).toBe(1.2); // 100 * 12 / 1000
    });

    it('should assume annual if not weekly or monthly', () => {
      expect(getAnnualizedFootprint(1000, 'yearly')).toBe(1); // 1000 / 1000
      expect(getAnnualizedFootprint(1000)).toBe(1);
    });
  });

  describe('getCarbonEquivalent', () => {
    it('should calculate equivalents', () => {
      const result = getCarbonEquivalent(1000); // 1000 kg CO2
      expect(result.trees).toBe(Math.round(1000 / 21));
      expect(result.flights).toBe(Number((1000 / 255).toFixed(1)));
      expect(result.driving).toBe(Math.round(1000 / 0.21));
      expect(result.smartphones).toBe(Math.round(1000 / 0.005));
    });
  });

  describe('compareToAverage', () => {
    it('should compare user to world average by default', () => {
      const result = compareToAverage(4.7); // World average
      expect(result.average).toBe(4.7);
      expect(result.percentage).toBeCloseTo(100);
      expect(result.rating).toBe('Medium');
      expect(result.difference).toBe(0);
      expect(result.isBetter).toBe(false);
    });

    it('should handle very low ratings', () => {
      const result = compareToAverage(1.0, 'usa'); // USA avg 15.5
      expect(result.rating).toBe('Very Low');
      expect(result.isBetter).toBe(true);
    });

    it('should handle very high ratings', () => {
      const result = compareToAverage(30, 'usa'); // > 150% of 15.5
      expect(result.rating).toBe('Very High');
      expect(result.isBetter).toBe(false);
    });
    
    it('should handle high ratings', () => {
      const result = compareToAverage(15.5 * 1.3, 'usa'); // > 120%
      expect(result.rating).toBe('High');
      expect(result.isBetter).toBe(false);
    });

    it('should fallback to world average if country unknown', () => {
      const result = compareToAverage(4.7, 'mars');
      expect(result.average).toBe(4.7);
    });
  });
});
