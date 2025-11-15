import React from 'react';
import { useGame } from '../store/GameContext';
import { GPUS } from '../data/gpus';
import GPUMonitor from './GPUMonitor';
import './GPUPanel.css';

export default function GPUPanel() {
  const { state, dispatch } = useGame();

  const getActiveJob = (gpuId) => {
    return state.activeJobs.find(job => job.gpuId === gpuId);
  };

  const handleSellGPU = (gpuId) => {
    if (window.confirm('Are you sure you want to sell this GPU?')) {
      dispatch({ type: 'SELL_GPU', gpuId });
    }
  };

  const handleClearError = (gpuId) => {
    dispatch({ type: 'CLEAR_GPU_ERROR', gpuId });
  };

  return (
    <div className="gpu-panel">
      <h3>Your GPUs ({state.ownedGPUs.length})</h3>

      {state.ownedGPUs.length === 0 && (
        <div className="empty-state">
          No GPUs yet. Buy one from the shop!
        </div>
      )}

      <div className="gpu-list">
        {state.ownedGPUs.map(gpu => {
          const gpuData = GPUS[gpu.type];
          const activeJob = getActiveJob(gpu.id);

          return (
            <div key={gpu.id} className={`gpu-card ${gpu.status}`}>
              <div className="gpu-header">
                <div className="gpu-name">{gpuData.name}</div>
                <div className="gpu-specs-inline">
                  <span>{gpuData.vram}GB</span>
                  <span>{gpuData.powerDraw}W</span>
                </div>
              </div>

              {/* GPU Monitor visualization */}
              <GPUMonitor gpu={gpu} gpuData={gpuData} activeJob={activeJob} />

              <div className="gpu-actions">
                {gpu.status === 'error' && (
                  <button
                    className="restart-btn"
                    onClick={() => handleClearError(gpu.id)}
                  >
                    Force Restart
                  </button>
                )}
                <button
                  className="sell-btn"
                  onClick={() => handleSellGPU(gpu.id)}
                  disabled={activeJob || gpu.status === 'error'}
                >
                  Sell (${Math.floor(gpuData.resaleValue * (gpu.health / 100))})
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
