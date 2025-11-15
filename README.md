# GensynFarm - GPU Node Operator Simulator

A realistic simulation game where you build and manage a GPU compute business on the Gensyn decentralized AI network.

## About

GensynFarm is a web-based simulation game that teaches real concepts about running GPU compute nodes while being fun to play. Start with a single consumer GPU in your bedroom and scale up to a professional data center operation.

## Features

### Realistic Hardware
- **Real GPU specs**: RTX 3060, RTX 4090, A100, H100 with actual VRAM, power draw, and performance metrics
- **Authentic pricing**: Based on real market values (scaled for gameplay)
- **Hardware constraints**: Power limits, thermal management, degradation over time

### Real ML Workloads
- **LLM Inference**: Small (7B), Medium (13B), and Large (70B) parameter models
- **Stable Diffusion**: Image generation tasks
- **Fine-tuning**: Train models on custom data
- **Batch Inference**: Process multiple tasks efficiently

### Operating Challenges
- **Power costs**: Electricity bills eat into profits
- **Thermal management**: Overheating causes throttling and failures
- **Hardware health**: GPUs degrade over time based on temperature and usage
- **Location constraints**: Space limits, power capacity, cooling efficiency
- **Job failures**: VRAM errors, overheating can cause jobs to fail

### Progression System
- **Start small**: Single GPU in your bedroom
- **Scale up**: Basement → Garage → Colocation → Data Center
- **Upgrades**: Better cooling, UPS systems, monitoring software, network upgrades
- **Economics**: Balance revenue vs costs for realistic ROI

### Gensyn Integration
- Jobs come from the "Gensyn network"
- Learn about proof of compute and verification
- Realistic decentralized compute economics

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

## How to Play

1. **Accept Jobs**: Browse available compute jobs and accept ones that match your GPU capabilities
2. **Earn Money**: Complete jobs successfully to earn cash and reputation
3. **Buy Hardware**: Invest in better GPUs for higher-paying jobs
4. **Upgrade Location**: Move to bigger spaces as you scale
5. **Manage Costs**: Watch your power bills and keep GPUs running cool
6. **Scale Up**: Build from bedroom hobbyist to data center operator

### Tips

- Start with jobs that match your GPU's VRAM (don't overbid)
- Monitor GPU temperature - overheating causes failures
- Better locations have better cooling efficiency
- Idle GPUs still consume 10% power
- GPU health decreases faster when running hot
- Save money for location upgrades - they unlock more GPU slots

## Game Mechanics

### Economics
- Jobs pay based on actual compute pricing (~$1-3/hr for consumer GPUs)
- Electricity costs $0.12/kWh (configurable)
- Locations have monthly upkeep costs
- GPUs can be sold for resale value (based on health)

### Job System
- Jobs appear every 15 seconds
- Jobs expire after 60 seconds if not accepted
- Completion time depends on GPU performance
- Failure chance increases with high temps and low health

### GPU Health
- Starts at 100%
- Degrades based on temperature and usage
- Higher temps = faster degradation
- Low health increases job failure rate

### Locations
- **Bedroom**: 2 GPUs max, 500W power limit
- **Basement**: 4 GPUs, 1500W, better cooling
- **Garage**: 6 GPUs, 3000W
- **Colocation**: 12 GPUs, 8000W, professional cooling
- **Data Center**: 50 GPUs, 50000W, optimal conditions

## Tech Stack

- **Vite**: Fast build tool and dev server
- **React**: UI components and state management
- **JavaScript**: Game logic and mechanics
- **CSS**: Custom styling with cyberpunk aesthetic

## Roadmap

### Completed ✅
- Core game loop (jobs, earning, upgrades)
- Realistic GPU data and economics
- Location progression system
- Save/load with localStorage
- Full UI with stats, GPUs, jobs, shop

### Future Features 🚀
- 2D isometric visualization with Phaser.js
- Random events (power outages, heat waves, hardware failures)
- Competition from other node operators
- Advanced bidding system
- Integration with Gensyn testnet
- Leaderboards
- Achievement system
- Tutorial mode

## Contributing

This is a demonstration project for the Gensyn community. Feel free to fork and enhance!

## License

MIT

## Credits

Built for the Gensyn decentralized AI compute protocol community.

---

**Note**: This is a simulation game for educational and entertainment purposes. Real GPU node operation may differ in profitability and complexity.
