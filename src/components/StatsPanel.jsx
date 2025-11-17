import React from 'react';
import { useGame } from '../store/GameContext';
import './StatsPanel.css';

export default function StatsPanel() {
  const { state, dispatch } = useGame();

  const formatMoney = (amount) => `$${amount.toFixed(2)}`;
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="stats-panel">
      <div className="stats-header">
        <h2>GensynFarm</h2>
        <div className="game-controls">
          <button onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}>
            {state.isPaused ? '▶' : '⏸'}
          </button>
          <select
            value={state.gameSpeed}
            onChange={(e) => dispatch({ type: 'SET_GAME_SPEED', speed: Number(e.target.value) })}
          >
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={3}>3x</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Cash</span>
          <span className="stat-value money">{formatMoney(state.money)}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Total Earned</span>
          <span className="stat-value">{formatMoney(state.totalEarnings)}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Reputation</span>
          <span className="stat-value">{state.reputation}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Location</span>
          <span className="stat-value">{state.currentLocation}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">GPUs</span>
          <span className="stat-value">{state.ownedGPUs.length}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Jobs Done</span>
          <span className="stat-value">{state.completedJobs}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Failed</span>
          <span className="stat-value failure">{state.failedJobs}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Runtime</span>
          <span className="stat-value">{formatTime(state.gameTime)}</span>
        </div>
      </div>
    </div>
  );
}
