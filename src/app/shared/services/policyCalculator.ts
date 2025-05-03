/**
 * Policy calculator service
 * Calculates legal policy costs based on rent amount and policy type
 */

// Policy ranges with their corresponding costs (IVA included)
type PolicyRange = [number, number];
type PolicyCost = number | string;
type PolicyTable = [PolicyRange, PolicyCost][];

// Policy tables by type
const POLICY_TABLES = {
  kanun: [
    [[3000, 3999], 1400.00],
    [[4000, 4999], 1800.00],
    [[5000, 5999], 2200.00],
    [[6000, 6999], 2600.00],
    [[7000, 7999], 3000.00],
    [[8000, 9999], 3200.00],
    [[10000, 14999], 4000.00],
    [[15000, 19999], 5250.00],
    [[20000, 24999], 7600.00],
    [[25000, 29999], 9650.00],
    [[30000, 34999], 10400.00],
    [[35000, 39999], 13350.00],
    [[40000, 44999], 15100.00],
    [[45000, 49999], 17900.00],
    [[50000, 54999], 20000.00],
    [[55000, 59999], 22400.00],
    [[60000, Infinity], "30%"], // Percentage applies
  ] as PolicyTable,
  
  elemental: [
    [[3000, 3999], 1150.00],
    [[4000, 4999], 1500.00],
    [[5000, 5999], 1800.00],
    [[6000, 6999], 2150.00],
    [[7000, 7999], 2400.00],
    [[8000, 9999], 2800.00],
    [[10000, 14999], 3160.00],
    [[15000, 19999], 3600.00],
    [[20000, 24999], 4300.00],
    [[25000, 29999], 5400.00],
    [[30000, 34999], 6500.00],
    [[35000, 39999], 7500.00],
    [[40000, 44999], 8900.00],
    [[45000, 49999], 10000.00],
    [[50000, 54999], 11000.00],
    [[55000, 59999], 12000.00],
    [[60000, Infinity], "20%"], // Percentage applies
  ] as PolicyTable,
};

// Percentage values for high-value rents
const POLICY_PERCENTAGES = {
  kanun: 0.30, // 30%
  elemental: 0.20, // 20%
};

/**
 * Calculate the policy cost based on rent amount and policy type
 * @param rent - Monthly rent amount
 * @param type - Policy type ('kanun' or 'elemental')
 * @returns The policy cost
 */
export function calculatePolicyCost(rent: number, type: 'kanun' | 'elemental' = 'elemental'): number {
  // Input validation
  if (rent <= 0) {
    throw new Error('Rent amount must be greater than zero');
  }
  
  // Get the appropriate policy table
  const policyTable = POLICY_TABLES[type];
  
  // Handle high-value rents (≥ $60,000)
  if (rent >= 60000) {
    return rent * POLICY_PERCENTAGES[type];
  }
  
  // Find the matching range in the table
  for (const [range, cost] of policyTable) {
    const [min, max] = range;
    if (rent >= min && rent <= max) {
      return typeof cost === 'string' 
        ? rent * parseFloat(cost) / 100 // Handle percentages
        : cost;
    }
  }
  
  // Fallback for rents below the minimum range (should not happen with current tables)
  return policyTable[0][1] as number;
}

/**
 * Calculate discounted policy cost
 * @param rent - Monthly rent amount
 * @param type - Policy type ('kanun' or 'elemental')
 * @param discountPercent - Discount percentage (0-100)
 * @returns The discounted policy cost
 */
export function calculateDiscountedPolicyCost(
  rent: number, 
  type: 'kanun' | 'elemental' = 'elemental',
  discountPercent: number = 35
): number {
  const originalCost = calculatePolicyCost(rent, type);
  return originalCost * (1 - discountPercent / 100);
}

export default {
  calculatePolicyCost,
  calculateDiscountedPolicyCost,
  POLICY_TABLES,
  POLICY_PERCENTAGES
};
