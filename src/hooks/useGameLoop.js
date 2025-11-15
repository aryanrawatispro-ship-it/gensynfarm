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

        dispatch({
          type: 'UPDATE_GPU_STATS',
          gpuId: gpu.id,
          temperature: Math.round(cooledTemp),
          health: newHealth,
          hoursUsed,
        });

        // Complete job when done
        if (newProgress >= 1) {
          const failed = cooledTemp > 90 || gpu.health < 50;
          dispatch({ type: 'COMPLETE_JOB', jobId: job.id, failed });
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
    };

    const intervalId = setInterval(gameLoop, 1000 / 30); // 30 FPS game loop

    return () => clearInterval(intervalId);
  }, [state, dispatch]);
}
