import React, { useState, useEffect } from 'react';
import { useGame } from '../store/GameContext';
import { GENSYN_JOB_TYPES } from '../data/gensynProducts';
import './RLSwarmPanel.css';

const PHASE_DURATION = 120; // 2 minutes per phase in real-time (scaled for gameplay)
const PHASES = ['solve', 'evaluate', 'vote'];

export default function RLSwarmPanel() {
  const { state, dispatch } = useGame();
  const swarmState = state.productStates.rl_swarm;
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);

  const isUnlocked = state.ownedProducts.includes('rl_swarm');
  const isActive = swarmState.activeSession !== null;

  // Simulate swarm session phases
  useEffect(() => {
    if (!isActive || state.isPaused) return;

    const interval = setInterval(() => {
      setPhaseTimer(prev => {
        const newTime = prev + (1 * state.gameSpeed);

        if (newTime >= PHASE_DURATION) {
          // Move to next phase
          const nextPhase = (currentPhase + 1) % 3;

          if (nextPhase === 0) {
            // Completed full round
            completeRound();
          } else {
            setCurrentPhase(nextPhase);
          }

          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, currentPhase, state.isPaused, state.gameSpeed]);

  const startSession = () => {
    // Check if GPU is available
    const availableGPU = state.ownedGPUs.find(gpu => {
      const isNotBusy = !state.activeJobs.find(j => j.gpuId === gpu.id);
      return gpu.status === 'idle' && isNotBusy;
    });

    if (!availableGPU) {
      alert('No available GPU. Wait for current jobs to complete.');
      return;
    }

    // Start swarm session
    const sessionId = `swarm_${Date.now()}`;
    const peerCount = Math.floor(Math.random() * 10) + 40; // 40-50 peers

    dispatch({
      type: 'UPDATE_PRODUCT_STATE',
      productId: 'rl_swarm',
      updates: {
        status: 'running',
        activeSession: sessionId,
        connectedPeers: peerCount,
        currentRound: 1,
        totalRounds: 10,
      },
    });

    setCurrentPhase(0);
    setPhaseTimer(0);
  };

  const completeRound = () => {
    const newRound = swarmState.currentRound + 1;
    const accuracy = Math.min(95, swarmState.modelAccuracy + Math.random() * 5);
    const reward = 4.5 + (Math.random() * 2);

    // Check for errors (small chance)
    if (Math.random() < 0.05) {
      // Peer disconnection error
      dispatch({
        type: 'SET_PRODUCT_ERROR',
        productId: 'rl_swarm',
        errorType: 'peer_disconnection',
        errorDetails: { round: swarmState.currentRound, next: newRound },
      });

      // End session
      dispatch({
        type: 'UPDATE_PRODUCT_STATE',
        productId: 'rl_swarm',
        updates: {
          status: 'error',
          activeSession: null,
        },
      });

      return;
    }

    if (newRound > swarmState.totalRounds) {
      // Session complete
      dispatch({
        type: 'UPDATE_PRODUCT_STATE',
        productId: 'rl_swarm',
        updates: {
          status: 'idle',
          activeSession: null,
          currentRound: 0,
          participationStreak: swarmState.participationStreak + 1,
          modelAccuracy: accuracy,
          rewardsEarned: swarmState.rewardsEarned + (reward * 10),
        },
      });

      // Add money and XP
      dispatch({ type: 'ADD_EXPERIENCE', amount: 35 });

      alert(`Swarm session complete! Earned $${(reward * 10).toFixed(2)} and 35 XP`);
      setCurrentPhase(0);
      setPhaseTimer(0);
    } else {
      // Continue to next round
      dispatch({
        type: 'UPDATE_PRODUCT_STATE',
        productId: 'rl_swarm',
        updates: {
          currentRound: newRound,
          modelAccuracy: accuracy,
          rewardsEarned: swarmState.rewardsEarned + reward,
        },
      });

      setCurrentPhase(0);
      setPhaseTimer(0);
    }
  };

  const stopSession = () => {
    if (window.confirm('Stop current swarm session? Progress will be lost.')) {
      dispatch({
        type: 'UPDATE_PRODUCT_STATE',
        productId: 'rl_swarm',
        updates: {
          status: 'idle',
          activeSession: null,
          currentRound: 0,
        },
      });

      setCurrentPhase(0);
      setPhaseTimer(0);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="rl-swarm-panel locked">
        <div className="locked-message">
          <div className="lock-icon">🔒</div>
          <h3>RL Swarm</h3>
          <p>Unlock at Level 10 for $2,500</p>
          <p>Participate in distributed collaborative reinforcement learning</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rl-swarm-panel">
      <div className="panel-header">
        <h3>🐝 RL Swarm</h3>
        <div className="swarm-status">
          <span className={`status-dot ${isActive ? 'active' : 'idle'}`} />
          {isActive ? 'Session Active' : 'Idle'}
        </div>
      </div>

      {/* Network Diagram */}
      <div className="network-diagram">
        <div className="network-center">
          <div className="your-node">YOU</div>
        </div>
        <div className="peer-nodes">
          {Array.from({ length: Math.min(8, swarmState.connectedPeers) }).map((_, i) => (
            <div
              key={i}
              className="peer-node"
              style={{
                transform: `rotate(${(360 / 8) * i}deg) translateY(-80px)`,
              }}
            >
              <div
                className="node-circle"
                style={{ transform: `rotate(-${(360 / 8) * i}deg)` }}
              >
                {i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Info */}
      {isActive && (
        <div className="session-info">
          <div className="phase-indicator">
            <div className="phase-label">Current Phase:</div>
            <div className="phase-name">{PHASES[currentPhase].toUpperCase()}</div>
            <div className="phase-progress">
              <div
                className="phase-progress-bar"
                style={{ width: `${(phaseTimer / PHASE_DURATION) * 100}%` }}
              />
            </div>
            <div className="phase-timer">
              {Math.floor((PHASE_DURATION - phaseTimer) / 60)}:{String(Math.floor((PHASE_DURATION - phaseTimer) % 60)).padStart(2, '0')}
            </div>
          </div>

          <div className="round-info">
            <span>Round {swarmState.currentRound} / {swarmState.totalRounds}</span>
            <span>Peers: {swarmState.connectedPeers}/{swarmState.maxPeers}</span>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="swarm-metrics">
        <div className="metric">
          <span className="metric-label">Model Accuracy:</span>
          <span className="metric-value">{swarmState.modelAccuracy.toFixed(1)}%</span>
        </div>
        <div className="metric">
          <span className="metric-label">Participation Streak:</span>
          <span className="metric-value">{swarmState.participationStreak} rounds</span>
        </div>
        <div className="metric">
          <span className="metric-label">Total Rewards:</span>
          <span className="metric-value money">${swarmState.rewardsEarned.toFixed(2)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="swarm-actions">
        {!isActive ? (
          <button className="action-btn start-btn" onClick={startSession}>
            Join Swarm Session
          </button>
        ) : (
          <button className="action-btn stop-btn" onClick={stopSession}>
            Leave Session
          </button>
        )}
      </div>

      {/* Phase Description */}
      {isActive && (
        <div className="phase-description">
          {currentPhase === 0 && (
            <p><strong>Solve Phase:</strong> Your node is generating solutions independently...</p>
          )}
          {currentPhase === 1 && (
            <p><strong>Evaluate Phase:</strong> Reviewing peer outputs and providing feedback...</p>
          )}
          {currentPhase === 2 && (
            <p><strong>Vote Phase:</strong> Collaborative voting on best solutions. Updating weights...</p>
          )}
        </div>
      )}
    </div>
  );
}
