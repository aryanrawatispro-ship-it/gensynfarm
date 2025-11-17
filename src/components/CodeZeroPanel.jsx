import React, { useState, useEffect } from 'react';
import { useGame } from '../store/GameContext';
import { GENSYN_JOB_TYPES } from '../data/gensynProducts';
import './CodeZeroPanel.css';

const AVAILABLE_JOBS = [
  {
    id: 1,
    name: 'Multi-Agent Code Generation',
    description: 'Collaborative coding with 3 AI agents',
    difficulty: 'Medium',
    bidCost: 15,
    reward: 28.0,
    xp: 60,
    duration: 180, // 3 minutes
    vramRequired: 16,
    winProbability: 0.65,
  },
  {
    id: 2,
    name: 'Execution-Free Verification',
    description: 'Verify code correctness without running',
    difficulty: 'Hard',
    bidCost: 25,
    reward: 45.0,
    xp: 85,
    duration: 240, // 4 minutes
    vramRequired: 20,
    winProbability: 0.45,
  },
  {
    id: 3,
    name: 'Distributed Code Review',
    description: 'Peer review with multiple nodes',
    difficulty: 'Easy',
    bidCost: 8,
    reward: 18.0,
    xp: 40,
    duration: 120, // 2 minutes
    vramRequired: 12,
    winProbability: 0.80,
  },
  {
    id: 4,
    name: 'Parallel Solution Search',
    description: 'Explore multiple code solutions simultaneously',
    difficulty: 'Hard',
    bidCost: 30,
    reward: 55.0,
    xp: 95,
    duration: 300, // 5 minutes
    vramRequired: 24,
    winProbability: 0.35,
  },
];

