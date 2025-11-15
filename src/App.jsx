import React from 'react';
import { GameProvider } from './store/GameContext';
import { useGameLoop } from './hooks/useGameLoop';
import StatsPanel from './components/StatsPanel';
import GPUPanel from './components/GPUPanel';
import JobsPanel from './components/JobsPanel';
import ShopPanel from './components/ShopPanel';
import PhaserGame from './components/PhaserGame';
import ProductsDashboard from './components/ProductsDashboard';
import './App.css';

function GameView() {
  // Initialize the game loop
  useGameLoop();

  return (
    <div className="app">
      <div className="app-header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <h1>GensynFarm</h1>
        </div>
        <div className="subtitle">GPU Node Operator Simulator</div>
      </div>

      <div className="app-content">
        <div className="left-column">
          <StatsPanel />
          <PhaserGame />
        </div>

        <div className="middle-column">
          <ProductsDashboard />
          <GPUPanel />
        </div>

        <div className="right-column">
          <JobsPanel />
          <ShopPanel />
        </div>
      </div>

      <div className="app-footer">
        <div className="footer-content">
          <div className="gensyn-branding">
            Powered by <strong>Gensyn</strong> Network
          </div>
          <div className="footer-links">
            <button onClick={() => {
              if (window.confirm('Reset game? All progress will be lost!')) {
                localStorage.removeItem('gensynfarm_save');
                window.location.reload();
              }
            }}>
              Reset Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameView />
    </GameProvider>
  );
}

export default App;
