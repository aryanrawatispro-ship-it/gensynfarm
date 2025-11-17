// Different operational locations with realistic constraints
export const LOCATIONS = {
  bedroom: {
    id: 'bedroom',
    name: 'Bedroom',
    description: 'Your humble beginnings. Limited space and power.',
    maxGPUs: 2,
    maxPowerDraw: 500, // watts - typical bedroom circuit
    rentCost: 0, // living at home
    coolingEfficiency: 0.7, // not great
    noiseLimit: 60, // dB - neighbors will complain
    unlockCost: 0,
    monthlyUpkeep: 0,
  },
  basement: {
    id: 'basement',
    name: 'Basement',
    description: 'More space, better cooling. Still residential.',
    maxGPUs: 4,
    maxPowerDraw: 1500, // dedicated circuit
    rentCost: 200, // monthly
    coolingEfficiency: 0.85,
    noiseLimit: 75,
    unlockCost: 1000,
    monthlyUpkeep: 200,
  },
  garage: {
    id: 'garage',
    name: 'Garage',
    description: 'Dedicated space. Need climate control.',
    maxGPUs: 6,
    maxPowerDraw: 3000,
    rentCost: 500,
    coolingEfficiency: 0.9,
    noiseLimit: 85,
    unlockCost: 5000,
    monthlyUpkeep: 500,
  },
  colocation: {
    id: 'colocation',
    name: 'Colocation Rack',
    description: 'Professional data center space. Reliable power and cooling.',
    maxGPUs: 12,
    maxPowerDraw: 8000,
    rentCost: 1500,
    coolingEfficiency: 0.95,
    noiseLimit: 100, // data centers are loud
    unlockCost: 20000,
    monthlyUpkeep: 1500,
  },
  datacenter: {
    id: 'datacenter',
    name: 'Private Data Center',
    description: 'Your own facility. Sky is the limit.',
    maxGPUs: 50,
    maxPowerDraw: 50000,
    rentCost: 10000,
    coolingEfficiency: 0.98,
    noiseLimit: 120,
    unlockCost: 100000,
    monthlyUpkeep: 10000,
  },
};

export const getLocationById = (id) => LOCATIONS[id];
