/**
 * @module validators
 * @description Input validation utilities for the EcoTrack application.
 * Provides structured validation for emission entries, goals, date ranges,
 * categories, and numeric values. All validators return a ValidationResult
 * object for consistent error handling.
 * @version 1.0.0
 * @author EcoTrack Team
 */

/**
 * Valid emission category identifiers.
 * @constant {string[]}
 */
export const VALID_CATEGORIES = Object.freeze([
  'transport',
  'energy',
  'food',
  'shopping'
]);

/**
 * Valid transport sub-types.
 * @constant {string[]}
 */
export const VALID_TRANSPORT_TYPES = Object.freeze([
  'car_petrol', 'car_diesel', 'car_electric', 'car_hybrid',
  'bus', 'train', 'subway',
  'domestic_flight', 'long_flight',
  'bicycle', 'walking', 'motorcycle'
]);

/**
 * Valid energy sub-types.
 * @constant {string[]}
 */
export const VALID_ENERGY_TYPES = Object.freeze([
  'electricity', 'natural_gas', 'heating_oil', 'lpg', 'solar', 'wind'
]);

/**
 * Valid food sub-types.
 * @constant {string[]}
 */
export const VALID_FOOD_TYPES = Object.freeze([
  'beef', 'lamb', 'pork', 'chicken', 'fish', 'eggs',
  'dairy_milk', 'cheese', 'rice', 'vegetables', 'fruits',
  'legumes', 'nuts', 'processed_food'
]);

/**
 * Valid shopping sub-types.
 * @constant {string[]}
 */
export const VALID_SHOPPING_TYPES = Object.freeze([
  'clothing_item', 'electronics_small', 'electronics_large',
  'furniture', 'books', 'household_goods'
]);

/**
 * Mapping of categories to their valid sub-types.
 * @constant {Object<string, string[]>}
 */
export const CATEGORY_TYPES_MAP = Object.freeze({
  transport: VALID_TRANSPORT_TYPES,
  energy: VALID_ENERGY_TYPES,
  food: VALID_FOOD_TYPES,
  shopping: VALID_SHOPPING_TYPES
});

/**
 * Valid frequency options for recurring entries.
 * @constant {string[]}
 */
export const VALID_FREQUENCIES = Object.freeze([
  'daily', 'weekly', 'monthly', 'yearly', 'one-time'
]);

/**
 * Valid energy units.
 * @constant {string[]}
 */
export const VALID_ENERGY_UNITS = Object.freeze([
  'kWh', 'm³', 'litre', 'gallon', 'therm'
]);

/**
 * Goal difficulty levels.
 * @constant {string[]}
 */
export const VALID_DIFFICULTY_LEVELS = Object.freeze([
  'easy', 'medium', 'hard'
]);

/**
 * Maximum reasonable values for input sanity checking.
 * @constant {Object}
 */
const SANITY_LIMITS = Object.freeze({
  maxDistanceKm: 50000,       // Circumference of Earth
  maxWeightKg: 10000,         // 10 tonnes
  maxEnergyKWh: 1000000,      // 1 GWh
  maxQuantity: 10000,
  maxGoalKg: 1000000,         // 1000 tonnes
  maxFutureYears: 50,
  maxPastYears: 100,
  minYear: 1924,
  maxYear: 2076
});

/**
 * Represents the result of a validation operation.
 * Contains the validation status, any errors encountered,
 * and the sanitized/validated value.
 *
 * @class ValidationResult
 *
 * @example
 * const result = validateNumber(42, 0, 100);
 * if (result.isValid) {
 *   console.log('Valid value:', result.value);
 * } else {
 *   console.log('Errors:', result.errors);
 * }
 */