export default function CodeZeroPanel() {
  const { state, dispatch } = useGame();
  const czState = state.productStates.codezero;
  const [jobProgress, setJobProgress] = useState(0);
  const [activeJob, setActiveJob] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showBidConfirm, setShowBidConfirm] = useState(false);

  const isUnlocked = state.ownedProducts.includes('codezero');
  const isActive = czState.optimizationActive;

  // Job progress timer
  useEffect(() => {
    if (!activeJob || state.isPaused) return;

    const interval = setInterval(() => {
      setJobProgress(prev => {
        const increment = (1 * state.gameSpeed) / activeJob.duration;
        const newProgress = Math.min(1, prev + increment);

        // Check for errors (5% chance during job)
        if (Math.random() < 0.05 && newProgress < 0.9) {
          handleJobError();
          return prev;
        }

        if (newProgress >= 1) {
          completeJob();
        }

        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeJob, state.isPaused, state.gameSpeed]);

  const handleJobError = () => {
    const errorTypes = ['collab_timeout', 'bid_rejected', 'no_jobs_available'];
    const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];

    dispatch({
      type: 'SET_PRODUCT_ERROR',
      productId: 'codezero',
      errorType,
      errorDetails: {
        required: activeJob?.bidCost || 15,
        current: czState.credits
      },
    });

    dispatch({
      type: 'UPDATE_PRODUCT_STATE',
      productId: 'codezero',
      updates: {
        status: 'error',
        optimizationActive: false,
      },
    });

    setActiveJob(null);
    setJobProgress(0);
  };

  const completeJob = () => {
    const creditsEarned = Math.floor(activeJob.reward * 0.5); // 50% of reward as credits
    const newWinRate = (czState.jobWinRate * 0.9) + (10 * 0.1); // Weighted average

    dispatch({
      type: 'UPDATE_PRODUCT_STATE',
      productId: 'codezero',
      updates: {
        credits: czState.credits + creditsEarned,
        jobWinRate: Math.min(95, newWinRate),
        idleTimeReduction: Math.min(40, czState.idleTimeReduction + 2),
        optimizationActive: true,
        status: 'idle',
      },
    });

    dispatch({ type: 'ADD_EXPERIENCE', amount: activeJob.xp });

    alert(`Job complete! Earned $${activeJob.reward.toFixed(2)}, ${creditsEarned} credits, and ${activeJob.xp} XP`);
    setActiveJob(null);
    setJobProgress(0);
  };

  const handleBidOnJob = (job) => {
    setSelectedJob(job);
    setShowBidConfirm(true);
  };

  const confirmBid = () => {
    if (!selectedJob) return;

    // Check GPU availability
    const gpuData = state.ownedGPUs.map(gpu => {
      const gpuInfo = require('../data/gpus').GPUS[gpu.type];
      return { ...gpu, ...gpuInfo };
    });

    const availableGPU = gpuData.find(gpu => {
      const isNotBusy = !state.activeJobs.find(j => j.gpuId === gpu.id);
      return gpu.status === 'idle' && isNotBusy && gpu.vram >= selectedJob.vramRequired;
    });

    if (!availableGPU) {
      alert(`Need a GPU with at least ${selectedJob.vramRequired}GB VRAM available`);
      setShowBidConfirm(false);
      return;
    }

    // Check credits
    if (czState.credits < selectedJob.bidCost) {
      dispatch({
        type: 'SET_PRODUCT_ERROR',
        productId: 'codezero',
        errorType: 'bid_rejected',
        errorDetails: { required: selectedJob.bidCost, current: czState.credits },
      });

      dispatch({
        type: 'UPDATE_PRODUCT_STATE',
        productId: 'codezero',
        updates: { status: 'error' },
      });

      setShowBidConfirm(false);
      return;
    }

    // Simulate bid success/failure based on win probability
    const bidWon = Math.random() < selectedJob.winProbability;

    if (!bidWon) {
      // Lost the bid, deduct credits but no job
      const newSuccessRate = (czState.bidSuccessRate * 0.9) + (0 * 0.1);

      dispatch({
        type: 'UPDATE_PRODUCT_STATE',
        productId: 'codezero',
        updates: {
          credits: czState.credits - selectedJob.bidCost,
          bidSuccessRate: newSuccessRate,
        },
      });

      alert(`Bid unsuccessful. Lost ${selectedJob.bidCost} credits. Better luck next time!`);
      setShowBidConfirm(false);
      return;
    }

    // Won the bid - start job
    const newSuccessRate = (czState.bidSuccessRate * 0.9) + (100 * 0.1);

    dispatch({
      type: 'UPDATE_PRODUCT_STATE',
      productId: 'codezero',
      updates: {
        credits: czState.credits - selectedJob.bidCost,
        bidSuccessRate: Math.min(95, newSuccessRate),
        optimizationActive: true,
        status: 'running',
      },
    });

    setActiveJob(selectedJob);
    setJobProgress(0);
    setShowBidConfirm(false);
  };

  const cancelBid = () => {
    setSelectedJob(null);
    setShowBidConfirm(false);
  };

  const toggleOptimization = () => {
    dispatch({
      type: 'UPDATE_PRODUCT_STATE',
      productId: 'codezero',
      updates: {
        optimizationActive: !czState.optimizationActive,
        status: czState.optimizationActive ? 'idle' : 'running',
      },
    });
  };

  const stopCurrentJob = () => {
    if (window.confirm('Stop current job? Credits spent on bid will be lost.')) {
      dispatch({
        type: 'UPDATE_PRODUCT_STATE',
        productId: 'codezero',
        updates: {
          optimizationActive: false,
          status: 'idle',
        },
      });

      setActiveJob(null);
      setJobProgress(0);
    }
  };

  const earnCredits = () => {
    // Convert money to credits (1:5 ratio)
    const creditsToBuy = 50;
    const cost = 10;

    if (state.money < cost) {
      alert('Not enough money. Complete regular jobs to earn credits.');
      return;
    }

    if (window.confirm(`Buy ${creditsToBuy} credits for $${cost}?`)) {
      dispatch({ type: 'ADD_MONEY', amount: -cost });
      dispatch({
        type: 'UPDATE_PRODUCT_STATE',
        productId: 'codezero',
        updates: {
          credits: czState.credits + creditsToBuy,
        },
      });
    }
  };

  if (!isUnlocked) {
    return (
      <div className="codezero-panel locked">
        <div className="locked-message">
          <div className="lock-icon">🔒</div>
          <h3>CodeZero</h3>
          <p>Unlock at Level 20 for $10,000</p>
          <p>Multi-agent collaborative coding with execution-free evaluation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="codezero-panel">
      <div className="panel-header">
        <h3>⚡ CodeZero</h3>
        <div className="optimization-status">
          <span className={`status-dot ${isActive ? 'active' : 'idle'}`} />
          {isActive ? 'Optimization Active' : 'Idle'}
        </div>
      </div>

      {/* Credits Balance */}
      <div className="credits-balance">
        <div className="balance-display">
          <span className="balance-label">Credits:</span>
          <span className="balance-amount">{czState.credits}</span>
        </div>
        <button className="buy-credits-btn" onClick={earnCredits}>
          Buy Credits ($10 = 50c)
        </button>
      </div>

      {/* Active Job Progress */}
      {activeJob && (
        <div className="active-job-display">
          <div className="job-header">
            <span className="job-name">{activeJob.name}</span>
            <span className="job-difficulty">{activeJob.difficulty}</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${jobProgress * 100}%` }} />
          </div>
          <div className="progress-info">
            <span>{(jobProgress * 100).toFixed(0)}% Complete</span>
            <span>ETA: {Math.ceil((1 - jobProgress) * activeJob.duration)}s</span>
          </div>
          <button className="stop-job-btn" onClick={stopCurrentJob}>
            Stop Job
          </button>
        </div>
      )}

      {/* Available Jobs */}
      {!activeJob && (
        <div className="available-jobs">
          <h4>Available Jobs</h4>
          <div className="jobs-list">
            {AVAILABLE_JOBS.map(job => (
              <div key={job.id} className={`job-card ${job.difficulty.toLowerCase()}`}>
                <div className="job-card-header">
                  <div className="job-info">
                    <div className="job-title">{job.name}</div>
                    <div className="job-desc">{job.description}</div>
                  </div>
                  <div className={`difficulty-badge ${job.difficulty.toLowerCase()}`}>
                    {job.difficulty}
                  </div>
                </div>

                <div className="job-stats">
                  <div className="stat">
                    <span className="stat-label">Bid Cost:</span>
                    <span className="stat-value credits">{job.bidCost}c</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Reward:</span>
                    <span className="stat-value money">${job.reward.toFixed(2)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">XP:</span>
                    <span className="stat-value xp">{job.xp}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Win Chance:</span>
                    <span className="stat-value">{(job.winProbability * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div className="job-requirements">
                  <span>Requires: {job.vramRequired}GB VRAM</span>
                  <span>Duration: {Math.floor(job.duration / 60)}:{String(job.duration % 60).padStart(2, '0')}</span>
                </div>

                <button
                  className="bid-btn"
                  onClick={() => handleBidOnJob(job)}
                  disabled={czState.credits < job.bidCost}
                >
                  {czState.credits < job.bidCost ? 'Insufficient Credits' : `Place Bid (${job.bidCost}c)`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Dashboard */}
      <div className="metrics-dashboard">
        <h4>Optimization Metrics</h4>
        <div className="metric">
          <span className="metric-label">Bid Success Rate:</span>
          <span className="metric-value">{czState.bidSuccessRate.toFixed(1)}%</span>
        </div>
        <div className="metric">
          <span className="metric-label">Job Win Rate:</span>
          <span className="metric-value">{czState.jobWinRate.toFixed(1)}%</span>
        </div>
        <div className="metric">
          <span className="metric-label">Idle Time Reduction:</span>
          <span className="metric-value highlight">{czState.idleTimeReduction.toFixed(1)}%</span>
        </div>
      </div>

      {/* Bid Confirmation Modal */}
      {showBidConfirm && selectedJob && (
        <div className="modal-overlay" onClick={cancelBid}>
          <div className="modal-content bid-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Bid</h3>
              <button className="close-btn" onClick={cancelBid}>✖</button>
            </div>
            <div className="modal-body">
              <p className="bid-warning">
                You are about to bid <strong>{selectedJob.bidCost} credits</strong> on "{selectedJob.name}".
              </p>
              <div className="bid-details">
                <div className="detail-row">
                  <span>Win Probability:</span>
                  <span className="highlight">{(selectedJob.winProbability * 100).toFixed(0)}%</span>
                </div>
                <div className="detail-row">
                  <span>Potential Reward:</span>
                  <span className="money">${selectedJob.reward.toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span>Credits Earned (if win):</span>
                  <span className="credits">+{Math.floor(selectedJob.reward * 0.5)}c</span>
                </div>
                <div className="detail-row">
                  <span>Your Credits After Bid:</span>
                  <span>{czState.credits - selectedJob.bidCost}c</span>
                </div>
              </div>
              <p className="bid-note">
                Note: If you lose the bid, you will lose {selectedJob.bidCost} credits with no reward.
              </p>
              <div className="modal-actions">
                <button className="confirm-bid-btn" onClick={confirmBid}>
                  Confirm Bid
                </button>
                <button className="cancel-bid-btn" onClick={cancelBid}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
