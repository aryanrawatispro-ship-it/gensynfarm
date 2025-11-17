import React from 'react';
import { useGame } from '../store/GameContext';
import { GPUS } from '../data/gpus';
import './JobsPanel.css';

export default function JobsPanel() {
  const { state, dispatch } = useGame();

  const canAcceptJob = (job) => {
    return state.ownedGPUs.some(gpu => {
      const gpuData = GPUS[gpu.type];
      const isNotBusy = !state.activeJobs.find(j => j.gpuId === gpu.id);
      return gpuData.vram >= job.minVRAM && isNotBusy;
    });
  };

  const handleAcceptJob = (jobId) => {
    dispatch({ type: 'ACCEPT_JOB', jobId });
  };

  return (
    <div className="jobs-panel">
      <div className="jobs-section">
        <h3>Available Jobs ({state.availableJobs.length})</h3>

        {state.availableJobs.length === 0 && (
          <div className="empty-state">
            Waiting for jobs from Gensyn network...
          </div>
        )}

        <div className="jobs-list">
          {state.availableJobs.map(job => (
            <div key={job.id} className="job-card available">
              <div className="job-header">
                <div className="job-name">{job.name}</div>
                <div className="job-pay">${job.basePay.toFixed(2)}</div>
              </div>

              <div className="job-description">{job.description}</div>

              <div className="job-requirements">
                <div className="req-item">
                  <span className="req-label">Min VRAM:</span>
                  <span className="req-value">{job.minVRAM}GB</span>
                </div>
                <div className="req-item">
                  <span className="req-label">Duration:</span>
                  <span className="req-value">{job.baseTime}s</span>
                </div>
                <div className="req-item">
                  <span className="req-label">Failure Risk:</span>
                  <span className="req-value">{(job.failureChance * 100).toFixed(1)}%</span>
                </div>
              </div>

              <button
                className="accept-btn"
                onClick={() => handleAcceptJob(job.id)}
                disabled={!canAcceptJob(job)}
              >
                {canAcceptJob(job) ? 'Accept Job' : 'No Available GPU'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="jobs-section">
        <h3>Active Jobs ({state.activeJobs.length})</h3>

        {state.activeJobs.length === 0 && (
          <div className="empty-state">
            No jobs running. Accept a job to start earning!
          </div>
        )}

        <div className="jobs-list">
          {state.activeJobs.map(job => {
            const gpu = state.ownedGPUs.find(g => g.id === job.gpuId);
            const gpuData = gpu ? GPUS[gpu.type] : null;

            return (
              <div key={job.id} className="job-card active">
                <div className="job-header">
                  <div className="job-name">{job.name}</div>
                  <div className="job-pay">${job.basePay.toFixed(2)}</div>
                </div>

                {gpuData && (
                  <div className="job-gpu">
                    Running on: {gpuData.name}
                  </div>
                )}

                <div className="job-progress-section">
                  <div className="progress-bar-large">
                    <div
                      className="progress-fill-large"
                      style={{ width: `${job.progress * 100}%` }}
                    />
                  </div>
                  <div className="progress-text-large">
                    {(job.progress * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
