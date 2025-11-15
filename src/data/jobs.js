// Realistic ML workload types based on actual AI/ML tasks
export const JOB_TYPES = {
  sd_inference: {
    id: 'sd_inference',
    name: 'Stable Diffusion Inference',
    description: 'Generate images from text prompts',
    minVRAM: 8,
    recommendedVRAM: 12,
    baseTime: 30, // seconds
    basePay: 0.5, // dollars
    vramUsage: 0.6, // % of GPU VRAM
    powerMultiplier: 0.95, // % of max power draw
    verificationTime: 5,
    failureChance: 0.02,
  },
  llm_inference_small: {
    id: 'llm_inference_small',
    name: 'LLM Inference (7B)',
    description: 'Run inference on small language models (7B params)',
    minVRAM: 10,
    recommendedVRAM: 16,
    baseTime: 60,
    basePay: 1.2,
    vramUsage: 0.7,
    powerMultiplier: 0.85,
    verificationTime: 8,
    failureChance: 0.03,
  },
  llm_inference_medium: {
    id: 'llm_inference_medium',
    name: 'LLM Inference (13B)',
    description: 'Run inference on medium language models (13B params)',
    minVRAM: 16,
    recommendedVRAM: 24,
    baseTime: 90,
    basePay: 2.0,
    vramUsage: 0.8,
    powerMultiplier: 0.9,
    verificationTime: 10,
    failureChance: 0.04,
  },
  llm_inference_large: {
    id: 'llm_inference_large',
    name: 'LLM Inference (70B)',
    description: 'Run inference on large language models (70B params)',
    minVRAM: 40,
    recommendedVRAM: 80,
    baseTime: 180,
    basePay: 5.0,
    vramUsage: 0.9,
    powerMultiplier: 0.95,
    verificationTime: 15,
    failureChance: 0.05,
  },
  fine_tuning_small: {
    id: 'fine_tuning_small',
    name: 'Fine-tuning (Small Model)',
    description: 'Fine-tune a small model on custom data',
    minVRAM: 12,
    recommendedVRAM: 24,
    baseTime: 300, // 5 minutes
    basePay: 4.0,
    vramUsage: 0.85,
    powerMultiplier: 1.0,
    verificationTime: 20,
    failureChance: 0.06,
  },
  fine_tuning_large: {
    id: 'fine_tuning_large',
    name: 'Fine-tuning (Large Model)',
    description: 'Fine-tune a large model on custom data',
    minVRAM: 40,
    recommendedVRAM: 80,
    baseTime: 600, // 10 minutes
    basePay: 10.0,
    vramUsage: 0.95,
    powerMultiplier: 1.0,
    verificationTime: 30,
    failureChance: 0.08,
  },
  batch_inference: {
    id: 'batch_inference',
    name: 'Batch Inference',
    description: 'Process multiple small inference tasks',
    minVRAM: 8,
    recommendedVRAM: 12,
    baseTime: 120,
    basePay: 2.5,
    vramUsage: 0.5,
    powerMultiplier: 0.8,
    verificationTime: 10,
    failureChance: 0.03,
  },
};

// Generate a random job based on available GPU capabilities
export const generateJob = (availableVRAM) => {
  const availableJobs = Object.values(JOB_TYPES).filter(
    job => job.minVRAM <= availableVRAM
  );

  if (availableJobs.length === 0) return null;

  const jobType = availableJobs[Math.floor(Math.random() * availableJobs.length)];

  return {
    id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: jobType.id,
    ...jobType,
    createdAt: Date.now(),
  };
};

export const getJobById = (id) => JOB_TYPES[id];
