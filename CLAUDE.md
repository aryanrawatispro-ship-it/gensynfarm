I want to build a realistic GPU node operator simulation game for Gensyn (decentralized AI compute protocol). The game should feel authentic to people who actually run compute nodes or work in the AI/ML space.

CORE CONCEPT:
You play as someone starting a GPU compute business on the Gensyn network. Start small (single consumer GPU at home), grow into a professional operation (data center with enterprise hardware). The game should teach real concepts while being fun.

REALISTIC ELEMENTS TO INCLUDE:

Hardware Progression (based on real specs):
- Start: RTX 3060 12GB (~$300 used)
- Mid: RTX 4090 24GB or used A5000
- Late: A100 40GB/80GB, H100
- Include real constraints: power draw, cooling needs, VRAM limits
- Actual market prices (can be simplified/scaled)

Job Types (real ML workloads):
- LLM inference (needs high VRAM)
- Stable Diffusion generation (medium VRAM, fast)
- Model fine-tuning (long jobs, high pay)
- Batch inference jobs (multiple small tasks)
- Each has realistic requirements (VRAM, compute time, verification)

Real Operating Challenges:
- Power costs eat into profit (electricity bills)
- Thermal throttling if cooling is inadequate
- Job failures due to VRAM errors
- Network bandwidth affecting data transfer
- Hardware degradation over time
- Bidding too low = no jobs, too high = no profit

Authentic Progression Path:
- Start in bedroom/garage (1-2 GPUs max)
- Noise complaints → need to move to basement
- Power circuit limits → need electrical upgrade
- Heat issues in summer → AC costs spike
- Scale to small rack → colocation → data center

Economics That Make Sense:
- Jobs pay based on actual compute pricing (~$1-3/hr for consumer GPU)
- ROI periods should feel realistic (months, not hours)
- Competition from other nodes (dynamic pricing)
- Efficiency matters (perf per watt)
- Used hardware market (buy cheaper, sell when upgrading)

Visual Style:
- 2D isometric or top-down view (think Prison Architect, Game Dev Tycoon)
- See your actual space: room layout, racks, cooling, wiring
- Character walks around, interacts with hardware
- Clean UI showing real metrics: GPU temp, utilization, VRAM usage, power draw

Tech Stack:
- Web-based (easy sharing on Twitter)
- Phaser.js or PixiJS for 2D game engine
- React for UI/menus
- Can pull real data from Gensyn testnet if available
- Save progress to localStorage or backend

Gensyn-Specific Integration:
- Jobs come from "Gensyn network" (branded naturally)
- Reference real Gensyn concepts: proof of compute, verification
- Leaderboard could mirror actual testnet top providers
- Tutorial teaches real Gensyn setup process
- Advanced mode: actually submit to testnet

Target Audience:
- Gensyn community members who get the references
- ML engineers who understand the hardware
- Crypto/web3 people interested in DePIN
- Anyone curious about GPU compute economics

SUCCESS METRICS (what makes it feel real):
- Someone running actual nodes says "yeah this is accurate"
- Players learn real tradeoffs (VRAM vs cost, power vs performance)
- Progression feels earned, not grindy
- Numbers roughly match real-world GPU economics
- Community shares screenshots of their setups

Start with:
1. Basic game loop: accept job → process → earn → upgrade
2. Simple 2D room with 1-3 GPU slots
3. 3-5 realistic GPU options with real specs
4. Job queue system with realistic requirements
5. Basic economics (costs vs earnings)

Make it something the Gensyn team would actually want to share. Keep it authentic - no unrealistic "10x your GPUs in 1 hour" mobile game BS.
