export const mealPackages = {
  'room-only': { label: 'Room only', price: 0 },
  breakfast: { label: 'Bed & breakfast', price: 20 },
  'half-board': { label: 'Half-board', price: 45 },
  'full-board': { label: 'Full-board', price: 70 },
  'all-inclusive': { label: 'All-inclusive', price: 110 },
};

export const addonServices = {
  airport_pickup: { label: 'Airport pickup', price: 40 },
  airport_dropoff: { label: 'Airport drop-off', price: 35 },
  spa: { label: 'Spa package', price: 85 },
  gym: { label: 'Gym access', price: 15 },
  tour: { label: 'Guided city tour', price: 60 },
  concierge_meeting: { label: 'Concierge meeting', price: 0 },
};

const parseJsonList = (value, fallback) => {
  try {
    if (!value) return fallback;
    if (Array.isArray(value)) return value;
    return JSON.parse(value);
  } catch (err) {
    return fallback;
  }
};

export const sanitizeAddons = (addons = []) => {
  const parsed = parseJsonList(addons, []);
  return parsed.filter((addon) => addonServices[addon]);
};

export const calculateExtrasTotal = ({ mealPackage, addons = [] }) => {
  const mealFee = mealPackage && mealPackages[mealPackage] ? mealPackages[mealPackage].price : 0;
  const extrasFee = sanitizeAddons(addons).reduce((sum, addon) => sum + (addonServices[addon]?.price || 0), 0);
  return mealFee + extrasFee;
};
