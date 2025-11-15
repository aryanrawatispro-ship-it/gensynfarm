import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GPUS } from '../data/gpus';
import { LOCATIONS } from '../data/locations';
import { generateJob } from '../data/jobs';

const GameContext = createContext();

const INITIAL_STATE = {
  // Player stats
  money: 500, // starting cash
  totalEarnings: 0,
  reputation: 0,

  // Location
  currentLocation: 'bedroom',
  ownedLocations: ['bedroom'],

  // Hardware
  ownedGPUs: [
    {
      id: 'gpu_0',
      type: 'rtx3060',
      health: 100,
      temperature: 25,
      hoursUsed: 0,
      status: 'idle', // idle, running, error, overheating
      errorType: null, // vram_error, driver_crash, thermal_shutdown, power_spike
      errorTime: null,
    }
  ],

  // Jobs
  availableJobs: [],
  activeJobs: [],
  completedJobs: 0,
  failedJobs: 0,

  // Upgrades
  ownedUpgrades: [],

  // Economics
  electricityCost: 0.12, // $ per kWh
  totalPowerCost: 0,

  // Game time
  gameTime: 0, // seconds since start
  isPaused: false,
  gameSpeed: 1, // 1x, 2x, 3x

  // Tutorial/progression
  tutorialComplete: false,
  unlockedFeatures: ['basic_jobs'],
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'BUY_GPU': {
      const gpu = GPUS[action.gpuType];
      if (state.money < gpu.price) return state;

      const location = LOCATIONS[state.currentLocation];
      if (state.ownedGPUs.length >= location.maxGPUs) return state;

      return {
        ...state,
        money: state.money - gpu.price,
        ownedGPUs: [
          ...state.ownedGPUs,
          {
            id: `gpu_${Date.now()}`,
            type: action.gpuType,
            health: 100,
            temperature: 25,
            hoursUsed: 0,
            status: 'idle',
            errorType: null,
            errorTime: null,
          }
        ],
      };
    }

    case 'SELL_GPU': {
      const gpu = state.ownedGPUs.find(g => g.id === action.gpuId);
      if (!gpu) return state;

      const gpuData = GPUS[gpu.type];
      const healthMultiplier = gpu.health / 100;
      const sellPrice = Math.floor(gpuData.resaleValue * healthMultiplier);

      return {
        ...state,
        money: state.money + sellPrice,
        ownedGPUs: state.ownedGPUs.filter(g => g.id !== action.gpuId),
        activeJobs: state.activeJobs.filter(j => j.gpuId !== action.gpuId),
      };
    }

    case 'ACCEPT_JOB': {
      const job = state.availableJobs.find(j => j.id === action.jobId);
      if (!job) return state;

      const availableGPU = state.ownedGPUs.find(gpu => {
        const gpuData = GPUS[gpu.type];
        const isNotBusy = !state.activeJobs.find(j => j.gpuId === gpu.id);
        return gpuData.vram >= job.minVRAM && isNotBusy;
      });

      if (!availableGPU) return state;

      return {
        ...state,
        availableJobs: state.availableJobs.filter(j => j.id !== action.jobId),
        activeJobs: [
          ...state.activeJobs,
          {
            ...job,
            gpuId: availableGPU.id,
            startedAt: Date.now(),
            progress: 0,
          }
        ],
      };
    }

    case 'UPDATE_JOB_PROGRESS': {
      return {
        ...state,
        activeJobs: state.activeJobs.map(job => {
          if (job.id === action.jobId) {
            return { ...job, progress: action.progress };
          }
          return job;
        }),
      };
    }

    case 'COMPLETE_JOB': {
      const job = state.activeJobs.find(j => j.id === action.jobId);
      if (!job) return state;

      const success = Math.random() > (action.failed ? 1 : job.failureChance);

      if (success) {
        return {
          ...state,
          money: state.money + job.basePay,
          totalEarnings: state.totalEarnings + job.basePay,
          reputation: state.reputation + 1,
          completedJobs: state.completedJobs + 1,
          activeJobs: state.activeJobs.filter(j => j.id !== action.jobId),
        };
      } else {
        return {
          ...state,
          reputation: Math.max(0, state.reputation - 2),
          failedJobs: state.failedJobs + 1,
          activeJobs: state.activeJobs.filter(j => j.id !== action.jobId),
        };
      }
    }

    case 'ADD_AVAILABLE_JOB': {
      return {
        ...state,
        availableJobs: [...state.availableJobs, action.job],
      };
    }

    case 'REMOVE_EXPIRED_JOB': {
      return {
        ...state,
        availableJobs: state.availableJobs.filter(j => j.id !== action.jobId),
      };
    }

    case 'BUY_LOCATION': {
      const location = LOCATIONS[action.locationId];
      if (state.money < location.unlockCost) return state;

      return {
        ...state,
        money: state.money - location.unlockCost,
        ownedLocations: [...state.ownedLocations, action.locationId],
      };
    }

    case 'CHANGE_LOCATION': {
      if (!state.ownedLocations.includes(action.locationId)) return state;

      return {
        ...state,
        currentLocation: action.locationId,
      };
    }

    case 'BUY_UPGRADE': {
      const upgrade = action.upgrade;
      if (state.money < upgrade.cost) return state;
      if (state.ownedUpgrades.includes(upgrade.id)) return state;

      return {
        ...state,
        money: state.money - upgrade.cost,
        ownedUpgrades: [...state.ownedUpgrades, upgrade.id],
      };
    }

    case 'UPDATE_GPU_STATS': {
      return {
        ...state,
        ownedGPUs: state.ownedGPUs.map(gpu => {
          if (gpu.id === action.gpuId) {
            return {
              ...gpu,
              temperature: action.temperature,
              health: action.health,
              hoursUsed: action.hoursUsed,
              status: action.status || gpu.status,
            };
          }
          return gpu;
        }),
      };
    }

    case 'SET_GPU_ERROR': {
      return {
        ...state,
        ownedGPUs: state.ownedGPUs.map(gpu => {
          if (gpu.id === action.gpuId) {
            return {
              ...gpu,
              status: 'error',
              errorType: action.errorType,
              errorTime: Date.now(),
            };
          }
          return gpu;
        }),
        // Cancel any active jobs on this GPU
        activeJobs: state.activeJobs.filter(j => j.gpuId !== action.gpuId),
        failedJobs: state.failedJobs + (state.activeJobs.find(j => j.gpuId === action.gpuId) ? 1 : 0),
      };
    }

    case 'CLEAR_GPU_ERROR': {
      return {
        ...state,
        ownedGPUs: state.ownedGPUs.map(gpu => {
          if (gpu.id === action.gpuId) {
            return {
              ...gpu,
              status: 'idle',
              errorType: null,
              errorTime: null,
            };
          }
          return gpu;
        }),
      };
    }

    case 'TICK_TIME': {
      return {
        ...state,
        gameTime: state.gameTime + action.deltaTime,
      };
    }

    case 'SET_GAME_SPEED': {
      return {
        ...state,
        gameSpeed: action.speed,
      };
    }

    case 'TOGGLE_PAUSE': {
      return {
        ...state,
        isPaused: !state.isPaused,
      };
    }

    case 'ADD_POWER_COST': {
      return {
        ...state,
        totalPowerCost: state.totalPowerCost + action.cost,
        money: state.money - action.cost,
      };
    }

    case 'LOAD_SAVE': {
      return {
        ...action.saveData,
      };
    }

    case 'RESET_GAME': {
      return INITIAL_STATE;
    }

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  // Auto-save every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('gensynfarm_save', JSON.stringify(state));
    }, 10000);

    return () => clearInterval(interval);
  }, [state]);

  // Load save on mount
  useEffect(() => {
    const saved = localStorage.getItem('gensynfarm_save');
    if (saved) {
      try {
        const saveData = JSON.parse(saved);
        dispatch({ type: 'LOAD_SAVE', saveData });
      } catch (e) {
        console.error('Failed to load save:', e);
      }
    }
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
