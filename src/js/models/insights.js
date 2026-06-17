/**
 * @module insights
 * @description Personalized insights and recommendations engine
 */

import { calculateTransportEmission, calculateEnergyEmission, calculateFoodEmission, calculateShoppingEmission } from './carbon.js';

const ALL_INSIGHTS = [
  // Transport
  {
    id: 't1',
    category: 'transport',
    title: 'Switch to Public Transport',
    description: 'Replacing your car commute with bus or train can drastically reduce emissions.',
    impact: 'high',
    difficulty: 'medium',
    icon: '🚌',
    actionSteps: [
      'Find the nearest bus/train route to work.',
      'Try it for just one day a week initially.',
      'Look into monthly passes for cost savings.'
    ],
    calculateSaving: (userData) => {
      if (!userData || !userData.carCommuteKm) return 0;
      const carEmissions = calculateTransportEmission('car_petrol', userData.carCommuteKm * 200); // approx yearly commute
      const busEmissions = calculateTransportEmission('bus', userData.carCommuteKm * 200);
      return carEmissions - busEmissions;
    }
  },
  {
    id: 't2',
    category: 'transport',
    title: 'Active Commuting',
    description: 'Walk or cycle for short journeys under 5km.',
    impact: 'medium',
    difficulty: 'hard',
    icon: '🚲',
    actionSteps: [
      'Service your bike or look into local bike-share schemes.',
      'Plan safe cycle routes using dedicated paths.',
      'Get suitable rain gear.'
    ],
    calculateSaving: (userData) => {
      if (!userData || !userData.shortJourneysKm) return 100; // default estimate
      return calculateTransportEmission('car_petrol', userData.shortJourneysKm * 52); 
    }
  },
  
  // Energy
  {
    id: 'e1',
    category: 'energy',
    title: 'Switch to LED Bulbs',
    description: 'Replace all incandescent or halogen bulbs with LEDs.',
    impact: 'low',
    difficulty: 'easy',
    icon: '💡',
    actionSteps: [
      'Count the number of non-LED bulbs in your home.',
      'Buy LED replacements (look for warm white for living areas).',
      'Replace them as old ones burn out, or all at once for immediate savings.'
    ],
    calculateSaving: () => 50 // roughly 50kg per year for avg household
  },
  {
    id: 'e2',
    category: 'energy',
    title: 'Lower Your Thermostat',
    description: 'Lowering your heating by just 1°C can reduce energy use by 8%.',
    impact: 'high',
    difficulty: 'easy',
    icon: '🌡️',
    actionSteps: [
      'Set thermostat to 19°C or 20°C instead of 21°C.',
      'Wear a sweater indoors during winter.',
      'Install a programmable thermostat.'
    ],
    calculateSaving: (userData) => {
      if (!userData || !userData.gasUsageM3) return 150;
      return calculateEnergyEmission('natural_gas', userData.gasUsageM3 * 0.08 * 12); // 8% of yearly gas
    }
  },
  {
    id: 'e3',
    category: 'energy',
    title: 'Switch to Renewable Energy Tariff',
    description: 'Move to an energy provider that guarantees 100% renewable electricity.',
    impact: 'high',
    difficulty: 'medium',
    icon: '☀️',
    actionSteps: [
      'Check your current contract end date.',
      'Compare renewable energy providers in your area.',
      'Make the switch online (usually takes 10 mins).'
    ],
    calculateSaving: (userData) => {
      if (!userData || !userData.electricityUsageKwh) return 800;
      return calculateEnergyEmission('electricity', userData.electricityUsageKwh * 12); // Entire electricity footprint
    }
  },

  // Food
  {
    id: 'f1',
    category: 'food',
    title: 'Meatless Mondays',
    description: 'Skip meat just one day a week to significantly lower your food footprint.',
    impact: 'medium',
    difficulty: 'easy',
    icon: '🥦',
    actionSteps: [
      'Find 3-4 vegetarian recipes you enjoy.',
      'Stock up on plant-based proteins like lentils, chickpeas, or tofu.',
      'Get the whole household involved.'
    ],
    calculateSaving: (userData) => {
      // roughly replacing 1 day of beef with veg
      return (calculateFoodEmission('beef', 0.2) - calculateFoodEmission('vegetables', 0.2)) * 52; 
    }
  },
  {
    id: 'f2',
    category: 'food',
    title: 'Reduce Food Waste',
    description: 'Globally, 1/3 of food is wasted. Plan meals to buy only what you eat.',
    impact: 'high',
    difficulty: 'medium',
    icon: '🗑️',
    actionSteps: [
      'Plan meals for the week before shopping.',
      'Use a shopping list and stick to it.',
      'Learn how to properly store vegetables to make them last longer.',
      'Start composting unavoidable scraps.'
    ],
    calculateSaving: (userData) => {
      if (!userData || !userData.totalFoodFootprint) return 200;
      return userData.totalFoodFootprint * 0.2; // Assume 20% reduction in food footprint
    }
  },

  // Shopping
  {
    id: 's1',
    category: 'shopping',
    title: 'Buy Second-Hand Clothing',
    description: 'The fashion industry is highly polluting. Opt for vintage or thrifted clothes.',
    impact: 'medium',
    difficulty: 'easy',
    icon: '👕',
    actionSteps: [
      'Check local charity shops or thrift stores.',
      'Use apps like Vinted, Depop, or Poshmark.',
      'Host a clothing swap with friends.'
    ],
    calculateSaving: (userData) => {
      if (!userData || !userData.clothingItemsPerYear) return 100;
      return calculateShoppingEmission('clothing_item', userData.clothingItemsPerYear * 0.5); // Replace half with second hand
    }
  }
];

/**
 * Generates personalized insights based on user footprint data
 * @param {Object} userData - User's footprint data
 * @returns {Array} Array of prioritized insight objects
 */
export function generateInsights(userData) {
  let insights = ALL_INSIGHTS.map(insight => {
    // Calculate personalized savings
    const potentialSavingKg = Math.round(insight.calculateSaving(userData));
    return { ...insight, potentialSavingKg };
  });

  // Filter out negative or zero savings
  insights = insights.filter(i => i.potentialSavingKg > 0);

  // Sort by potential savings (descending)
  return prioritizeInsights(insights);
}

/**
 * Prioritizes insights
 * @param {Array} insights 
 */
export function prioritizeInsights(insights) {
  return insights.sort((a, b) => b.potentialSavingKg - a.potentialSavingKg);
}

/**
 * Gets a motivational message based on user progress
 * @param {number} percentageToGoal 
 * @returns {string}
 */
export function getMotivationalMessage(percentageToGoal) {
  if (percentageToGoal >= 100) return "Incredible work! You've hit your carbon reduction goal. Time to set a new one?";
  if (percentageToGoal >= 75) return "You're doing great! Just a little push to reach your target.";
  if (percentageToGoal >= 50) return "Halfway there! Keep up the good work and stay consistent.";
  if (percentageToGoal >= 25) return "Good start! Small daily changes will get you to your goal.";
  return "Every journey begins with a single step. Start exploring actions to reduce your footprint today.";
}
