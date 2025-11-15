import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import GameScene from '../game/GameScene';
import { useGame } from '../store/GameContext';
import './PhaserGame.css';

export default function PhaserGame() {
  const { state } = useGame();
  const gameRef = useRef(null);
  const sceneRef = useRef(null);
  const [selectedGPU, setSelectedGPU] = useState(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'phaser-container',
      backgroundColor: '#0a0e27',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: GameScene,
    };

    gameRef.current = new Phaser.Game(config);

    // Wait for scene to be ready
    gameRef.current.events.once('ready', () => {
      const scene = gameRef.current.scene.getScene('GameScene');
      sceneRef.current = scene;

      // Start scene with game state
      scene.scene.restart({
        gameState: state,
        onInteract: (gpu) => {
          setSelectedGPU(gpu);
        },
      });
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }
    };
  }, []);

  // Update scene when game state changes
  useEffect(() => {
    if (sceneRef.current && sceneRef.current.updateGameState) {
      sceneRef.current.updateGameState(state);
    }
  }, [state.ownedGPUs, state.currentLocation]);

  return (
    <div className="phaser-game-container">
      <div className="game-wrapper">
        <div id="phaser-container" />

        <div className="controls-hint">
          <div className="hint-item">
            <span className="hint-key">WASD / Arrow Keys</span>
            <span className="hint-text">Move</span>
          </div>
          <div className="hint-item">
            <span className="hint-key">E</span>
            <span className="hint-text">Interact with GPU</span>
          </div>
        </div>
      </div>

      {selectedGPU && (
        <div className="gpu-popup-overlay" onClick={() => setSelectedGPU(null)}>
          <div className="gpu-popup" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedGPU.type.toUpperCase()}</h3>
            <div className="popup-stats">
              <div className="popup-stat">
                <span className="popup-label">Status:</span>
                <span className="popup-value">{selectedGPU.status}</span>
              </div>
              <div className="popup-stat">
                <span className="popup-label">Temperature:</span>
                <span className="popup-value">{selectedGPU.temperature}°C</span>
              </div>
              <div className="popup-stat">
                <span className="popup-label">Health:</span>
                <span className="popup-value">{selectedGPU.health.toFixed(1)}%</span>
              </div>
              <div className="popup-stat">
                <span className="popup-label">Hours Used:</span>
                <span className="popup-value">{selectedGPU.hoursUsed.toFixed(1)}h</span>
              </div>
            </div>
            <button className="popup-close" onClick={() => setSelectedGPU(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
