// Gensyn Protocol Products - Real product definitions
export const GENSYN_PRODUCTS = {
  blockassist: {
    id: 'blockassist',
    name: 'BlockAssist',
    description: 'AI Minecraft assistant using assistance learning and MCTS',
    icon: '🎮',
    unlockLevel: 5,
    unlockCost: 1000,
    category: 'training',
    docs: 'https://docs.gensyn.ai/blockassist',
  },
  codeassist: {
    id: 'codeassist',
    name: 'CodeAssist',
    description: 'AI coding assistant trained from your problem-solving style',
    icon: '💻',
    unlockLevel: 15,
    unlockCost: 5000,
    category: 'training',
    docs: 'https://docs.gensyn.ai/codeassist',
  },
  codezero: {
    id: 'codezero',
    name: 'CodeZero',
    description: 'Collaborative multi-agent coding with execution-free evaluation',
    icon: '⚡',
    unlockLevel: 20,
    unlockCost: 10000,
    category: 'optimization',
    docs: 'https://docs.gensyn.ai/codezero',
  },
  rl_swarm: {
    id: 'rl_swarm',
    name: 'RL Swarm',
    description: 'Distributed collaborative reinforcement learning via gossip protocol',
    icon: '🐝',
    unlockLevel: 10,
    unlockCost: 2500,
    category: 'training',
    docs: 'https://docs.gensyn.ai/rl-swarm',
  },
};

// Product status states
export const PRODUCT_STATUS = {
  LOCKED: 'locked',
  IDLE: 'idle',
  RUNNING: 'running',
  WARNING: 'warning',
  ERROR: 'error',
  OFFLINE: 'offline',
};

// Error types for each product
export const PRODUCT_ERRORS = {
  blockassist: {
    minecraft_crash: {
      name: 'Minecraft Process Terminated',
      message: 'Minecraft process terminated unexpectedly. Episode progress lost.',
      severity: 'critical',
      recovery: 'restart',
      impact: 'Episode data auto-saved. Model training cancelled for this episode.',
    },
    hf_auth_failed: {
      name: 'Hugging Face Authentication Failed',
      message: 'Invalid HF token — upload rejected',
      severity: 'warning',
      recovery: 'reconfigure',
      impact: 'Model trained but not published. Local copy saved.',
    },
    vram_exhausted: {
      name: 'CUDA Out of Memory',
      message: 'RuntimeError: CUDA out of memory during training',
      severity: 'critical',
      recovery: 'wait',
      impact: 'Training must wait for other jobs to complete.',
    },
    upload_timeout: {
      name: 'Hugging Face Upload Timeout',
      message: 'Network timeout during model upload to Hugging Face',
      severity: 'warning',
      recovery: 'retry',
      impact: 'Model saved locally but not synced to network.',
    },
  },
  codeassist: {
    env_missing: {
      name: 'Environment Variable Missing',
      message: 'CodeAssist precondition check failed — GOOGLE_CLOUD_PROJECT not set',
      severity: 'warning',
      recovery: 'configure',
      impact: 'CodeAssist suggestions disabled until resolved.',
    },
    execution_timeout: {
      name: 'Code Execution Timeout',
      message: 'Code execution aborted — max runtime exceeded (30s)',
      severity: 'warning',
      recovery: 'review_code',
      impact: 'Test case fails. Check for infinite loops.',
    },
    syntax_error: {
      name: 'Syntax Error',
      message: 'SyntaxError at line {line}: {details}',
      severity: 'warning',
      recovery: 'fix_code',
      impact: 'Code won\'t run. Fix syntax errors to continue.',
    },
    model_load_failed: {
      name: 'Model Loading Failed',
      message: 'CodeAssist model loading failed — corrupted checkpoint',
      severity: 'critical',
      recovery: 'redownload',
      impact: 'CodeAssist unavailable until model is restored.',
    },
  },
  codezero: {
    bid_rejected: {
      name: 'Bid Rejected',
      message: 'CodeZero bid rejected — insufficient credits (Need: {required}, Have: {current})',
      severity: 'warning',
      recovery: 'earn_credits',
      impact: 'Can\'t participate in high-paying jobs until credits replenished.',
    },
    no_jobs_available: {
      name: 'No Matching Jobs',
      message: 'No CodeZero-optimized jobs available. Next job in ~2 min',
      severity: 'info',
      recovery: 'wait',
      impact: 'Idle time. Check CodeAssist jobs meanwhile.',
    },
    collab_timeout: {
      name: 'Collaboration Timeout',
      message: 'Collaboration timeout — peer disconnected during problem-solve',
      severity: 'warning',
      recovery: 'retry',
      impact: 'Job must be restarted with new peer group.',
    },
  },
  rl_swarm: {
    peer_disconnection: {
      name: 'Peer Skipped Round',
      message: 'Warning: Peer skipped round {round} due to slow processing. Joining round {next}',
      severity: 'warning',
      recovery: 'auto_rejoin',
      impact: 'Loss of rewards for skipped round. Reputation penalty.',
    },
    port_binding_failed: {
      name: 'Port Binding Failed',
      message: 'Error: Bind for 0.0.0.0:{port} failed — port already allocated',
      severity: 'warning',
      recovery: 'auto_port',
      impact: 'Temporary delay (~5 seconds) before node reconnects.',
    },
    auth_failed: {
      name: 'Authentication Failed',
      message: 'Login failed — please logout from previous session. Clear swarm.pem and retry',
      severity: 'critical',
      recovery: 'clear_auth',
      impact: 'Must re-authenticate. Session data lost but reputation preserved.',
    },
    protobuf_mismatch: {
      name: 'Protobuf Version Mismatch',
      message: 'Detected mismatched Protobuf GenCode/Runtime major versions. Upgrade required',
      severity: 'critical',
      recovery: 'auto_update',
      impact: '30-60 second downtime during upgrade.',
    },
    cuda_kernel_unavailable: {
      name: 'CUDA Kernel Not Available',
      message: 'RuntimeError: CUDA kernel not available for {gpu_model}',
      severity: 'critical',
      recovery: 'switch_gpu',
      impact: 'GPU incompatible with current job. Must use different hardware.',
    },
    network_timeout: {
      name: 'Network Timeout',
      message: 'Network timeout: Max retries exceeded, rejoining next round',
      severity: 'warning',
      recovery: 'auto_reconnect',
      impact: 'Lost connection. Auto-reconnecting to next available round.',
    },
    training_stalled: {
      name: 'Training Progress Stalled',
      message: 'Training progress stalled — waiting to confirm freeze...',
      severity: 'warning',
      recovery: 'wait',
      impact: 'Training may resume or require manual intervention.',
    },
  },
};