export class ValidationResult {
  /**
   * Creates a new ValidationResult.
   *
   * @param {boolean} isValid - Whether the validation passed
   * @param {*} [value=null] - The validated/sanitized value
   * @param {string[]} [errors=[]] - Array of error messages
   * @param {string[]} [warnings=[]] - Array of warning messages (non-fatal)
   */
  constructor(isValid, value = null, errors = [], warnings = []) {
    /** @type {boolean} Whether all validations passed */
    this.isValid = isValid;

    /** @type {*} The validated and potentially transformed value */
    this.value = value;

    /** @type {string[]} Array of validation error messages */
    this.errors = Array.isArray(errors) ? [...errors] : [];

    /** @type {string[]} Array of non-fatal warning messages */
    this.warnings = Array.isArray(warnings) ? [...warnings] : [];
  }

  /**
   * Creates a successful validation result.
   *
   * @param {*} value - The validated value
   * @param {string[]} [warnings=[]] - Optional warnings
   * @returns {ValidationResult}
   * @static
   */
  static success(value, warnings = []) {
    return new ValidationResult(true, value, [], warnings);
  }

  /**
   * Creates a failed validation result.
   *
   * @param {string|string[]} errors - Error message(s)
   * @param {*} [value=null] - The original invalid value
   * @returns {ValidationResult}
   * @static
   */
  static failure(errors, value = null) {
    const errorArray = Array.isArray(errors) ? errors : [errors];
    return new ValidationResult(false, value, errorArray);
  }

  /**
   * Adds an error message to this result and marks it as invalid.
   *
   * @param {string} message - The error message
   * @returns {ValidationResult} This instance for chaining
   */
  addError(message) {
    this.errors.push(message);
    this.isValid = false;
    return this;
  }

  /**
   * Adds a warning message (does not affect validity).
   *
   * @param {string} message - The warning message
   * @returns {ValidationResult} This instance for chaining
   */
  addWarning(message) {
    this.warnings.push(message);
    return this;
  }

  /**
   * Returns a human-readable summary of this validation result.
   *
   * @returns {string} Summary string
   */
  toString() {
    if (this.isValid) {
      const warnStr = this.warnings.length > 0
        ? ` (${this.warnings.length} warning(s))`
        : '';
      return `Validation passed${warnStr}`;
    }
    return `Validation failed: ${this.errors.join('; ')}`;
  }
}

/**
 * Validates a numeric value within a given range.
 *
 * @param {*} value - The value to validate
 * @param {number} [min=-Infinity] - Minimum allowed value (inclusive)
 * @param {number} [max=Infinity] - Maximum allowed value (inclusive)
 * @param {Object} [options] - Additional validation options
 * @param {string} [options.fieldName='Value'] - Name of the field for error messages
 * @param {boolean} [options.integer=false] - Whether the value must be an integer
 * @param {boolean} [options.required=true] - Whether the value is required (null/undefined fail)
 * @returns {ValidationResult} The validation result
 *
 * @example
 * validateNumber(42, 0, 100)
 * // ValidationResult { isValid: true, value: 42, errors: [] }
 *
 * @example
 * validateNumber('abc', 0, 100, { fieldName: 'Distance' })
 * // ValidationResult { isValid: false, errors: ['Distance must be a valid number'] }
 */
export function validateNumber(value, min = -Infinity, max = Infinity, options = {}) {
  const { fieldName = 'Value', integer = false, required = true } = options;

  if (value === null || value === undefined || value === '') {
    if (required) {
      return ValidationResult.failure(`${fieldName} is required`);
    }
    return ValidationResult.success(null);
  }

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (typeof num !== 'number' || isNaN(num)) {
    return ValidationResult.failure(`${fieldName} must be a valid number`);
  }

  if (!isFinite(num)) {
    return ValidationResult.failure(`${fieldName} must be a finite number`);
  }

  if (integer && !Number.isInteger(num)) {
    return ValidationResult.failure(`${fieldName} must be a whole number (integer)`);
  }

  const warnings = [];

  if (num < min) {
    return ValidationResult.failure(`${fieldName} must be at least ${min} (received ${num})`);
  }

  if (num > max) {
    return ValidationResult.failure(`${fieldName} must be at most ${max} (received ${num})`);
  }

  return ValidationResult.success(num, warnings);
}

