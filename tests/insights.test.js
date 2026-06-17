import { describe, it, expect } from 'vitest';
import {
  generateInsights,
  prioritizeInsights,
  getMotivationalMessage
} from '../src/js/models/insights.js';

describe('Insights Models', () => {
  describe('generateInsights', () => {
    it('should generate prioritized insights based on user data', () => {
      const userData = {
        carCommuteKm: 50,
        shortJourneysKm: 10,
        gasUsageM3: 500,
        electricityUsageKwh: 2000,
        totalFoodFootprint: 1000,
        clothingItemsPerYear: 20
      };

      const insights = generateInsights(userData);
      
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
      
      // Should be sorted descending by potential saving
      for (let i = 0; i < insights.length - 1; i++) {
        expect(insights[i].potentialSavingKg).toBeGreaterThanOrEqual(insights[i+1].potentialSavingKg);
      }
      
      // All items should have positive savings
      expect(insights.every(i => i.potentialSavingKg > 0)).toBe(true);
    });

    it('should handle missing or empty user data gracefully with defaults', () => {
      const insights = generateInsights({});
      expect(insights.length).toBeGreaterThan(0);
    });

    it('should filter out insights with zero or negative savings', () => {
      const userData = {
        carCommuteKm: 0, // Should result in 0 saving for t1
      };
      
      const insights = generateInsights(userData);
      const t1Insight = insights.find(i => i.id === 't1');
      
      // Switch to Public Transport (t1) should be filtered out
      expect(t1Insight).toBeUndefined();
    });
  });

  describe('prioritizeInsights', () => {
    it('should sort insights by potentialSavingKg in descending order', () => {
      const unsorted = [
        { id: 1, potentialSavingKg: 100 },
        { id: 2, potentialSavingKg: 500 },
        { id: 3, potentialSavingKg: 50 }
      ];
      
      const sorted = prioritizeInsights(unsorted);
      
      expect(sorted[0].id).toBe(2);
      expect(sorted[1].id).toBe(1);
      expect(sorted[2].id).toBe(3);
    });
  });

  describe('getMotivationalMessage', () => {
    it('should return correct message for >= 100%', () => {
      expect(getMotivationalMessage(100)).toContain('Incredible work');
      expect(getMotivationalMessage(150)).toContain('Incredible work');
    });

    it('should return correct message for >= 75%', () => {
      expect(getMotivationalMessage(75)).toContain('doing great');
      expect(getMotivationalMessage(85)).toContain('doing great');
    });

    it('should return correct message for >= 50%', () => {
      expect(getMotivationalMessage(50)).toContain('Halfway there');
      expect(getMotivationalMessage(60)).toContain('Halfway there');
    });

    it('should return correct message for >= 25%', () => {
      expect(getMotivationalMessage(25)).toContain('Good start');
      expect(getMotivationalMessage(35)).toContain('Good start');
    });

    it('should return correct message for < 25%', () => {
      expect(getMotivationalMessage(10)).toContain('Every journey begins');
      expect(getMotivationalMessage(0)).toContain('Every journey begins');
    });
  });
});
