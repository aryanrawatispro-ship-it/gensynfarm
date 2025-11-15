import React from 'react';
import './GPUMonitor.css';

export default function GPUMonitor({ gpu, gpuData, activeJob }) {
  const getStatusColor = () => {
    if (gpu.status === 'error') return '#ff0000';
    if (gpu.status === 'overheating') return '#ff6600';
    if (gpu.status === 'running') return '#00ff00';
    return '#888888'; // idle
  };

  const getStatusText = () => {
    if (gpu.status === 'error') return gpu.errorType?.replace(/_/g, ' ').toUpperCase();
    if (gpu.status === 'overheating') return 'OVERHEATING';
    if (gpu.status === 'running') return 'RUNNING';
    return 'IDLE';
  };

  const getErrorMessage = () => {
    const messages = {
      vram_error: 'VRAM allocation failed. Job halted.',
      driver_crash: 'Driver crashed. Restarting...',
      thermal_shutdown: 'Critical temp! Emergency shutdown.',
      power_spike: 'Power surge detected. GPU offline.',
    };
    return messages[gpu.errorType] || 'Unknown error';
  };

  return (
    <div className={`gpu-monitor ${gpu.status}`}>
      <div className="monitor-screen">
        {/* Status indicator light */}
        <div className="status-light-container">
          <div
            className={`status-light ${gpu.status}`}
            style={{
              backgroundColor: getStatusColor(),
              boxShadow: `0 0 20px ${getStatusColor()}`
            }}
          >
            <div className="light-pulse" style={{ backgroundColor: getStatusColor() }} />
          </div>
          <div className="status-label">{getStatusText()}</div>
        </div>

        {/* GPU visualization */}
        <div className="gpu-visual">
          <div className="gpu-icon">
            <div className="gpu-chip" />
            <div className="gpu-pcb" />
            <div className="gpu-fans">
              <div className={`fan ${gpu.status === 'running' || gpu.status === 'overheating' ? 'spinning' : ''}`} />
              <div className={`fan ${gpu.status === 'running' || gpu.status === 'overheating' ? 'spinning' : ''}`} />
            </div>
          </div>

          {/* Stats bars */}
          <div className="stat-bars">
            <div className="stat-bar">
              <div className="stat-bar-label">TEMP</div>
              <div className="stat-bar-container">
                <div
                  className="stat-bar-fill temp"
                  style={{
                    width: `${Math.min(100, (gpu.temperature / 100) * 100)}%`,
                    backgroundColor: gpu.temperature > 85 ? '#ff0000' : gpu.temperature > 70 ? '#ff6600' : '#00ff00'
                  }}
                />
              </div>
              <div className="stat-bar-value">{gpu.temperature}°C</div>
            </div>

            <div className="stat-bar">
              <div className="stat-bar-label">UTIL</div>
              <div className="stat-bar-container">
                <div
                  className="stat-bar-fill util"
                  style={{
                    width: activeJob ? `${activeJob.progress * 100}%` : '0%',
                    backgroundColor: '#00aaff'
                  }}
                />
              </div>
              <div className="stat-bar-value">{activeJob ? `${(activeJob.progress * 100).toFixed(0)}%` : '0%'}</div>
            </div>

            <div className="stat-bar">
              <div className="stat-bar-label">HLTH</div>
              <div className="stat-bar-container">
                <div
                  className="stat-bar-fill health"
                  style={{
                    width: `${gpu.health}%`,
                    backgroundColor: gpu.health > 70 ? '#00ff00' : gpu.health > 40 ? '#ffaa00' : '#ff0000'
                  }}
                />
              </div>
              <div className="stat-bar-value">{gpu.health.toFixed(0)}%</div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {gpu.status === 'error' && (
          <div className="error-message">
            <div className="error-icon">⚠</div>
            <div className="error-text">{getErrorMessage()}</div>
            <div className="error-recovery">Auto-recovering in {Math.max(0, 30 - Math.floor((Date.now() - gpu.errorTime) / 1000))}s</div>
          </div>
        )}

        {/* Active job info */}
        {activeJob && gpu.status !== 'error' && (
          <div className="job-info">
            <div className="job-info-name">{activeJob.name}</div>
            <div className="job-info-details">
              VRAM: {(activeJob.vramUsage * gpuData.vram).toFixed(1)}GB / {gpuData.vram}GB
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