/**
 * Validates an emission category string.
 *
 * @param {*} category - The category to validate
 * @returns {ValidationResult} The validation result
 *
 * @example
 * validateCategory('transport')
 * // ValidationResult { isValid: true, value: 'transport' }
 *
 * @example
 * validateCategory('invalid')
 * // ValidationResult { isValid: false, errors: ['...'] }
 */
export function validateCategory(category) {
  if (category === null || category === undefined || category === '') {
    return ValidationResult.failure('Emission category is required');
  }

  if (typeof category !== 'string') {
    return ValidationResult.failure('Emission category must be a string');
  }

  const normalized = category.trim().toLowerCase();

  if (!VALID_CATEGORIES.includes(normalized)) {
    return ValidationResult.failure(
      `Invalid emission category: "${category}". Valid categories are: ${VALID_CATEGORIES.join(', ')}`
    );
  }

  return ValidationResult.success(normalized);
}

/**
 * Validates a sub-type within a given category.
 *
 * @param {string} category - The parent category
 * @param {string} type - The sub-type to validate
 * @returns {ValidationResult} The validation result
 *
 * @example
 * validateSubType('transport', 'car_petrol')
 * // ValidationResult { isValid: true, value: 'car_petrol' }
 */
export function validateSubType(category, type) {
  if (typeof type !== 'string' || type.trim().length === 0) {
    return ValidationResult.failure('Emission sub-type is required');
  }

  const normalizedType = type.trim().toLowerCase();
  const normalizedCategory = (category || '').trim().toLowerCase();

  const validTypes = CATEGORY_TYPES_MAP[normalizedCategory];

  if (!validTypes) {
    return ValidationResult.failure(
      `Cannot validate sub-type for unknown category: "${category}"`
    );
  }

  if (!validTypes.includes(normalizedType)) {
    return ValidationResult.failure(
      `Invalid ${category} type: "${type}". Valid types are: ${validTypes.join(', ')}`
    );
  }

  return ValidationResult.success(normalizedType);
}

/**
 * Validates a date range (start and end dates).
 *
 * @param {string|Date|number} start - The start date
 * @param {string|Date|number} end - The end date
 * @param {Object} [options] - Additional validation options
 * @param {boolean} [options.allowFuture=true] - Whether future dates are allowed
 * @param {boolean} [options.allowSameDay=true] - Whether start and end can be the same day
 * @param {number} [options.maxRangeDays=3650] - Maximum allowed range in days (default: 10 years)
 * @returns {ValidationResult} The validation result with { start: Date, end: Date } value
 *
 * @example
 * validateDateRange('2025-01-01', '2025-12-31')
 * // ValidationResult { isValid: true, value: { start: Date, end: Date } }
 *
 * @example
 * validateDateRange('2025-12-31', '2025-01-01')
 * // ValidationResult { isValid: false, errors: ['Start date must be before end date'] }
 */
