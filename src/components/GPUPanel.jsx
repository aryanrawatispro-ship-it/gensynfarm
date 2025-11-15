import React from 'react';
import { useGame } from '../store/GameContext';
import { GPUS } from '../data/gpus';
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
            <div key={gpu.id} className={`gpu-card ${activeJob ? 'active' : 'idle'}`}>
              <div className="gpu-header">
                <div className="gpu-name">{gpuData.name}</div>
                <div className="gpu-status">
                  {activeJob ? 'BUSY' : 'IDLE'}
                </div>
              </div>

              <div className="gpu-specs">
                <div className="spec-item">
                  <span className="spec-label">VRAM:</span>
                  <span className="spec-value">{gpuData.vram}GB</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Perf:</span>
                  <span className="spec-value">{gpuData.performance}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Power:</span>
                  <span className="spec-value">{gpuData.powerDraw}W</span>
                </div>
              </div>

              <div className="gpu-health">
                <div className="health-bar">
                  <div
                    className="health-fill"
                    style={{
                      width: `${gpu.health}%`,
                      background: gpu.health > 70 ? '#00ff88' : gpu.health > 40 ? '#ffaa00' : '#ff4444'
                    }}
                  />
                </div>
                <span className="health-text">{gpu.health.toFixed(1)}%</span>
              </div>

              <div className="gpu-temp">
                <span className={`temp-value ${gpu.temperature > 80 ? 'hot' : ''}`}>
                  {gpu.temperature}°C
                </span>
                {gpu.temperature > 85 && (
                  <span className="warning">⚠ THERMAL THROTTLING</span>
                )}
              </div>

              {activeJob && (
                <div className="gpu-job">
                  <div className="job-name">{activeJob.name}</div>
                  <div className="job-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${activeJob.progress * 100}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      {(activeJob.progress * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}

              <div className="gpu-actions">
                <button
                  className="sell-btn"
                  onClick={() => handleSellGPU(gpu.id)}
                  disabled={activeJob}
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
