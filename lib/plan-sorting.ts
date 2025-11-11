/**
 * Plan sorting utilities
 * Sort plans by relevance to user's location
 */

import { Plan } from '../types';
import { UserLocation } from '../hooks/useLocation';

// Continent code mappings
const CONTINENT_REGIONS: Record<string, string[]> = {
  NA: ['US', 'CA', 'MX', 'NA'], // North America
  SA: ['BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'SA'], // South America
  EU: ['GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'FI', 'GR', 'EU'], // Europe
  AS: ['JP', 'CN', 'IN', 'SG', 'HK', 'TH', 'MY', 'ID', 'PH', 'KR', 'AS'], // Asia
  OC: ['AU', 'NZ', 'OC'], // Oceania
  AF: ['ZA', 'EG', 'NG', 'KE', 'AF'], // Africa
  ME: ['AE', 'SA', 'IL', 'TR', 'ME'], // Middle East
};

/**
 * Calculate relevance score for a plan based on user's location
 * Higher score = more relevant
 */
export function calculatePlanRelevance(plan: Plan, userLocation: UserLocation): number {
  const planRegion = plan.region_code.toUpperCase();
  const userCountry = userLocation.country_code.toUpperCase();
  const userContinent = userLocation.continent_code.toUpperCase();

  // Score: 100 = exact country match
  if (planRegion === userCountry) {
    return 100;
  }

  // Score: 90 = plan region contains user's country
  if (planRegion.includes(userCountry)) {
    return 90;
  }

  // Score: 80 = continental match (e.g., EU plans for European users)
  const continentRegions = CONTINENT_REGIONS[userContinent] || [];
  if (continentRegions.some(region => planRegion.includes(region))) {
    return 80;
  }

  // Score: 70 = global/worldwide plans
  if (planRegion.includes('GLOBAL') || planRegion.includes('WORLD') || planRegion.includes('INT')) {
    return 70;
  }

  // Score: 60 = regional plans (e.g., "Europe 40+ countries")
  if (planRegion.includes('EU') && userContinent === 'EU') {
    return 60;
  }
  if (planRegion.includes('ASIA') && userContinent === 'AS') {
    return 60;
  }

  // Score: 50 = neighboring countries (approximate based on continent)
  if (continentRegions.some(region => planRegion === region)) {
    return 50;
  }

  // Score: 0 = no relevance
  return 0;
}

/**
 * Sort plans by relevance to user's location
 */
export function sortPlansByLocation(plans: Plan[], userLocation: UserLocation | null): Plan[] {
  if (!userLocation) {
    return plans; // No sorting if location unknown
  }

  // Calculate relevance scores
  const plansWithScores = plans.map(plan => ({
    plan,
    score: calculatePlanRelevance(plan, userLocation),
  }));

  // Sort by score (descending), then by price (ascending)
  plansWithScores.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score; // Higher score first
    }
    // Same relevance, sort by price
    return a.plan.retail_price - b.plan.retail_price;
  });

  return plansWithScores.map(item => item.plan);
}

/**
 * Get section headers for grouped plans
 */
export function getPlanSections(plans: Plan[], userLocation: UserLocation | null): Array<{
  title: string;
  data: Plan[];
}> {
  if (!userLocation) {
    return [{ title: 'All Plans', data: plans }];
  }

  const sortedPlans = sortPlansByLocation(plans, userLocation);

  const sections: Array<{ title: string; data: Plan[] }> = [];

  // Local plans (score >= 80)
  const localPlans = sortedPlans.filter(plan =>
    calculatePlanRelevance(plan, userLocation) >= 80
  );
  if (localPlans.length > 0) {
    sections.push({
      title: `📍 Plans for ${userLocation.country_name}`,
      data: localPlans,
    });
  }

  // Regional/Global plans (score 50-79)
  const regionalPlans = sortedPlans.filter(plan => {
    const score = calculatePlanRelevance(plan, userLocation);
    return score >= 50 && score < 80;
  });
  if (regionalPlans.length > 0) {
    sections.push({
      title: '🌍 Regional & Global Plans',
      data: regionalPlans,
    });
  }

  // Other plans (score < 50)
  const otherPlans = sortedPlans.filter(plan =>
    calculatePlanRelevance(plan, userLocation) < 50
  );
  if (otherPlans.length > 0) {
    sections.push({
      title: '🗺️ Other Destinations',
      data: otherPlans,
    });
  }

  return sections;
}