export function validateDateRange(start, end, options = {}) {
  const {
    allowFuture = true,
    allowSameDay = true,
    maxRangeDays = 3650
  } = options;

  const result = new ValidationResult(true, null);

  // Validate start date
  if (start === null || start === undefined || start === '') {
    result.addError('Start date is required');
  }

  if (end === null || end === undefined || end === '') {
    result.addError('End date is required');
  }

  if (!result.isValid) {
    return result;
  }

  // Parse dates
  let startDate, endDate;

  try {
    startDate = start instanceof Date ? start : new Date(start);
  } catch (_) {
    result.addError('Start date is not a valid date format');
    return result;
  }

  try {
    endDate = end instanceof Date ? end : new Date(end);
  } catch (_) {
    result.addError('End date is not a valid date format');
    return result;
  }

  // Check for invalid dates
  if (isNaN(startDate.getTime())) {
    result.addError(`Start date is invalid: "${start}". Use ISO 8601 format (YYYY-MM-DD)`);
  }

  if (isNaN(endDate.getTime())) {
    result.addError(`End date is invalid: "${end}". Use ISO 8601 format (YYYY-MM-DD)`);
  }

  if (!result.isValid) {
    return result;
  }

  // Check year bounds for sanity
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();

  if (startYear < SANITY_LIMITS.minYear || startYear > SANITY_LIMITS.maxYear) {
    result.addError(`Start date year (${startYear}) is out of reasonable range (${SANITY_LIMITS.minYear}–${SANITY_LIMITS.maxYear})`);
  }

  if (endYear < SANITY_LIMITS.minYear || endYear > SANITY_LIMITS.maxYear) {
    result.addError(`End date year (${endYear}) is out of reasonable range (${SANITY_LIMITS.minYear}–${SANITY_LIMITS.maxYear})`);
  }

  if (!result.isValid) {
    return result;
  }

  // Check ordering
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();

  if (startTime > endTime) {
    result.addError('Start date must be before or equal to end date');
    return result;
  }

  if (!allowSameDay && startTime === endTime) {
    result.addError('Start date and end date cannot be the same day');
    return result;
  }

  // Check future dates
  if (!allowFuture) {
    const now = Date.now();
    if (startTime > now) {
      result.addError('Start date cannot be in the future');
    }
    if (endTime > now) {
      result.addError('End date cannot be in the future');
    }
  }

  // Check range length
  const rangeDays = (endTime - startTime) / (1000 * 60 * 60 * 24);
  if (rangeDays > maxRangeDays) {
    result.addError(
      `Date range exceeds the maximum of ${maxRangeDays} days (${Math.round(rangeDays)} days selected)`
    );
  }

  if (!result.isValid) {
    return result;
  }

  result.value = {
    start: startDate,
    end: endDate,
    rangeDays: Math.round(rangeDays)
  };

  return result;
}

/**
 * Validates a carbon emission data entry.
 * An emission entry represents a single activity that generates CO₂.
 *
 * @param {Object} entry - The emission entry to validate
 * @param {string} entry.category - The emission category (transport, energy, food, shopping)
 * @param {string} entry.type - The specific sub-type within the category
 * @param {number} entry.amount - The quantity (distance, weight, energy, count)
 * @param {string} [entry.unit] - The unit of measurement
 * @param {string} [entry.date] - The date of the emission (ISO 8601)
 * @param {string} [entry.frequency='one-time'] - How often this activity occurs
 * @param {string} [entry.notes] - Optional user notes (max 500 chars)
 * @returns {ValidationResult} The validation result
 *
 * @example
 * validateEmissionEntry({
 *   category: 'transport',
 *   type: 'car_petrol',
 *   amount: 50,
 *   unit: 'km',
 *   date: '2025-06-01',
 *   frequency: 'daily'
 * });
 * // ValidationResult { isValid: true, value: { ... }, errors: [] }
 */
