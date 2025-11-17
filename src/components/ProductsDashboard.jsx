import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { GENSYN_PRODUCTS, PRODUCT_ERRORS, PRODUCT_STATUS } from '../data/gensynProducts';
import BlockAssistPanel from './BlockAssistPanel';
import CodeAssistPanel from './CodeAssistPanel';
import CodeZeroPanel from './CodeZeroPanel';
import RLSwarmPanel from './RLSwarmPanel';
import './ProductsDashboard.css';

export default function ProductsDashboard() {
  const { state, dispatch } = useGame();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case PRODUCT_STATUS.RUNNING: return '#00ff00';
      case PRODUCT_STATUS.WARNING: return '#ffaa00';
      case PRODUCT_STATUS.ERROR: return '#ff0000';
      case PRODUCT_STATUS.LOCKED: return '#444444';
      case PRODUCT_STATUS.OFFLINE: return '#666666';
      default: return '#888888'; // idle
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case PRODUCT_STATUS.RUNNING: return '●';
      case PRODUCT_STATUS.WARNING: return '▲';
      case PRODUCT_STATUS.ERROR: return '✖';
      case PRODUCT_STATUS.LOCKED: return '🔒';
      case PRODUCT_STATUS.OFFLINE: return '○';
      default: return '○'; // idle
    }
  };

  const getStatusText = (productId, productState) => {
    if (productState.status === PRODUCT_STATUS.LOCKED) {
      const product = GENSYN_PRODUCTS[productId];
      return `Unlock at Level ${product.unlockLevel}`;
    }

    if (productState.status === PRODUCT_STATUS.ERROR && productState.errorType) {
      const errors = PRODUCT_ERRORS[productId];
      const error = errors[productState.errorType];
      return error ? error.name : 'Unknown Error';
    }

    switch (productState.status) {
      case PRODUCT_STATUS.RUNNING: return 'Running smoothly';
      case PRODUCT_STATUS.WARNING: return 'Degraded performance';
      case PRODUCT_STATUS.ERROR: return 'Critical error';
      case PRODUCT_STATUS.OFFLINE: return 'Offline';
      default: return 'Idle';
    }
  };

  const getProductMetrics = (productId, productState) => {
    switch (productId) {
      case 'blockassist':
        return {
          primary: `Model accuracy: ${productState.modelAccuracy.toFixed(0)}%`,
          secondary: `Episodes: ${productState.trainingEpisodes}`,
          tertiary: productState.lastUpload ? `Last upload: ${getTimeSince(productState.lastUpload)}` : 'No uploads yet',
        };
      case 'codeassist':
        return {
          primary: `Suggestions: ${productState.suggestionsGiven}`,
          secondary: `Acceptance: ${productState.acceptanceRate.toFixed(0)}%`,
          tertiary: `Spec score: ${productState.specializationScore}`,
        };
      case 'codezero':
        return {
          primary: `Bid success: ${productState.bidSuccessRate.toFixed(0)}%`,
          secondary: `Job queue: ${productState.credits} credits`,
          tertiary: `Idle reduction: ${productState.idleTimeReduction.toFixed(0)}%`,
        };
      case 'rl_swarm':
        return {
          primary: `Peers: ${productState.connectedPeers}/${productState.maxPeers}`,
          secondary: `Round: ${productState.currentRound}/${productState.totalRounds}`,
          tertiary: `Streak: ${productState.participationStreak} rounds`,
        };
      default:
        return { primary: '', secondary: '', tertiary: '' };
    }
  };

  const getTimeSince = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const handleBuyProduct = (productId) => {
    const product = GENSYN_PRODUCTS[productId];
    if (state.level < product.unlockLevel) {
      alert(`Reach level ${product.unlockLevel} to unlock ${product.name}`);
      return;
    }

    if (state.money < product.unlockCost) {
      alert(`Need $${product.unlockCost} to unlock ${product.name}`);
      return;
    }

    dispatch({
      type: 'BUY_PRODUCT',
      productId,
      cost: product.unlockCost,
    });
  };

  const handleClearError = (productId) => {
    dispatch({ type: 'CLEAR_PRODUCT_ERROR', productId });
  };

  const handleViewDetails = (productId) => {
    setSelectedProduct(productId);
  };

  return (
    <div className="products-dashboard">
      <div className="dashboard-header">
        <h3>Gensyn Protocol Products</h3>
        <div className="level-display">
          Level {state.level} ({state.experience}/{state.experienceToNext} XP)
        </div>
      </div>

      <div className="products-grid">
        {Object.keys(GENSYN_PRODUCTS).map(productId => {
          const product = GENSYN_PRODUCTS[productId];
          const productState = state.productStates[productId];
          const isOwned = state.ownedProducts.includes(productId);
          const statusColor = getStatusColor(productState.status);
          const metrics = getProductMetrics(productId, productState);

          return (
            <div
              key={productId}
              className={`product-card ${productState.status}`}
              style={{ borderColor: productState.status !== PRODUCT_STATUS.LOCKED ? statusColor : '#2a3f5f' }}
            >
              <div className="product-header">
                <div className="product-icon">{product.icon}</div>
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-category">{product.category}</div>
                </div>
                <div
                  className="status-indicator"
                  style={{ color: statusColor }}
                >
                  {getStatusIcon(productState.status)}
                </div>
              </div>

              <div className="product-status-text">
                {getStatusText(productId, productState)}
              </div>

              {isOwned && (
                <div className="product-metrics">
                  {metrics.primary && <div className="metric">{metrics.primary}</div>}
                  {metrics.secondary && <div className="metric">{metrics.secondary}</div>}
                  {metrics.tertiary && <div className="metric-small">{metrics.tertiary}</div>}
                </div>
              )}

              {productState.status === PRODUCT_STATUS.ERROR && productState.errorType && (
                <div className="error-panel">
                  <div className="error-message">
                    {PRODUCT_ERRORS[productId][productState.errorType]?.message || 'Unknown error'}
                  </div>
                  {productState.errorTime && (
                    <div className="error-time">
                      {getTimeSince(productState.errorTime)}
                    </div>
                  )}
                </div>
              )}

              <div className="product-actions">
                {!isOwned ? (
                  <button
                    className="action-btn unlock-btn"
                    onClick={() => handleBuyProduct(productId)}
                    disabled={state.level < product.unlockLevel}
                  >
                    {state.level < product.unlockLevel
                      ? `Level ${product.unlockLevel} Required`
                      : `Unlock ($${product.unlockCost})`
                    }
                  </button>
                ) : (
                  <>
                    {productState.status === PRODUCT_STATUS.ERROR && (
                      <button
                        className="action-btn retry-btn"
                        onClick={() => handleClearError(productId)}
                      >
                        Clear Error
                      </button>
                    )}
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleViewDetails(productId)}
                    >
                      View Details
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedProduct && (
        <ProductDetailModal
          productId={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

function ProductDetailModal({ productId, onClose }) {
  // Render the appropriate panel component based on productId
  const renderPanel = () => {
    switch (productId) {
      case 'blockassist':
        return <BlockAssistPanel />;
      case 'codeassist':
        return <CodeAssistPanel />;
      case 'codezero':
        return <CodeZeroPanel />;
      case 'rl_swarm':
        return <RLSwarmPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content product-panel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="close-btn" onClick={onClose}>✖ Close</button>
        </div>
        <div className="modal-body">
          {renderPanel()}
        </div>
      </div>
    </div>
  );
}
