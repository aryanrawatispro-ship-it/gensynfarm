// Realistic upgrades for improving operations
export const UPGRADES = {
  better_cooling: {
    id: 'better_cooling',
    name: 'Improved Cooling System',
    description: 'Better fans and airflow. Reduces thermal throttling.',
    cost: 500,
    effect: { coolingBonus: 0.1 },
    unlockCost: 2000,
  },
  ac_unit: {
    id: 'ac_unit',
    name: 'Air Conditioning Unit',
    description: 'Keep temps down in summer. Higher power bill.',
    cost: 1500,
    effect: { coolingBonus: 0.2, powerCostIncrease: 50 },
    unlockCost: 5000,
  },
  ups_system: {
    id: 'ups_system',
    name: 'UPS System',
    description: 'Backup power. Prevents job failures from power fluctuations.',
    cost: 1000,
    effect: { failureReduction: 0.3 },
    unlockCost: 3000,
  },
  monitoring_software: {
    id: 'monitoring_software',
    name: 'Monitoring Software',
    description: 'Better visibility into GPU performance and health.',
    cost: 200,
    effect: { earlyWarning: true },
    unlockCost: 1000,
  },
  network_upgrade: {
    id: 'network_upgrade',
    name: '10Gbps Network',
    description: 'Faster data transfer for large model downloads.',
    cost: 800,
    effect: { jobTimeReduction: 0.1 },
    unlockCost: 5000,
  },
  automated_bidding: {
    id: 'automated_bidding',
    name: 'Automated Bidding System',
    description: 'Algorithm optimizes your bids for maximum profit.',
    cost: 1500,
    effect: { biddingEfficiency: 0.15 },
    unlockCost: 10000,
  },
};

export const getUpgradeById = (id) => UPGRADES[id];
