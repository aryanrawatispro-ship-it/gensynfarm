import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.player = null;
    this.cursors = null;
    this.wasd = null;
    this.gpuObjects = [];
    this.interactionKey = null;
    this.nearestGPU = null;
    this.gameState = null;
    this.onInteract = null;
  }

  init(data) {
    this.gameState = data.gameState;
    this.onInteract = data.onInteract;
  }

  create() {
    // Create room based on location
    this.createRoom();

    // Create player character
    this.createPlayer();

    // Create GPU slots/racks
    this.createGPUSlots();

    // Setup controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.interactionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Interaction prompt text
    this.interactionText = this.add.text(400, 20, '', {
      fontSize: '14px',
      color: '#00ff88',
      backgroundColor: '#0a0e27',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5, 0).setDepth(100).setVisible(false);
  }

  createRoom() {
    const location = this.gameState.currentLocation;

    // Room dimensions based on location
    const roomSizes = {
      bedroom: { width: 600, height: 400 },
      basement: { width: 700, height: 500 },
      garage: { width: 800, height: 500 },
      colocation: { width: 600, height: 600 },
      datacenter: { width: 900, height: 700 },
    };

    const roomSize = roomSizes[location] || roomSizes.bedroom;

    // Background (floor)
    const floor = this.add.rectangle(
      400, 300,
      roomSize.width, roomSize.height,
      location === 'bedroom' ? 0x3a2a1a : location === 'datacenter' ? 0x2a2a2a : 0x1a2a1a
    );

    // Walls
    const wallThickness = 20;
    const wallColor = 0x1a1a1a;

    // Top wall
    this.add.rectangle(400, 300 - roomSize.height/2 - wallThickness/2, roomSize.width + wallThickness*2, wallThickness, wallColor);
    // Bottom wall
    this.add.rectangle(400, 300 + roomSize.height/2 + wallThickness/2, roomSize.width + wallThickness*2, wallThickness, wallColor);
    // Left wall
    this.add.rectangle(400 - roomSize.width/2 - wallThickness/2, 300, wallThickness, roomSize.height, wallColor);
    // Right wall
    this.add.rectangle(400 + roomSize.width/2 + wallThickness/2, 300, wallThickness, roomSize.height, wallColor);

    // Room details based on location
    if (location === 'bedroom') {
      // Bed
      this.add.rectangle(150, 150, 80, 120, 0x4a3a2a);
      this.add.text(150, 150, 'BED', { fontSize: '10px', color: '#888' }).setOrigin(0.5);

      // Desk
      this.add.rectangle(650, 200, 100, 60, 0x5a4a3a);
      this.add.text(650, 200, 'DESK', { fontSize: '10px', color: '#888' }).setOrigin(0.5);
    } else if (location === 'basement' || location === 'garage') {
      // Tool shelves
      this.add.rectangle(150, 250, 60, 200, 0x4a4a4a);
      this.add.text(150, 250, 'SHELF', { fontSize: '10px', color: '#888' }).setOrigin(0.5);
    } else if (location === 'datacenter') {
      // Server racks (background)
      for (let i = 0; i < 3; i++) {
        this.add.rectangle(150 + i * 100, 500, 80, 150, 0x2a2a3a);
        this.add.text(150 + i * 100, 500, 'RACK', { fontSize: '10px', color: '#888' }).setOrigin(0.5);
      }
    }

    // Add grid lines for visual appeal
    this.createGrid(roomSize);
  }

  createGrid(roomSize) {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x1a3a1a, 0.2);

    const startX = 400 - roomSize.width/2;
    const startY = 300 - roomSize.height/2;

    // Vertical lines
    for (let x = 0; x <= roomSize.width; x += 50) {
      graphics.lineBetween(startX + x, startY, startX + x, startY + roomSize.height);
    }

    // Horizontal lines
    for (let y = 0; y <= roomSize.height; y += 50) {
      graphics.lineBetween(startX, startY + y, startX + roomSize.width, startY + y);
    }
  }

  createPlayer() {
    // Player character (simple rectangle for now, can be replaced with sprite)
    const playerBody = this.add.rectangle(400, 300, 20, 30, 0x00aaff);
    const playerHead = this.add.circle(400, 285, 8, 0xffcc99);

    // Container for player parts
    this.player = this.add.container(400, 300, [playerBody, playerHead]);
    this.player.setSize(20, 30);
    this.player.setDepth(10);

    // Physics
    this.physics.world.enable(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.player.speed = 150;
  }

  createGPUSlots() {
    const location = this.gameState.currentLocation;

    // GPU rack positions based on location
    const slotPositions = {
      bedroom: [
        { x: 500, y: 400 },
        { x: 600, y: 400 },
      ],
      basement: [
        { x: 450, y: 350 },
        { x: 550, y: 350 },
        { x: 450, y: 450 },
        { x: 550, y: 450 },
      ],
      garage: [
        { x: 400, y: 300 },
        { x: 500, y: 300 },
        { x: 600, y: 300 },
        { x: 400, y: 400 },
        { x: 500, y: 400 },
        { x: 600, y: 400 },
      ],
      colocation: [
        { x: 350, y: 250 }, { x: 450, y: 250 }, { x: 550, y: 250 },
        { x: 350, y: 350 }, { x: 450, y: 350 }, { x: 550, y: 350 },
        { x: 350, y: 450 }, { x: 450, y: 450 }, { x: 550, y: 450 },
        { x: 350, y: 550 }, { x: 450, y: 550 }, { x: 550, y: 550 },
      ],
      datacenter: [
        { x: 450, y: 200 }, { x: 550, y: 200 }, { x: 650, y: 200 }, { x: 750, y: 200 },
        { x: 450, y: 300 }, { x: 550, y: 300 }, { x: 650, y: 300 }, { x: 750, y: 300 },
        { x: 450, y: 400 }, { x: 550, y: 400 }, { x: 650, y: 400 }, { x: 750, y: 400 },
      ],
    };

    const positions = slotPositions[location] || slotPositions.bedroom;

    // Clear existing GPU objects
    this.gpuObjects.forEach(obj => obj.destroy());
    this.gpuObjects = [];

    // Create GPU slots
    positions.forEach((pos, index) => {
      const gpu = this.gameState.ownedGPUs[index];

      if (gpu) {
        // GPU is installed - show it
        const color = this.getGPUColor(gpu.status);
        const gpuRect = this.add.rectangle(pos.x, pos.y, 60, 40, color);
        const gpuGlow = this.add.rectangle(pos.x, pos.y, 64, 44, color, 0.3);

        // Status indicator light
        const statusColor = this.getStatusLightColor(gpu.status);
        const statusLight = this.add.circle(pos.x + 25, pos.y - 15, 4, statusColor);
        statusLight.setData('pulse', true);

        // Label
        const label = this.add.text(pos.x, pos.y + 30, gpu.type.toUpperCase().substring(0, 8), {
          fontSize: '9px',
          color: '#888888',
        }).setOrigin(0.5);

        const container = this.add.container(0, 0, [gpuGlow, gpuRect, statusLight, label]);
        container.setData('gpu', gpu);
        container.setData('isGPU', true);

        this.gpuObjects.push(container);
      } else {
        // Empty slot
        const emptySlot = this.add.rectangle(pos.x, pos.y, 60, 40, 0x2a2a2a);
        emptySlot.setStrokeStyle(2, 0x4a4a4a, 0.5);

        const label = this.add.text(pos.x, pos.y, 'EMPTY', {
          fontSize: '9px',
          color: '#444444',
        }).setOrigin(0.5);

        const container = this.add.container(0, 0, [emptySlot, label]);
        container.setData('isEmpty', true);

        this.gpuObjects.push(container);
      }
    });
  }

  getGPUColor(status) {
    switch(status) {
      case 'running': return 0x00ff88;
      case 'error': return 0xff0000;
      case 'overheating': return 0xff6600;
      default: return 0x3a5a7a;
    }
  }

  getStatusLightColor(status) {
    switch(status) {
      case 'running': return 0x00ff00;
      case 'error': return 0xff0000;
      case 'overheating': return 0xff6600;
      default: return 0x888888;
    }
  }

  update(time, delta) {
    if (!this.player) return;

    // Movement
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      velocityX = -this.player.speed;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      velocityX = this.player.speed;
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      velocityY = -this.player.speed;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      velocityY = this.player.speed;
    }

    this.player.body.setVelocity(velocityX, velocityY);

    // Check proximity to GPUs
    this.checkGPUProximity();

    // Interaction
    if (Phaser.Input.Keyboard.JustDown(this.interactionKey) && this.nearestGPU) {
      const gpuData = this.nearestGPU.getData('gpu');
      if (gpuData && this.onInteract) {
        this.onInteract(gpuData);
      }
    }

    // Pulse status lights
    this.gpuObjects.forEach(obj => {
      const children = obj.list;
      children.forEach(child => {
        if (child.getData && child.getData('pulse')) {
          const pulse = Math.sin(time / 300) * 0.3 + 0.7;
          child.setAlpha(pulse);
        }
      });
    });
  }

  checkGPUProximity() {
    let closest = null;
    let closestDist = 80; // Interaction distance

    this.gpuObjects.forEach(obj => {
      if (obj.getData('isEmpty')) return;

      const bounds = obj.getBounds();
      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        bounds.centerX,
        bounds.centerY
      );

      if (dist < closestDist) {
        closest = obj;
        closestDist = dist;
      }
    });

    this.nearestGPU = closest;

    if (closest) {
      const gpu = closest.getData('gpu');
      this.interactionText.setText(`Press [E] to manage ${gpu.type.toUpperCase()}`);
      this.interactionText.setVisible(true);
    } else {
      this.interactionText.setVisible(false);
    }
  }

  // Method to update game state from outside
  updateGameState(newState) {
    this.gameState = newState;
    this.createGPUSlots(); // Recreate GPU slots with new state
  }
}