// Job types specific to Gensyn products
export const GENSYN_JOB_TYPES = {
  blockassist_training: {
    id: 'blockassist_training',
    name: 'BlockAssist Training Episode',
    description: 'Train AI Minecraft assistant through gameplay episodes',
    requiredProduct: 'blockassist',
    minVRAM: 8,
    recommendedVRAM: 12,
    baseTime: 180, // 3 minutes
    basePay: 3.5,
    vramUsage: 0.65,
    powerMultiplier: 0.9,
    verificationTime: 12,
    failureChance: 0.04,
    experienceGain: 25,
  },
  codeassist_challenge: {
    id: 'codeassist_challenge',
    name: 'CodeAssist Problem Solving',
    description: 'Solve coding challenges with AI assistance',
    requiredProduct: 'codeassist',
    minVRAM: 12,
    recommendedVRAM: 16,
    baseTime: 240, // 4 minutes
    basePay: 6.0,
    vramUsage: 0.7,
    powerMultiplier: 0.85,
    verificationTime: 15,
    failureChance: 0.05,
    experienceGain: 40,
  },
  codezero_collaborative: {
    id: 'codezero_collaborative',
    name: 'CodeZero Multi-Agent Solve',
    description: 'Collaborative coding with multiple AI models',
    requiredProduct: 'codezero',
    minVRAM: 16,
    recommendedVRAM: 24,
    baseTime: 300, // 5 minutes
    basePay: 8.5,
    vramUsage: 0.8,
    powerMultiplier: 0.95,
    verificationTime: 20,
    failureChance: 0.06,
    experienceGain: 60,
  },
  rl_swarm_session: {
    id: 'rl_swarm_session',
    name: 'RL Swarm Training Round',
    description: 'Participate in distributed RL training session',
    requiredProduct: 'rl_swarm',
    minVRAM: 8,
    recommendedVRAM: 12,
    baseTime: 360, // 6 minutes (3 phases)
    basePay: 4.5,
    vramUsage: 0.6,
    powerMultiplier: 0.8,
    verificationTime: 17, // actual average from docs
    failureChance: 0.03,
    experienceGain: 35,
    phases: ['solve', 'evaluate', 'vote'],
  },
};

export const getProductById = (id) => GENSYN_PRODUCTS[id];
export const getProductErrors = (productId) => PRODUCT_ERRORS[productId] || {};
export const getGensynJobType = (jobId) => GENSYN_JOB_TYPES[jobId];
export const getUnlockedProducts = (level, ownedProducts) => {
  return Object.values(GENSYN_PRODUCTS).filter(
    product => level >= product.unlockLevel && ownedProducts.includes(product.id)
  );
};
