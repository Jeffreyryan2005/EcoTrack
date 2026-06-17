/**
 * @module a11y
 * @description Accessibility utilities for WCAG 2.1 AA compliance
 */

/**
 * Creates live regions for screen reader announcements on initialization
 */
export function setupAccessibility() {
  if (!document.getElementById('a11y-live-region-polite')) {
    const politeRegion = document.createElement('div');
    politeRegion.id = 'a11y-live-region-polite';
    politeRegion.setAttribute('aria-live', 'polite');
    politeRegion.setAttribute('aria-atomic', 'true');
    politeRegion.className = 'sr-only';
    document.body.appendChild(politeRegion);
  }

  if (!document.getElementById('a11y-live-region-assertive')) {
    const assertiveRegion = document.createElement('div');
    assertiveRegion.id = 'a11y-live-region-assertive';
    assertiveRegion.setAttribute('aria-live', 'assertive');
    assertiveRegion.setAttribute('aria-atomic', 'true');
    assertiveRegion.className = 'sr-only';
    document.body.appendChild(assertiveRegion);
  }
}

/**
 * Announces a message to screen readers
 * @param {string} message - The message to announce
 * @param {'polite'|'assertive'} priority - Announcement priority
 */
export function announceToScreenReader(message, priority = 'polite') {
  const regionId = priority === 'assertive' 
    ? 'a11y-live-region-assertive' 
    : 'a11y-live-region-polite';
  
  const region = document.getElementById(regionId);
  if (region) {
    // Clear and set to trigger screen reader
    region.textContent = '';
    setTimeout(() => {
      region.textContent = message;
    }, 50);
  }
}

let focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
let trapElement = null;
let previousFocus = null;

/**
 * Traps focus within a specific element (useful for modals)
 * @param {HTMLElement} element - The element to trap focus within
 */
export function trapFocus(element) {
  if (!element) return;
  
  previousFocus = document.activeElement;
  trapElement = element;
  
  const focusableElements = element.querySelectorAll(focusableElementsString);
  if (focusableElements.length === 0) return;
  
  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];
  
  element.addEventListener('keydown', handleTrapKeydown);
  firstFocusableElement.focus();
}

/**
 * Releases the current focus trap
 */
export function releaseFocus() {
  if (trapElement) {
    trapElement.removeEventListener('keydown', handleTrapKeydown);
    trapElement = null;
  }
  
  if (previousFocus && typeof previousFocus.focus === 'function') {
    previousFocus.focus();
    previousFocus = null;
  }
}

function handleTrapKeydown(e) {
  const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
  
  if (!isTabPressed || !trapElement) {
    return;
  }
  
  const focusableElements = trapElement.querySelectorAll(focusableElementsString);
  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];
  
  if (e.shiftKey) { // shift + tab
    if (document.activeElement === firstFocusableElement) {
      lastFocusableElement.focus();
      e.preventDefault();
    }
  } else { // tab
    if (document.activeElement === lastFocusableElement) {
      firstFocusableElement.focus();
      e.preventDefault();
    }
  }
}

/**
 * Handles arrow key navigation for a list of items
 * @param {KeyboardEvent} event - The keyboard event
 * @param {NodeList|Array} items - List of focusable items
 * @param {number} currentIndex - Current focused index
 * @returns {number} The new index that was focused
 */
export function handleKeyboardNavigation(event, items, currentIndex) {
  let newIndex = currentIndex;
  
  switch(event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      event.preventDefault();
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      event.preventDefault();
      break;
    case 'Home':
      newIndex = 0;
      event.preventDefault();
      break;
    case 'End':
      newIndex = items.length - 1;
      event.preventDefault();
      break;
  }
  
  if (newIndex !== currentIndex && items[newIndex]) {
    items[newIndex].focus();
  }
  
  return newIndex;
}

/**
 * Checks if the user prefers reduced motion
 * @returns {boolean} True if motion should be reduced
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Ensures all elements in a container with an ID are unique
 * @param {HTMLElement} container 
 */
export function ensureUniqueIds(container) {
  const elementsWithId = container.querySelectorAll('[id]');
  const ids = new Set();
  
  elementsWithId.forEach(el => {
    if (ids.has(el.id)) {
      console.warn(`Duplicate ID found: ${el.id}. This violates accessibility standards.`);
      // Auto-fix by appending random string
      el.id = `${el.id}-${Math.random().toString(36).substr(2, 5)}`;
    }
    ids.add(el.id);
  });
}