export function validateEmissionEntry(entry) {
  const result = new ValidationResult(true, null);

  // Check that entry is an object
  if (entry === null || entry === undefined || typeof entry !== 'object' || Array.isArray(entry)) {
    return ValidationResult.failure('Emission entry must be a non-null object');
  }

  const validated = {};

  // === Validate category ===
  const categoryResult = validateCategory(entry.category);
  if (!categoryResult.isValid) {
    result.errors.push(...categoryResult.errors);
  } else {
    validated.category = categoryResult.value;
  }

  // === Validate type ===
  if (validated.category) {
    const typeResult = validateSubType(validated.category, entry.type);
    if (!typeResult.isValid) {
      result.errors.push(...typeResult.errors);
    } else {
      validated.type = typeResult.value;
    }
  } else if (entry.type) {
    // Category is invalid, but record the type issue too
    if (typeof entry.type !== 'string' || entry.type.trim().length === 0) {
      result.addError('Emission type is required');
    }
  } else {
    result.addError('Emission type is required');
  }

  // === Validate amount ===
  const amountLimits = _getAmountLimits(validated.category, validated.type);
  const amountResult = validateNumber(entry.amount, amountLimits.min, amountLimits.max, {
    fieldName: 'Amount',
    integer: false,
    required: true
  });
  if (!amountResult.isValid) {
    result.errors.push(...amountResult.errors);
  } else {
    validated.amount = amountResult.value;

    // Warn about unusually high values
    if (amountResult.value > amountLimits.warnAbove) {
      result.addWarning(
        `Amount of ${amountResult.value} seems unusually high for ${validated.category || entry.category}. Please verify.`
      );
    }
  }

  // === Validate unit (optional) ===
  if (entry.unit !== undefined && entry.unit !== null) {
    if (typeof entry.unit !== 'string') {
      result.addError('Unit must be a string');
    } else {
      validated.unit = entry.unit.trim();
    }
  }

  // === Validate date (optional, defaults to today) ===
  if (entry.date !== undefined && entry.date !== null && entry.date !== '') {
    let dateObj;
    try {
      dateObj = entry.date instanceof Date ? entry.date : new Date(entry.date);
    } catch (_) {
      result.addError('Date is not a valid format');
    }

    if (dateObj && isNaN(dateObj.getTime())) {
      result.addError(`Date is invalid: "${entry.date}". Use ISO 8601 format (YYYY-MM-DD)`);
    } else if (dateObj) {
      // No entries from unreasonable years
      const year = dateObj.getFullYear();
      if (year < SANITY_LIMITS.minYear || year > SANITY_LIMITS.maxYear) {
        result.addError(`Date year (${year}) is out of reasonable range`);
      } else {
        validated.date = dateObj.toISOString().split('T')[0]; // Normalize to YYYY-MM-DD
      }
    }
  } else {
    // Default to today
    validated.date = new Date().toISOString().split('T')[0];
  }

  // === Validate frequency (optional, defaults to 'one-time') ===
  if (entry.frequency !== undefined && entry.frequency !== null && entry.frequency !== '') {
    const freq = String(entry.frequency).trim().toLowerCase();
    if (!VALID_FREQUENCIES.includes(freq)) {
      result.addError(
        `Invalid frequency: "${entry.frequency}". Valid values are: ${VALID_FREQUENCIES.join(', ')}`
      );
    } else {
      validated.frequency = freq;
    }
  } else {
    validated.frequency = 'one-time';
  }

  // === Validate notes (optional, max 500 chars) ===
  if (entry.notes !== undefined && entry.notes !== null) {
    if (typeof entry.notes !== 'string') {
      result.addError('Notes must be a string');
    } else if (entry.notes.length > 500) {
      result.addError('Notes must not exceed 500 characters');
    } else {
      validated.notes = entry.notes.trim();
    }
  }

  // === Generate entry ID if not present ===
  if (entry.id && typeof entry.id === 'string') {
    validated.id = entry.id.trim();
  }

  // Set the final result
  if (result.errors.length > 0) {
    result.isValid = false;
    result.value = entry; // Return original for reference
  } else {
    result.value = validated;
  }

  return result;
}

/**
 * Gets the amount limits for a specific category and type.
 *
 * @param {string} category - The emission category
 * @param {string} type - The emission sub-type
 * @returns {{ min: number, max: number, warnAbove: number }}
 * @private
 */
function _getAmountLimits(category, _type) {
  const defaults = { min: 0, max: 100000, warnAbove: 10000 };

  const limitsMap = {
    transport: { min: 0, max: SANITY_LIMITS.maxDistanceKm, warnAbove: 5000 },
    energy: { min: 0, max: SANITY_LIMITS.maxEnergyKWh, warnAbove: 10000 },
    food: { min: 0, max: SANITY_LIMITS.maxWeightKg, warnAbove: 100 },
    shopping: { min: 0, max: SANITY_LIMITS.maxQuantity, warnAbove: 50 }
  };

  return limitsMap[category] || defaults;
}

/**
 * Validates a user goal for carbon reduction.
 *
 * @param {Object} goal - The goal to validate
 * @param {string} goal.title - Goal title (3–100 characters)
 * @param {string} [goal.description] - Goal description (max 1000 characters)
 * @param {number} goal.targetReductionKg - Target CO₂ reduction in kg
 * @param {string} goal.category - The emission category to target, or 'all'
 * @param {string} goal.startDate - Goal start date (ISO 8601)
 * @param {string} goal.endDate - Goal end date (ISO 8601)
 * @param {string} [goal.difficulty='medium'] - Difficulty level
 * @param {boolean} [goal.isActive=true] - Whether the goal is currently active
 * @returns {ValidationResult} The validation result
 *
 * @example
 * validateGoal({
 *   title: 'Reduce driving emissions',
 *   targetReductionKg: 500,
 *   category: 'transport',
 *   startDate: '2025-01-01',
 *   endDate: '2025-12-31',
 *   difficulty: 'medium'
 * });
 */
