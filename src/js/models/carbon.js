/**
 * @module carbon
 * @description Core carbon calculation engine
 */

import { sanitizeNumber } from '../utils/sanitize.js';

// Emission factors in kg CO2e per unit
export const EMISSION_FACTORS = {
  transport: {
    car_petrol: 0.21, // per km
    car_diesel: 0.27,
    car_electric: 0.05,
    car_hybrid: 0.12,
    motorcycle: 0.113,
    bus: 0.089,
    train: 0.041,
    subway: 0.033,
    domestic_flight: 0.255,
    long_flight: 0.195,
    bicycle: 0.0,
    walking: 0.0
  },
  energy: {
    electricity: 0.233, // per kWh
    natural_gas: 2.0, // per m3
    heating_oil: 2.52, // per L
    lpg: 1.51, // per L
    solar: 0.0,
    wind: 0.0
  },
  food: { // per kg
    beef: 27.0,
    lamb: 39.2,
    pork: 12.1,
    chicken: 6.9,
    fish: 6.1,
    eggs: 4.8,
    dairy_milk: 3.2,
    cheese: 13.5,
    rice: 2.7,
    vegetables: 2.0,
    fruits: 1.1,
    legumes: 0.9,
    nuts: 0.3,
    processed_food: 3.5
  },
  shopping: { // per item
    clothing_item: 10.0,
    electronics_small: 25.0,
    electronics_large: 200.0,
    furniture: 50.0,
    books: 2.5,
    household_goods: 5.0
  }
};

export const NATIONAL_AVERAGES = {
  world: 4.7, // tonnes CO2e/year
  usa: 15.5,
  uk: 5.4,
  eu: 6.8,
  india: 1.9,
  china: 7.4
};

/**
 * Calculates transport emissions
 * @param {string} type - Vehicle/transport type
 * @param {number} distance - Distance in km
 * @returns {number} Emissions in kg CO2e
 */
export function calculateTransportEmission(type, distance) {
  const safeDist = sanitizeNumber(distance, 0, 1000000);
  const factor = EMISSION_FACTORS.transport[type];
  if (factor === undefined) return 0;
  return safeDist * factor;
}

/**
 * Calculates energy emissions
 * @param {string} type - Energy source type
 * @param {number} amount - Amount used
 * @param {number} householdMembers - Number of people in household to divide by
 * @returns {number} Emissions in kg CO2e
 */
export function calculateEnergyEmission(type, amount, householdMembers = 1) {
  const safeAmount = sanitizeNumber(amount, 0, 1000000);
  const safeMembers = sanitizeNumber(householdMembers, 1, 50);
  const factor = EMISSION_FACTORS.energy[type];
  if (factor === undefined) return 0;
  return (safeAmount * factor) / safeMembers;
}

/**
 * Calculates food emissions
 * @param {string} type - Food type
 * @param {number} weight - Weight in kg
 * @returns {number} Emissions in kg CO2e
 */
export function calculateFoodEmission(type, weight) {
  const safeWeight = sanitizeNumber(weight, 0, 1000);
  const factor = EMISSION_FACTORS.food[type];
  if (factor === undefined) return 0;
  return safeWeight * factor;
}

/**
 * Calculates shopping emissions
 * @param {string} type - Item type
 * @param {number} quantity - Number of items
 * @returns {number} Emissions in kg CO2e
 */
export function calculateShoppingEmission(type, quantity) {
  const safeQty = sanitizeNumber(quantity, 0, 1000);
  const factor = EMISSION_FACTORS.shopping[type];
  if (factor === undefined) return 0;
  return safeQty * factor;
}

/**
 * Calculates the total footprint from an array of entries
 * @param {Array} entries - Array of emission entries {category, type, value, metadata}
 * @returns {Object} Total and breakdown by category
 */
export function calculateTotalFootprint(entries) {
  if (!Array.isArray(entries)) return { total: 0, byCategory: {} };

  const byCategory = {
    transport: 0,
    energy: 0,
    food: 0,
    shopping: 0
  };

  let total = 0;

  entries.forEach(entry => {
    let emission = 0;
    switch(entry.category) {
      case 'transport':
        emission = calculateTransportEmission(entry.type, entry.value);
        break;
      case 'energy':
        emission = calculateEnergyEmission(entry.type, entry.value, entry.metadata?.householdMembers);
        break;
      case 'food':
        emission = calculateFoodEmission(entry.type, entry.value);
        break;
      case 'shopping':
        emission = calculateShoppingEmission(entry.type, entry.value);
        break;
    }
    
    byCategory[entry.category] += emission;
    total += emission;
  });

  return { total, byCategory };
}

/**
 * Annualizes weekly or monthly data
 * @param {number} amount - Emission amount
 * @param {string} period - 'weekly' or 'monthly'
 * @returns {number} Annual tonnes CO2e
 */
export function getAnnualizedFootprint(amount, period) {
  const safeAmount = sanitizeNumber(amount);
  let annualKg = 0;
  
  if (period === 'weekly') {
    annualKg = safeAmount * 52;
  } else if (period === 'monthly') {
    annualKg = safeAmount * 12;
  } else {
    annualKg = safeAmount; // Assume already annual
  }
  
  return annualKg / 1000; // Convert to tonnes
}

/**
 * Gets carbon equivalencies for better understanding
 * @param {number} kgCO2 - Amount in kg CO2e
 * @returns {Object} Equivalencies
 */
export function getCarbonEquivalent(kgCO2) {
  const safeAmount = sanitizeNumber(kgCO2);
  return {
    trees: Math.round(safeAmount / 21), // A tree absorbs ~21kg per year
    flights: Number((safeAmount / 255).toFixed(1)), // 1000km short haul flight
    driving: Math.round(safeAmount / 0.21), // km in average petrol car
    smartphones: Math.round(safeAmount / 0.005) // daily smartphone charges
  };
}

/**
 * Compares user footprint to averages
 * @param {number} annualTonnes 
 * @param {string} country 
 */
export function compareToAverage(annualTonnes, country = 'world') {
  const avg = NATIONAL_AVERAGES[country] || NATIONAL_AVERAGES.world;
  const percentage = (annualTonnes / avg) * 100;
  
  let rating = 'Medium';
  if (percentage < 50) rating = 'Very Low';
  else if (percentage < 80) rating = 'Low';
  else if (percentage > 150) rating = 'Very High';
  else if (percentage > 120) rating = 'High';
  
  return {
    percentage: Number(percentage.toFixed(1)),
    rating,
    average: avg,
    difference: Number(Math.abs(annualTonnes - avg).toFixed(2)),
    isBetter: annualTonnes < avg
  };
}
