# GensynFarm - GPU Node Operator Simulator

A realistic simulation game where you build and manage a GPU compute business on the Gensyn decentralized AI network.

## About

GensynFarm is a web-based simulation game that teaches real concepts about running GPU compute nodes while being fun to play. Start with a single consumer GPU in your bedroom and scale up to a professional data center operation.

**Walk around your operation, interact with your hardware, and watch your GPUs work in real-time with visual status indicators!**

## Features

### Character Movement & Interaction
- **Walk Around**: Control your character using WASD or arrow keys
- **2D Room View**: Top-down visualization of your physical space powered by Phaser.js
- **Interactive GPUs**: Walk up to hardware and press E to view detailed stats
- **Visual Status Lights**: See GPU status at a glance (green=running, red=error, orange=overheating)
- **Location-Specific Layouts**: Each location has unique room size, layout, and props

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
- **Random Errors**: GPUs can experience VRAM errors, driver crashes, thermal shutdowns, and power spikes
- **Error Recovery**: Auto-recovery after 30 seconds or manual restart
- **Job failures**: High temps and low health dramatically increase error rates

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

### Controls
- **WASD / Arrow Keys**: Move your character around the room
- **E**: Interact with nearby GPUs to view detailed stats
- **Mouse**: Click UI elements to accept jobs, buy hardware, and manage your operation

### Gameplay Loop
1. **Walk Around**: Explore your physical space and check on your GPUs
2. **Accept Jobs**: Browse available compute jobs and accept ones that match your GPU capabilities
3. **Monitor Hardware**: Watch status lights and interact with GPUs to check temperature and health
4. **Earn Money**: Complete jobs successfully to earn cash and reputation
5. **Buy Hardware**: Invest in better GPUs for higher-paying jobs
6. **Upgrade Location**: Move to bigger spaces as you scale
7. **Manage Costs**: Watch your power bills and keep GPUs running cool
8. **Scale Up**: Build from bedroom hobbyist to data center operator

### Tips

- **Walk up to your GPUs** to check their real-time status and stats
- **Watch the status lights**: Green = safe, Orange = hot, Red = error
- Start with jobs that match your GPU's VRAM (don't overbid)
- Monitor GPU temperature - overheating causes failures and errors
- Better locations have better cooling efficiency
- Idle GPUs still consume 10% power
- GPU health decreases faster when running hot (>80°C)
- Errors are more likely when GPUs are hot (>85°C) or degraded (<50% health)
- Save money for location upgrades - they unlock more GPU slots
- Use Force Restart if a GPU gets stuck in an error state

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
- **Phaser.js**: 2D game engine for character movement and room visualization
- **JavaScript**: Game logic and mechanics
- **CSS**: Custom styling with cyberpunk aesthetic

## Deployment

### Deploy to Render

GensynFarm is configured for easy deployment on Render:

**Option 1: Automatic Deployment (Recommended)**

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Static Site"
4. Connect your GitHub repository
5. Render will auto-detect the `render.yaml` configuration
6. Click "Create Static Site"

That's it! Render will automatically:
- Run `npm install && npm run build`
- Deploy the `dist` folder
- Set up proper caching headers
- Handle SPA routing with redirects

**Option 2: Manual Configuration**

If not using `render.yaml`:

1. **Build Command**: `npm install && npm run build`
2. **Publish Directory**: `dist`
3. **Add Redirect Rule**: `/*` → `/index.html` (200)

### Deploy to Other Platforms

**Netlify:**
```bash
npm run build
# Drag and drop the 'dist' folder to Netlify
```

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**GitHub Pages:**
```bash
npm run build
# Use gh-pages to deploy the dist folder
```

### Environment Variables

No environment variables needed! The game runs entirely client-side.

## Roadmap

### Completed ✅
- Core game loop (jobs, earning, upgrades)
- Realistic GPU data and economics
- Location progression system
- Save/load with localStorage
- Full UI with stats, GPUs, jobs, shop
- **2D room visualization with Phaser.js** ✨
- **Character movement and interaction** 🎮
- **Visual GPU monitors with status lights** 💡
- **Random error system (VRAM, driver, thermal, power)** ⚠️
- **Auto-recovery and manual restart** 🔄
- **Location-specific room layouts** 🏠

### Future Features 🚀
- Random events (power outages, heat waves)
- Competition from other node operators
- Advanced bidding system
- Integration with Gensyn testnet
- Leaderboards
- Achievement system
- Tutorial mode
- Better character sprite animations
- Sound effects and background music

## Contributing

This is a demonstration project for the Gensyn community. Feel free to fork and enhance!

## License

MIT

## Credits

Built for the Gensyn decentralized AI compute protocol community.

---

**Note**: This is a simulation game for educational and entertainment purposes. Real GPU node operation may differ in profitability and complexity.