export function validateGoal(goal) {
  const result = new ValidationResult(true, null);

  // Check that goal is an object
  if (goal === null || goal === undefined || typeof goal !== 'object' || Array.isArray(goal)) {
    return ValidationResult.failure('Goal must be a non-null object');
  }

  const validated = {};

  // === Validate title ===
  if (goal.title === null || goal.title === undefined || goal.title === '') {
    result.addError('Goal title is required');
  } else if (typeof goal.title !== 'string') {
    result.addError('Goal title must be a string');
  } else {
    const trimmedTitle = goal.title.trim();
    if (trimmedTitle.length < 3) {
      result.addError('Goal title must be at least 3 characters long');
    } else if (trimmedTitle.length > 100) {
      result.addError('Goal title must not exceed 100 characters');
    } else {
      validated.title = trimmedTitle;
    }
  }

  // === Validate description (optional) ===
  if (goal.description !== undefined && goal.description !== null) {
    if (typeof goal.description !== 'string') {
      result.addError('Goal description must be a string');
    } else if (goal.description.length > 1000) {
      result.addError('Goal description must not exceed 1000 characters');
    } else {
      validated.description = goal.description.trim();
    }
  }

  // === Validate targetReductionKg ===
  const reductionResult = validateNumber(goal.targetReductionKg, 0.1, SANITY_LIMITS.maxGoalKg, {
    fieldName: 'Target reduction (kg CO₂)',
    integer: false,
    required: true
  });
  if (!reductionResult.isValid) {
    result.errors.push(...reductionResult.errors);
  } else {
    validated.targetReductionKg = reductionResult.value;

    if (reductionResult.value > 50000) {
      result.addWarning(
        'Target reduction exceeds 50 tonnes CO₂/year. This is very ambitious — please verify.'
      );
    }
  }

  // === Validate category ===
  if (goal.category === 'all' || goal.category === 'overall') {
    validated.category = 'all';
  } else {
    const categoryResult = validateCategory(goal.category);
    if (!categoryResult.isValid) {
      result.errors.push(...categoryResult.errors);
    } else {
      validated.category = categoryResult.value;
    }
  }

  // === Validate date range ===
  const dateResult = validateDateRange(goal.startDate, goal.endDate, {
    allowFuture: true,
    allowSameDay: false,
    maxRangeDays: 3650 // Max 10 year goal
  });
  if (!dateResult.isValid) {
    result.errors.push(...dateResult.errors);
  } else {
    validated.startDate = dateResult.value.start.toISOString().split('T')[0];
    validated.endDate = dateResult.value.end.toISOString().split('T')[0];
    validated.rangeDays = dateResult.value.rangeDays;
  }

  // === Validate difficulty (optional) ===
  if (goal.difficulty !== undefined && goal.difficulty !== null && goal.difficulty !== '') {
    const diff = String(goal.difficulty).trim().toLowerCase();
    if (!VALID_DIFFICULTY_LEVELS.includes(diff)) {
      result.addError(
        `Invalid difficulty level: "${goal.difficulty}". Valid levels are: ${VALID_DIFFICULTY_LEVELS.join(', ')}`
      );
    } else {
      validated.difficulty = diff;
    }
  } else {
    validated.difficulty = 'medium';
  }

  // === Validate isActive (optional) ===
  if (goal.isActive !== undefined && goal.isActive !== null) {
    if (typeof goal.isActive !== 'boolean') {
      result.addError('isActive must be a boolean value');
    } else {
      validated.isActive = goal.isActive;
    }
  } else {
    validated.isActive = true;
  }

  // === Validate ID (optional) ===
  if (goal.id && typeof goal.id === 'string') {
    validated.id = goal.id.trim();
  }

  // Set final result
  if (result.errors.length > 0) {
    result.isValid = false;
    result.value = goal;
  } else {
    result.value = validated;
  }

  return result;
}

