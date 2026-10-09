import { calculateHaversineDistance } from './distance.js';

/**
 * Match the best suitable nearby processing hub for a given waste report
 * @param {Array} hubs List of ProcessingHub objects
 * @param {String} category Waste category
 * @param {Number} quantityKg Waste weight in kg
 * @param {Number} lat Pickup latitude
 * @param {Number} lng Pickup longitude
 * @returns {Object|null} { hub, distanceKm } or null if no suitable hub found
 */
export function matchBestProcessingHub(hubs, category, quantityKg, lat, lng) {
  if (!hubs || !Array.isArray(hubs) || hubs.length === 0) {
    return null;
  }

  // Extract category array
  let categoryList = [];
  if (Array.isArray(category)) {
    categoryList = category;
  } else if (typeof category === 'string') {
    categoryList = category.split(',').map((c) => c.trim()).filter(Boolean);
  }

  // 1. Filter active hubs accepting the requested categories
  const suitableHubs = hubs.filter((hub) => {
    const isActive = hub.status === 'active';
    if (!isActive || !hub.acceptedCategories) return false;
    return hub.acceptedCategories.some(
      (acc) => categoryList.includes(acc) || acc === 'Mixed Waste' || categoryList.includes('Mixed Waste')
    );
  });

  if (suitableHubs.length === 0) {
    return null;
  }

  // 2. Prefer hubs with available capacity (capacityKgPerDay > currentStockKg)
  const capacityAvailableHubs = suitableHubs.filter((hub) => {
    const cap = hub.capacityKgPerDay || 1000;
    const stock = hub.currentStockKg || 0;
    return (cap - stock) >= (quantityKg || 0);
  });

  // Use capacityAvailableHubs if any exist, otherwise fallback to suitableHubs
  const candidateHubs = capacityAvailableHubs.length > 0 ? capacityAvailableHubs : suitableHubs;

  // 3. Compute distance and find closest hub
  let closestHub = null;
  let minDistance = Infinity;

  for (const hub of candidateHubs) {
    const hubLat = hub.location?.latitude || 0;
    const hubLng = hub.location?.longitude || 0;
    const dist = calculateHaversineDistance(lat, lng, hubLat, hubLng);

    if (dist < minDistance) {
      minDistance = dist;
      closestHub = hub;
    }
  }

  if (!closestHub) return null;

  return {
    hub: closestHub,
    distanceKm: minDistance,
  };
}
