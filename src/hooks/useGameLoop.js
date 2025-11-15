import { useEffect, useRef } from 'react';
import { useGame } from '../store/GameContext';
import { generateJob } from '../data/jobs';
import { GPUS } from '../data/gpus';
import { LOCATIONS } from '../data/locations';

export function useGameLoop() {
  const { state, dispatch } = useGame();
  const lastTickRef = useRef(Date.now());
  const jobGenerationTimerRef = useRef(0);
  const powerBillTimerRef = useRef(0);
  const errorCheckTimerRef = useRef(0);

  useEffect(() => {
    if (state.isPaused) return;

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = (now - lastTickRef.current) / 1000; // seconds
      lastTickRef.current = now;

      const adjustedDelta = deltaTime * state.gameSpeed;

      // Update game time
      dispatch({ type: 'TICK_TIME', deltaTime: adjustedDelta });

      // Update active jobs progress
      state.activeJobs.forEach(job => {
        const gpu = state.ownedGPUs.find(g => g.id === job.gpuId);
        if (!gpu) return;

        // Skip if GPU has an error
        if (gpu.status === 'error') return;

        const gpuData = GPUS[gpu.type];
        const timeMultiplier = gpuData.performance / 100;
        const progressIncrement = (adjustedDelta / job.baseTime) * timeMultiplier;
        const newProgress = Math.min(1, job.progress + progressIncrement);

        dispatch({
          type: 'UPDATE_JOB_PROGRESS',
          jobId: job.id,
          progress: newProgress,
        });

        // Update GPU temperature and wear
        const location = LOCATIONS[state.currentLocation];
        const baseTemp = 25 + (job.powerMultiplier * gpuData.heatOutput * 0.15);
        const cooledTemp = baseTemp * (1 - location.coolingEfficiency * 0.3);

        const hoursUsed = gpu.hoursUsed + (adjustedDelta / 3600);
        const wearRate = cooledTemp > 80 ? 0.001 : 0.0005;
        const newHealth = Math.max(0, gpu.health - (wearRate * adjustedDelta));

        // Determine GPU status
        let gpuStatus = 'running';
        if (cooledTemp > 90) {
          gpuStatus = 'overheating';
        }

        dispatch({
          type: 'UPDATE_GPU_STATS',
          gpuId: gpu.id,
          temperature: Math.round(cooledTemp),
          health: newHealth,
          hoursUsed,
          status: gpuStatus,
        });

        // Complete job when done
        if (newProgress >= 1) {
          const failed = cooledTemp > 90 || gpu.health < 50;
          dispatch({ type: 'COMPLETE_JOB', jobId: job.id, failed });
        }
      });

      // Update idle GPUs (set status to idle and cool down)
      state.ownedGPUs.forEach(gpu => {
        const isIdle = !state.activeJobs.find(j => j.gpuId === gpu.id);
        if (isIdle && gpu.status !== 'error' && gpu.status !== 'idle') {
          // Cool down to room temp
          const newTemp = Math.max(25, gpu.temperature - (adjustedDelta * 5));
          dispatch({
            type: 'UPDATE_GPU_STATS',
            gpuId: gpu.id,
            temperature: Math.round(newTemp),
            health: gpu.health,
            hoursUsed: gpu.hoursUsed,
            status: 'idle',
          });
        }
      });

      // Generate new jobs periodically
      jobGenerationTimerRef.current += adjustedDelta;
      if (jobGenerationTimerRef.current >= 15) { // every 15 seconds
        jobGenerationTimerRef.current = 0;

        // Don't flood with jobs
        if (state.availableJobs.length < 5) {
          const maxVRAM = Math.max(...state.ownedGPUs.map(gpu => GPUS[gpu.type].vram));
          const job = generateJob(maxVRAM);

          if (job) {
            dispatch({ type: 'ADD_AVAILABLE_JOB', job });

            // Jobs expire after 60 seconds
            setTimeout(() => {
              dispatch({ type: 'REMOVE_EXPIRED_JOB', jobId: job.id });
            }, 60000);
          }
        }
      }

      // Calculate power costs every game "hour" (every 60 seconds real time at 1x speed)
      powerBillTimerRef.current += adjustedDelta;
      if (powerBillTimerRef.current >= 60) {
        powerBillTimerRef.current = 0;

        // Calculate total power draw
        let totalPowerDraw = 0;
        state.activeJobs.forEach(job => {
          const gpu = state.ownedGPUs.find(g => g.id === job.gpuId);
          if (gpu) {
            const gpuData = GPUS[gpu.type];
            totalPowerDraw += gpuData.powerDraw * job.powerMultiplier;
          }
        });

        // Idle GPUs still consume some power
        const idleGPUs = state.ownedGPUs.filter(
          gpu => !state.activeJobs.find(j => j.gpuId === gpu.id)
        );
        idleGPUs.forEach(gpu => {
          const gpuData = GPUS[gpu.type];
          totalPowerDraw += gpuData.powerDraw * 0.1; // 10% idle power
        });

        // Convert watts to kWh and calculate cost
        const kWh = totalPowerDraw / 1000;
        const hourlyCost = kWh * state.electricityCost;

        if (hourlyCost > 0) {
          dispatch({ type: 'ADD_POWER_COST', cost: hourlyCost });
        }

        // Location upkeep (monthly, but we'll charge it hourly for game pacing)
        const location = LOCATIONS[state.currentLocation];
        const hourlyUpkeep = location.monthlyUpkeep / 720; // 720 hours in a month
        if (hourlyUpkeep > 0) {
          dispatch({ type: 'ADD_POWER_COST', cost: hourlyUpkeep });
        }
      }

      // Random error generation (check every 10 seconds)
      errorCheckTimerRef.current += adjustedDelta;
      if (errorCheckTimerRef.current >= 10) {
        errorCheckTimerRef.current = 0;

        state.ownedGPUs.forEach(gpu => {
          // Skip if already in error state
          if (gpu.status === 'error') {
            // Auto-recover after 30 seconds
            if (gpu.errorTime && Date.now() - gpu.errorTime > 30000) {
              dispatch({ type: 'CLEAR_GPU_ERROR', gpuId: gpu.id });
            }
            return;
          }

          const gpuData = GPUS[gpu.type];
          const isRunning = state.activeJobs.find(j => j.gpuId === gpu.id);

          if (!isRunning) return; // Only running GPUs can error

          // Calculate error probability based on conditions
          let errorChance = 0.001; // 0.1% base chance per check

          // Temperature-based errors
          if (gpu.temperature > 85) {
            errorChance += 0.01; // +1% if hot
          }
          if (gpu.temperature > 92) {
            errorChance += 0.05; // +5% if critical temp
          }

          // Health-based errors
          if (gpu.health < 50) {
            errorChance += 0.02; // +2% if poor health
          }
          if (gpu.health < 20) {
            errorChance += 0.05; // +5% if critical health
          }

          // Roll for error
          if (Math.random() < errorChance) {
            // Determine error type based on conditions
            let errorType;
            const rand = Math.random();

            if (gpu.temperature > 90) {
              errorType = rand > 0.5 ? 'thermal_shutdown' : 'driver_crash';
            } else if (gpu.health < 30) {
              errorType = rand > 0.5 ? 'vram_error' : 'driver_crash';
            } else {
              const types = ['vram_error', 'driver_crash', 'power_spike'];
              errorType = types[Math.floor(Math.random() * types.length)];
            }

            dispatch({
              type: 'SET_GPU_ERROR',
              gpuId: gpu.id,
              errorType,
            });
          }
        });
      }
    };

    const intervalId = setInterval(gameLoop, 1000 / 30); // 30 FPS game loop

    return () => clearInterval(intervalId);
  }, [state, dispatch]);
}