/**
 * Validates a string value.
 *
 * @param {*} value - The value to validate
 * @param {Object} [options] - Validation options
 * @param {number} [options.minLength=0] - Minimum string length
 * @param {number} [options.maxLength=1000] - Maximum string length
 * @param {string} [options.fieldName='Value'] - Name for error messages
 * @param {boolean} [options.required=true] - Whether the field is required
 * @param {RegExp} [options.pattern] - Optional regex pattern to match
 * @param {string} [options.patternMessage] - Custom message if pattern fails
 * @returns {ValidationResult}
 *
 * @example
 * validateString('hello', { minLength: 1, maxLength: 50, fieldName: 'Name' })
 * // ValidationResult { isValid: true, value: 'hello' }
 */
export function validateString(value, options = {}) {
  const {
    minLength = 0,
    maxLength = 1000,
    fieldName = 'Value',
    required = true,
    pattern = null,
    patternMessage = null
  } = options;

  if (value === null || value === undefined || value === '') {
    if (required) {
      return ValidationResult.failure(`${fieldName} is required`);
    }
    return ValidationResult.success(null);
  }

  if (typeof value !== 'string') {
    return ValidationResult.failure(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();

  if (trimmed.length < minLength) {
    return ValidationResult.failure(
      `${fieldName} must be at least ${minLength} character(s) long`
    );
  }

  if (trimmed.length > maxLength) {
    return ValidationResult.failure(
      `${fieldName} must not exceed ${maxLength} characters`
    );
  }

  if (pattern && !pattern.test(trimmed)) {
    return ValidationResult.failure(
      patternMessage || `${fieldName} does not match the required format`
    );
  }

  return ValidationResult.success(trimmed);
}

/**
 * Validates an array of emission entries in batch.
 * Returns an overall result with per-entry validation details.
 *
 * @param {Array} entries - Array of emission entries to validate
 * @param {Object} [options] - Batch validation options
 * @param {number} [options.maxEntries=1000] - Maximum number of entries allowed
 * @param {boolean} [options.stopOnFirst=false] - Stop on first invalid entry
 * @returns {ValidationResult} Result with value containing { validEntries, invalidEntries }
 *
 * @example
 * const result = validateEmissionEntries([
 *   { category: 'transport', type: 'car_petrol', amount: 50 },
 *   { category: 'invalid', type: 'foo', amount: -1 }
 * ]);
 * console.log(result.value.validEntries.length); // 1
 * console.log(result.value.invalidEntries.length); // 1
 */
export function validateEmissionEntries(entries, options = {}) {
  const { maxEntries = 1000, stopOnFirst = false } = options;

  if (!Array.isArray(entries)) {
    return ValidationResult.failure('Entries must be an array');
  }

  if (entries.length === 0) {
    return ValidationResult.failure('At least one emission entry is required');
  }

  if (entries.length > maxEntries) {
    return ValidationResult.failure(`Too many entries. Maximum allowed: ${maxEntries}`);
  }

  const validEntries = [];
  const invalidEntries = [];
  const allErrors = [];

  for (let i = 0; i < entries.length; i++) {
    const entryResult = validateEmissionEntry(entries[i]);

    if (entryResult.isValid) {
      validEntries.push(entryResult.value);
    } else {
      const indexedErrors = entryResult.errors.map(
        (err) => `Entry [${i}]: ${err}`
      );
      allErrors.push(...indexedErrors);
      invalidEntries.push({ index: i, entry: entries[i], errors: entryResult.errors });

      if (stopOnFirst) {
        break;
      }
    }
  }

  const hasInvalid = invalidEntries.length > 0;

  return new ValidationResult(
    !hasInvalid,
    { validEntries, invalidEntries },
    allErrors,
    hasInvalid
      ? [`${invalidEntries.length} of ${entries.length} entries failed validation`]
      : []
  );
}
