import React, { useState, useEffect } from 'react';
import { useGame } from '../store/GameContext';
import './BlockAssistPanel.css';

const BUILDING_CHALLENGES = [
  { id: 1, name: 'Simple House', difficulty: 'Easy', time: 60, reward: 3.5, xp: 25, blocks: 15 },
  { id: 2, name: 'Stone Bridge', difficulty: 'Easy', time: 75, reward: 4.0, xp: 30, blocks: 20 },
  { id: 3, name: 'Watchtower', difficulty: 'Medium', time: 120, reward: 6.0, xp: 45, blocks: 35 },
  { id: 4, name: 'Redstone Circuit', difficulty: 'Medium', time: 150, reward: 7.5, xp: 55, blocks: 40 },
  { id: 5, name: 'Castle Gate', difficulty: 'Hard', time: 180, reward: 9.0, xp: 70, blocks: 50 },
  { id: 6, name: 'Automated Farm', difficulty: 'Hard', time: 210, reward: 10.5, xp: 80, blocks: 60 },
];

export default function BlockAssistPanel() {
  const { state, dispatch } = useGame();
  const blockAssistState = state.productStates.blockassist;
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [episodeProgress, setEpisodeProgress] = useState(0);
  const [buildProgress, setBuildProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [aiLearning, setAiLearning] = useState(0);

  const isUnlocked = state.ownedProducts.includes('blockassist');

  // Training simulation
  useEffect(() => {
    if (!isTraining || state.isPaused) return;

    const interval = setInterval(() => {
      setEpisodeProgress(prev => {
        const increment = (1 * state.gameSpeed) / selectedChallenge.time;
        const newProgress = Math.min(1, prev + increment);

        // Update build progress (blocks placed)
        const blocksPlaced = Math.floor(newProgress * selectedChallenge.blocks);
        setBuildProgress(blocksPlaced);

        // AI learning increases as player progresses
        setAiLearning(newProgress * 100);

        // Check for random errors during training
        if (Math.random() < 0.02 && newProgress < 0.9) {
          handleTrainingError();
          return prev;
        }

        if (newProgress >= 1) {
          completeEpisode();
        }

        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTraining, selectedChallenge, state.isPaused, state.gameSpeed]);

  const startEpisode = (challenge) => {
    // Check GPU availability
    const availableGPU = state.ownedGPUs.find(gpu => {
      const isNotBusy = !state.activeJobs.find(j => j.gpuId === gpu.id);
      return gpu.status === 'idle' && isNotBusy;
    });

    if (!availableGPU) {
      alert('No available GPU for training. Wait for current jobs to complete.');
      return;
    }

    setSelectedChallenge(challenge);
    setEpisodeProgress(0);
    setBuildProgress(0);
    setAiLearning(0);
    setIsTraining(true);

    dispatch({
      type: 'UPDATE_PRODUCT_STATE',
      productId: 'blockassist',
      updates: {
        status: 'running',
        activeJob: challenge.id,
      },
    });
  };

  const handleTrainingError = () => {
    const errors = ['vram_exhausted', 'minecraft_crash'];
    const errorType = errors[Math.floor(Math.random() * errors.length)];

    dispatch({
      type: 'SET_PRODUCT_ERROR',
      productId: 'blockassist',
      errorType,
      errorDetails: { challenge: selectedChallenge.name },
    });

    setIsTraining(false);
    setEpisodeProgress(0);
    setBuildProgress(0);
    setAiLearning(0);

    dispatch({
      type: 'UPDATE_PRODUCT_STATE',
      productId: 'blockassist',
      updates: {
        status: 'error',
        activeJob: null,
      },
    });
  };

  const completeEpisode = () => {
    setIsTraining(false);

    // Calculate rewards
    const speedBonus = episodeProgress >= 1 ? 1.2 : 1.0;
    const reward = selectedChallenge.reward * speedBonus;
    const newAccuracy = Math.min(95, blockAssistState.modelAccuracy + Math.random() * 3);

    // Small chance of upload error
    if (Math.random() < 0.1) {
      dispatch({
        type: 'SET_PRODUCT_ERROR',
        productId: 'blockassist',
        errorType: 'upload_timeout',
        errorDetails: { challenge: selectedChallenge.name },
      });

      dispatch({
        type: 'UPDATE_PRODUCT_STATE',
        productId: 'blockassist',
        updates: {
          status: 'warning',
          activeJob: null,
          trainingEpisodes: blockAssistState.trainingEpisodes + 1,
          modelAccuracy: newAccuracy,
        },
      });

      alert(`Episode complete but upload failed! Model saved locally.\nEarned $${reward.toFixed(2)}`);
    } else {
      dispatch({
        type: 'UPDATE_PRODUCT_STATE',
        productId: 'blockassist',
        updates: {
          status: 'idle',
          activeJob: null,
          trainingEpisodes: blockAssistState.trainingEpisodes + 1,
          modelAccuracy: newAccuracy,
          lastUpload: Date.now(),
        },
      });

      alert(`Episode complete! Uploaded to Hugging Face.\nEarned $${reward.toFixed(2)} and ${selectedChallenge.xp} XP`);
    }

    // Add rewards
    dispatch({ type: 'ADD_EXPERIENCE', amount: selectedChallenge.xp });

    setEpisodeProgress(0);
    setBuildProgress(0);
    setAiLearning(0);
    setSelectedChallenge(null);
  };

  const cancelEpisode = () => {
    if (window.confirm('Cancel current training episode? Progress will be lost.')) {
      setIsTraining(false);
      setEpisodeProgress(0);
      setBuildProgress(0);
      setAiLearning(0);
      setSelectedChallenge(null);

      dispatch({
        type: 'UPDATE_PRODUCT_STATE',
        productId: 'blockassist',
        updates: {
          status: 'idle',
          activeJob: null,
        },
      });
    }
  };

  if (!isUnlocked) {
    return (
      <div className="blockassist-panel locked">
        <div className="locked-message">
          <div className="lock-icon">🔒</div>
          <h3>BlockAssist</h3>
          <p>Unlock at Level 5 for $1,000</p>
          <p>Train AI Minecraft assistant through gameplay episodes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blockassist-panel">
      <div className="panel-header">
        <h3>🎮 BlockAssist</h3>
        <div className="training-status">
          <span className={`status-dot ${isTraining ? 'active' : 'idle'}`} />
          {isTraining ? 'Training' : 'Idle'}
        </div>
      </div>

      {/* Minecraft Window Simulation */}
      {isTraining && selectedChallenge && (
        <div className="minecraft-window">
          <div className="mc-header">
            <span>Minecraft - {selectedChallenge.name}</span>
            <span className="mc-fps">FPS: {Math.floor(50 + Math.random() * 10)}</span>
          </div>

          <div className="mc-viewport">
            <div className="build-visualization">
              <div className="blocks-grid">
                {Array.from({ length: selectedChallenge.blocks }).map((_, i) => (
                  <div
                    key={i}
                    className={`block ${i < buildProgress ? 'placed' : 'empty'}`}
                    style={{
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              <div className="build-label">{selectedChallenge.name}</div>
            </div>

            <div className="ai-indicator">
              <div className="ai-status">
                <span className="ai-icon">🤖</span>
                <span>AI Observing...</span>
              </div>
              <div className="learning-bar">
                <div
                  className="learning-fill"
                  style={{ width: `${aiLearning}%` }}
                />
              </div>
              <div className="learning-text">Learning: {aiLearning.toFixed(0)}%</div>
            </div>
          </div>

          <div className="mc-progress">
            <div className="progress-label">
              Episode Progress: {(episodeProgress * 100).toFixed(0)}% • Blocks: {buildProgress}/{selectedChallenge.blocks}
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${episodeProgress * 100}%` }}
              />
            </div>
            <div className="progress-time">
              {Math.floor((selectedChallenge.time * (1 - episodeProgress)) / 60)}:{String(Math.floor((selectedChallenge.time * (1 - episodeProgress)) % 60)).padStart(2, '0')} remaining
            </div>
          </div>

          <button className="cancel-btn" onClick={cancelEpisode}>
            Cancel Episode
          </button>
        </div>
      )}

      {/* Challenge Selection */}
      {!isTraining && (
        <div className="challenges-section">
          <h4>Building Challenges</h4>
          <div className="challenges-grid">
            {BUILDING_CHALLENGES.map(challenge => (
              <div
                key={challenge.id}
                className={`challenge-card ${challenge.difficulty.toLowerCase()}`}
              >
                <div className="challenge-header">
                  <span className="challenge-name">{challenge.name}</span>
                  <span className={`difficulty-badge ${challenge.difficulty.toLowerCase()}`}>
                    {challenge.difficulty}
                  </span>
                </div>

                <div className="challenge-stats">
                  <div className="stat">⏱ {challenge.time}s</div>
                  <div className="stat">📦 {challenge.blocks} blocks</div>
                  <div className="stat reward">${challenge.reward}</div>
                  <div className="stat xp">+{challenge.xp} XP</div>
                </div>

                <button
                  className="start-challenge-btn"
                  onClick={() => startEpisode(challenge)}
                >
                  Start Challenge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Stats */}
      <div className="model-stats">
        <div className="stat-row">
          <span>Episodes Completed:</span>
          <span>{blockAssistState.trainingEpisodes}</span>
        </div>
        <div className="stat-row">
          <span>Model Accuracy:</span>
          <span>{blockAssistState.modelAccuracy.toFixed(1)}%</span>
        </div>
        <div className="stat-row">
          <span>Last Upload:</span>
          <span>{blockAssistState.lastUpload ? getTimeSince(blockAssistState.lastUpload) : 'Never'}</span>
        </div>
      </div>
    </div>
  );
}

function getTimeSince(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}
