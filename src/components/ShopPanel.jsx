import React, { useState } from 'react';
import { useGame } from '../store/GameContext';
import { GPUS, getAvailableGPUs } from '../data/gpus';
import { LOCATIONS } from '../data/locations';
import { UPGRADES } from '../data/upgrades';
import './ShopPanel.css';

export default function ShopPanel() {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState('gpus');

  const availableGPUs = getAvailableGPUs(state.totalEarnings);
  const currentLocation = LOCATIONS[state.currentLocation];

  const canBuyGPU = (gpu) => {
    return (
      state.money >= gpu.price &&
      state.ownedGPUs.length < currentLocation.maxGPUs
    );
  };

  const canBuyLocation = (location) => {
    return (
      state.money >= location.unlockCost &&
      !state.ownedLocations.includes(location.id)
    );
  };

  const canBuyUpgrade = (upgrade) => {
    return (
      state.money >= upgrade.cost &&
      !state.ownedUpgrades.includes(upgrade.id) &&
      state.totalEarnings >= upgrade.unlockCost
    );
  };

  return (
    <div className="shop-panel">
      <div className="shop-tabs">
        <button
          className={activeTab === 'gpus' ? 'active' : ''}
          onClick={() => setActiveTab('gpus')}
        >
          GPUs
        </button>
        <button
          className={activeTab === 'locations' ? 'active' : ''}
          onClick={() => setActiveTab('locations')}
        >
          Locations
        </button>
        <button
          className={activeTab === 'upgrades' ? 'active' : ''}
          onClick={() => setActiveTab('upgrades')}
        >
          Upgrades
        </button>
      </div>

      <div className="shop-content">
        {activeTab === 'gpus' && (
          <div className="shop-section">
            <div className="section-header">
              <h3>Buy GPUs</h3>
              <div className="gpu-slots">
                Slots: {state.ownedGPUs.length} / {currentLocation.maxGPUs}
              </div>
            </div>

            <div className="shop-grid">
              {availableGPUs.map(gpu => (
                <div key={gpu.id} className="shop-item">
                  <div className="item-header">
                    <div className="item-name">{gpu.name}</div>
                    <div className="item-price">${gpu.price}</div>
                  </div>

                  <div className="item-description">{gpu.description}</div>

                  <div className="item-specs">
                    <div className="spec">VRAM: {gpu.vram}GB</div>
                    <div className="spec">Performance: {gpu.performance}</div>
                    <div className="spec">Power: {gpu.powerDraw}W</div>
                    <div className="spec">Heat: {gpu.heatOutput}W</div>
                  </div>

                  <button
                    className="buy-btn"
                    onClick={() => dispatch({ type: 'BUY_GPU', gpuType: gpu.id })}
                    disabled={!canBuyGPU(gpu)}
                  >
                    {canBuyGPU(gpu) ? 'Buy' : state.money < gpu.price ? 'Not Enough Cash' : 'No Space'}
                  </button>
                </div>
              ))}
            </div>

            {availableGPUs.length < Object.keys(GPUS).length && (
              <div className="unlock-message">
                More GPUs unlock as you earn money!
              </div>
            )}
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="shop-section">
            <h3>Upgrade Location</h3>

            <div className="current-location-info">
              <h4>Current: {currentLocation.name}</h4>
              <div className="location-stats">
                <div>Max GPUs: {currentLocation.maxGPUs}</div>
                <div>Max Power: {currentLocation.maxPowerDraw}W</div>
                <div>Monthly Cost: ${currentLocation.monthlyUpkeep}</div>
                <div>Cooling: {(currentLocation.coolingEfficiency * 100).toFixed(0)}%</div>
              </div>
            </div>

            <div className="shop-grid">
              {Object.values(LOCATIONS).map(location => {
                if (state.ownedLocations.includes(location.id)) {
                  return (
                    <div key={location.id} className="shop-item owned">
                      <div className="item-header">
                        <div className="item-name">{location.name}</div>
                        <div className="owned-badge">OWNED</div>
                      </div>

                      <div className="item-description">{location.description}</div>

                      <button
                        className="buy-btn"
                        onClick={() => dispatch({ type: 'CHANGE_LOCATION', locationId: location.id })}
                        disabled={state.currentLocation === location.id}
                      >
                        {state.currentLocation === location.id ? 'Current' : 'Move Here'}
                      </button>
                    </div>
                  );
                }

                return (
                  <div key={location.id} className="shop-item">
                    <div className="item-header">
                      <div className="item-name">{location.name}</div>
                      <div className="item-price">${location.unlockCost}</div>
                    </div>

                    <div className="item-description">{location.description}</div>

                    <div className="item-specs">
                      <div className="spec">Max GPUs: {location.maxGPUs}</div>
                      <div className="spec">Max Power: {location.maxPowerDraw}W</div>
                      <div className="spec">Monthly: ${location.monthlyUpkeep}</div>
                      <div className="spec">Cooling: {(location.coolingEfficiency * 100).toFixed(0)}%</div>
                    </div>

                    <button
                      className="buy-btn"
                      onClick={() => dispatch({ type: 'BUY_LOCATION', locationId: location.id })}
                      disabled={!canBuyLocation(location)}
                    >
                      {canBuyLocation(location) ? 'Buy' : 'Not Enough Cash'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'upgrades' && (
          <div className="shop-section">
            <h3>Upgrades</h3>

            <div className="shop-grid">
              {Object.values(UPGRADES).map(upgrade => {
                const owned = state.ownedUpgrades.includes(upgrade.id);
                const locked = state.totalEarnings < upgrade.unlockCost;

                return (
                  <div
                    key={upgrade.id}
                    className={`shop-item ${owned ? 'owned' : ''} ${locked ? 'locked' : ''}`}
                  >
                    <div className="item-header">
                      <div className="item-name">{upgrade.name}</div>
                      {owned ? (
                        <div className="owned-badge">OWNED</div>
                      ) : (
                        <div className="item-price">${upgrade.cost}</div>
                      )}
                    </div>

                    <div className="item-description">{upgrade.description}</div>

                    {locked && (
                      <div className="unlock-requirement">
                        Unlock at ${upgrade.unlockCost} total earnings
                      </div>
                    )}

                    <button
                      className="buy-btn"
                      onClick={() => dispatch({ type: 'BUY_UPGRADE', upgrade })}
                      disabled={!canBuyUpgrade(upgrade) || owned}
                    >
                      {owned ? 'Owned' : locked ? 'Locked' : canBuyUpgrade(upgrade) ? 'Buy' : 'Not Enough Cash'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
