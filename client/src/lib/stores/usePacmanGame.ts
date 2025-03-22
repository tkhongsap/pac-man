import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { 
  PacmanState, 
  GhostState, 
  DotState, 
  PowerPelletState, 
  GameState,
  Direction,
  MazeCell,
  GhostType
} from "@/components/Game/types";
import { 
  INITIAL_MAZE, 
  ROWS, 
  COLS,
  PACMAN_SPEED,
  GHOST_SPEED,
  SCARED_GHOST_SPEED,
  POWER_MODE_DURATION,
  INITIAL_LIVES,
  POINTS_DOT,
  POINTS_POWER_PELLET,
  POINTS_GHOST,
  GHOST_HOME_X,
  GHOST_HOME_Y
} from "@/components/Game/constants";
import { playSound, playChompSound } from "@/assets/sounds";

interface PacmanGameState {
  // Game state
  gameState: GameState;
  score: number;
  lives: number;
  level: number;
  
  // Entity states
  maze: MazeCell[][];
  pacman: PacmanState;
  ghosts: GhostState[];
  dots: DotState[];
  powerPellets: PowerPelletState[];
  
  // Power mode
  powerModeTimeLeft: number;
  powerModeTimerId: number | null;
  
  // Ghost respawn queue
  ghostRespawnQueue: GhostType[];
  
  // Game functions
  initializeGame: () => void;
  startGame: () => void;
  resetGame: () => void;
  endGame: () => void;
  setDirection: (direction: Direction) => void;
  updatePacmanPosition: () => void;
  updatePacmanMouth: (isOpen: boolean) => void;
  updateGhostPositions: () => void;
  checkCollisions: () => void;
  checkVictory: () => void;
  activatePowerMode: () => void;
  deactivatePowerMode: () => void;
  addScore: (points: number) => void;
  loseLife: () => void;
}

export const usePacmanGame = create<PacmanGameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial game state
    gameState: "menu",
    score: 0,
    lives: INITIAL_LIVES,
    level: 1,
    
    // Initialize entity states
    maze: [],
    pacman: {
      x: 14,
      y: 23,
      direction: "left",
      nextDirection: null,
      mouthOpen: true,
      powerMode: false
    },
    ghosts: [],
    dots: [],
    powerPellets: [],
    
    // Power mode state
    powerModeTimeLeft: 0,
    powerModeTimerId: null,
    
    // Ghost respawn queue
    ghostRespawnQueue: [],
    
    // Initialize game
    initializeGame: () => {
      // Create a deep copy of the initial maze
      const maze = INITIAL_MAZE.map(row => [...row]);
      
      // Initialize dots and power pellets arrays
      const dots: DotState[] = [];
      const powerPellets: PowerPelletState[] = [];
      
      // Parse the maze to place dots and power pellets
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          if (maze[y][x] === MazeCell.DOT) {
            dots.push({ x, y, visible: true });
            // Change the maze cell to empty since we've extracted the dot
            maze[y][x] = MazeCell.EMPTY;
          } else if (maze[y][x] === MazeCell.POWER_PELLET) {
            powerPellets.push({ x, y, visible: true });
            // Change the maze cell to empty since we've extracted the power pellet
            maze[y][x] = MazeCell.EMPTY;
          }
        }
      }
      
      // Initialize Pacman
      const pacman: PacmanState = {
        x: 14,
        y: 23,
        direction: "left",
        nextDirection: null,
        mouthOpen: true,
        powerMode: false
      };
      
      // Initialize ghosts
      const ghosts: GhostState[] = [
        {
          x: 13,
          y: 14,
          type: "blinky",
          direction: "up",
          scared: false,
          homeX: 13,
          homeY: 14,
          returningHome: false
        },
        {
          x: 14,
          y: 14,
          type: "pinky",
          direction: "right",
          scared: false,
          homeX: 14,
          homeY: 14,
          returningHome: false
        },
        {
          x: 13,
          y: 15,
          type: "inky",
          direction: "down",
          scared: false,
          homeX: 13,
          homeY: 15,
          returningHome: false
        },
        {
          x: 14,
          y: 15,
          type: "clyde",
          direction: "left",
          scared: false,
          homeX: 14,
          homeY: 15,
          returningHome: false
        }
      ];
      
      set({
        maze,
        pacman,
        ghosts,
        dots,
        powerPellets,
        score: 0,
        lives: INITIAL_LIVES,
        level: 1,
        gameState: "playing",
        powerModeTimeLeft: 0,
        powerModeTimerId: null,
        ghostRespawnQueue: []
      });
    },
    
    // Start game
    startGame: () => {
      set({ gameState: "playing" });
      get().initializeGame();
    },
    
    // Reset game
    resetGame: () => {
      set({ gameState: "menu" });
    },
    
    // End game
    endGame: () => {
      if (get().lives <= 0) {
        set({ gameState: "gameover" });
      }
    },
    
    // Set Pacman direction
    setDirection: (direction: Direction) => {
      const { pacman, maze } = get();
      
      // Calculate potential next position
      let nextX = pacman.x;
      let nextY = pacman.y;
      
      switch (direction) {
        case "up":
          nextY -= 1;
          break;
        case "down":
          nextY += 1;
          break;
        case "left":
          nextX -= 1;
          break;
        case "right":
          nextX += 1;
          break;
      }
      
      // Wrap around maze for tunnels
      if (nextX < 0) nextX = COLS - 1;
      if (nextX >= COLS) nextX = 0;
      if (nextY < 0) nextY = ROWS - 1;
      if (nextY >= ROWS) nextY = 0;
      
      // Only set the direction if there's no wall in that direction
      if (maze[nextY][nextX] !== MazeCell.WALL) {
        set(state => ({
          pacman: {
            ...state.pacman,
            direction,
            nextDirection: null
          }
        }));
      } else {
        // Queue the direction change for when it becomes possible
        set(state => ({
          pacman: {
            ...state.pacman,
            nextDirection: direction
          }
        }));
      }
    },
    
    // Update Pacman position
    updatePacmanPosition: () => {
      const { pacman, maze } = get();
      
      let { x, y, direction, nextDirection } = pacman;
      
      // Try to use nextDirection if it's set
      if (nextDirection) {
        // Calculate potential next position
        let testX = x;
        let testY = y;
        
        switch (nextDirection) {
          case "up":
            testY -= 1;
            break;
          case "down":
            testY += 1;
            break;
          case "left":
            testX -= 1;
            break;
          case "right":
            testX += 1;
            break;
        }
        
        // Wrap around maze for tunnels
        if (testX < 0) testX = COLS - 1;
        if (testX >= COLS) testX = 0;
        if (testY < 0) testY = ROWS - 1;
        if (testY >= ROWS) testY = 0;
        
        // Check if we can move in the nextDirection
        if (maze[testY][testX] !== MazeCell.WALL) {
          // Update direction to queued direction
          direction = nextDirection;
          nextDirection = null;
        }
      }
      
      // Calculate new position based on current direction
      let newX = x;
      let newY = y;
      
      switch (direction) {
        case "up":
          newY -= PACMAN_SPEED;
          break;
        case "down":
          newY += PACMAN_SPEED;
          break;
        case "left":
          newX -= PACMAN_SPEED;
          break;
        case "right":
          newX += PACMAN_SPEED;
          break;
      }
      
      // Handle tunnel wrapping
      if (newX < 0) newX = COLS - 1;
      if (newX >= COLS) newX = 0;
      if (newY < 0) newY = ROWS - 1;
      if (newY >= ROWS) newY = 0;
      
      // Check if the new position is a wall
      // Need to check integer position to align with maze grid
      const gridX = Math.floor(newX);
      const gridY = Math.floor(newY);
      
      if (maze[gridY][gridX] !== MazeCell.WALL) {
        // Update Pacman's position
        set(state => ({
          pacman: {
            ...state.pacman,
            x: newX,
            y: newY,
            direction,
            nextDirection
          }
        }));
      }
    },
    
    // Update Pacman's mouth animation
    updatePacmanMouth: (isOpen: boolean) => {
      set(state => ({
        pacman: {
          ...state.pacman,
          mouthOpen: isOpen
        }
      }));
    },
    
    // Update ghost positions
    updateGhostPositions: () => {
      const { ghosts, maze, pacman } = get();
      
      // Update each ghost
      const updatedGhosts = ghosts.map(ghost => {
        // If ghost is returning home, guide it directly there
        if (ghost.returningHome) {
          return moveGhostHome(ghost, maze);
        }
        
        // Decide on a new direction
        const newDirection = decideGhostDirection(ghost, pacman, maze);
        
        // Move the ghost in the new direction
        return moveGhost(ghost, newDirection, maze);
      });
      
      set({ ghosts: updatedGhosts });
    },
    
    // Check for collisions with dots, power pellets, and ghosts
    checkCollisions: () => {
      const { pacman, dots, powerPellets, ghosts } = get();
      
      // Check for dot collisions
      const gridX = Math.floor(pacman.x);
      const gridY = Math.floor(pacman.y);
      
      // Dot collision
      let dotEaten = false;
      const updatedDots = dots.map(dot => {
        if (dot.visible && dot.x === gridX && dot.y === gridY) {
          dotEaten = true;
          return { ...dot, visible: false };
        }
        return dot;
      });
      
      if (dotEaten) {
        playChompSound();
        get().addScore(POINTS_DOT);
        set({ dots: updatedDots });
      }
      
      // Power pellet collision
      let pelletEaten = false;
      const updatedPellets = powerPellets.map(pellet => {
        if (pellet.visible && pellet.x === gridX && pellet.y === gridY) {
          pelletEaten = true;
          return { ...pellet, visible: false };
        }
        return pellet;
      });
      
      if (pelletEaten) {
        playSound("powerup");
        get().addScore(POINTS_POWER_PELLET);
        get().activatePowerMode();
        set({ powerPellets: updatedPellets });
      }
      
      // Ghost collision
      const updatedGhosts = ghosts.map(ghost => {
        // Check if pacman and ghost are within collision range
        const distX = Math.abs(pacman.x - ghost.x);
        const distY = Math.abs(pacman.y - ghost.y);
        
        // If they overlap (allowing for a bit of leeway)
        if (distX < 0.7 && distY < 0.7) {
          if (ghost.scared) {
            // Eat the ghost
            playSound("ghost");
            get().addScore(POINTS_GHOST);
            
            // Ghost returns to home
            return {
              ...ghost,
              scared: false,
              returningHome: true
            };
          } else if (!ghost.returningHome) {
            // Ghost caught Pacman
            playSound("death");
            get().loseLife();
            
            // Reset Pacman and ghosts positions
            setTimeout(() => {
              if (get().lives > 0) {
                set(state => ({
                  pacman: {
                    ...state.pacman,
                    x: 14,
                    y: 23,
                    direction: "left",
                    nextDirection: null
                  },
                  ghosts: state.ghosts.map(g => ({
                    ...g,
                    x: g.homeX,
                    y: g.homeY,
                    scared: false,
                    returningHome: false
                  }))
                }));
              }
            }, 1500);
          }
        }
        return ghost;
      });
      
      set({ ghosts: updatedGhosts });
    },
    
    // Check if all dots and power pellets have been eaten
    checkVictory: () => {
      const { dots, powerPellets, gameState } = get();
      
      if (gameState !== "playing") return;
      
      // Check if all dots and power pellets are eaten
      const allDotsEaten = dots.every(dot => !dot.visible);
      const allPowerPelletsEaten = powerPellets.every(pellet => !pellet.visible);
      
      if (allDotsEaten && allPowerPelletsEaten) {
        set({ gameState: "victory" });
      }
    },
    
    // Activate power mode
    activatePowerMode: () => {
      const { powerModeTimerId } = get();
      
      // Clear any existing power mode timer
      if (powerModeTimerId !== null) {
        clearTimeout(powerModeTimerId);
      }
      
      // Set all ghosts to scared
      set(state => ({
        ghosts: state.ghosts.map(ghost => ({
          ...ghost,
          scared: true
        })),
        pacman: {
          ...state.pacman,
          powerMode: true
        },
        powerModeTimeLeft: POWER_MODE_DURATION
      }));
      
      // Set a countdown to update the time remaining
      const countdownInterval = setInterval(() => {
        set(state => ({
          powerModeTimeLeft: Math.max(0, state.powerModeTimeLeft - 100)
        }));
        
        // When time is up, deactivate
        if (get().powerModeTimeLeft <= 0) {
          clearInterval(countdownInterval);
          get().deactivatePowerMode();
        }
      }, 100);
      
      // Set a timer to end power mode
      const timerId = window.setTimeout(() => {
        get().deactivatePowerMode();
        clearInterval(countdownInterval);
      }, POWER_MODE_DURATION);
      
      set({ powerModeTimerId: timerId });
    },
    
    // Deactivate power mode
    deactivatePowerMode: () => {
      set(state => ({
        ghosts: state.ghosts.map(ghost => ({
          ...ghost,
          scared: false
        })),
        pacman: {
          ...state.pacman,
          powerMode: false
        },
        powerModeTimeLeft: 0,
        powerModeTimerId: null
      }));
    },
    
    // Add points to score
    addScore: (points: number) => {
      set(state => ({ score: state.score + points }));
    },
    
    // Lose a life
    loseLife: () => {
      set(state => {
        const newLives = state.lives - 1;
        return { 
          lives: newLives,
          gameState: newLives <= 0 ? "gameover" : "playing"
        };
      });
    }
  }))
);

// Helper function to decide ghost direction
function decideGhostDirection(
  ghost: GhostState, 
  pacman: PacmanState, 
  maze: MazeCell[][]
): Direction {
  // If ghost is scared, make random movements
  if (ghost.scared) {
    return getRandomDirection(ghost, maze);
  }
  
  // Different ghosts have different behaviors
  switch (ghost.type) {
    case "blinky": // Direct chase
      return chaseTarget(ghost, pacman.x, pacman.y, maze);
    
    case "pinky": // Ambush ahead of Pacman
      let targetX = pacman.x;
      let targetY = pacman.y;
      
      // Target 4 tiles ahead of Pacman
      switch (pacman.direction) {
        case "up":
          targetY -= 4;
          break;
        case "down":
          targetY += 4;
          break;
        case "left":
          targetX -= 4;
          break;
        case "right":
          targetX += 4;
          break;
      }
      
      return chaseTarget(ghost, targetX, targetY, maze);
    
    case "inky": // Complex behavior, simplified here
      return getRandomDirection(ghost, maze);
    
    case "clyde": // Random when far, chase when close
      const distToPacman = Math.sqrt(
        Math.pow(ghost.x - pacman.x, 2) + Math.pow(ghost.y - pacman.y, 2)
      );
      
      if (distToPacman > 8) {
        return getRandomDirection(ghost, maze);
      } else {
        return chaseTarget(ghost, pacman.x, pacman.y, maze);
      }
  }
}

// Helper function to get available directions
function getAvailableDirections(ghost: GhostState, maze: MazeCell[][]): Direction[] {
  const { x, y, direction } = ghost;
  const available: Direction[] = [];
  
  // Check each direction
  if (canMoveInDirection(x, y, "up", maze) && direction !== "down") {
    available.push("up");
  }
  if (canMoveInDirection(x, y, "down", maze) && direction !== "up") {
    available.push("down");
  }
  if (canMoveInDirection(x, y, "left", maze) && direction !== "right") {
    available.push("left");
  }
  if (canMoveInDirection(x, y, "right", maze) && direction !== "left") {
    available.push("right");
  }
  
  // If no valid directions, allow reverse direction
  if (available.length === 0) {
    switch (direction) {
      case "up":
        if (canMoveInDirection(x, y, "down", maze)) available.push("down");
        break;
      case "down":
        if (canMoveInDirection(x, y, "up", maze)) available.push("up");
        break;
      case "left":
        if (canMoveInDirection(x, y, "right", maze)) available.push("right");
        break;
      case "right":
        if (canMoveInDirection(x, y, "left", maze)) available.push("left");
        break;
    }
  }
  
  return available;
}

// Helper function to check if a ghost can move in a direction
function canMoveInDirection(
  x: number, 
  y: number, 
  direction: Direction, 
  maze: MazeCell[][]
): boolean {
  // Calculate integer position
  const gridX = Math.floor(x);
  const gridY = Math.floor(y);
  
  // Calculate potential next position
  let nextX = gridX;
  let nextY = gridY;
  
  switch (direction) {
    case "up":
      nextY -= 1;
      break;
    case "down":
      nextY += 1;
      break;
    case "left":
      nextX -= 1;
      break;
    case "right":
      nextX += 1;
      break;
  }
  
  // Wrap around for tunnels
  if (nextX < 0) nextX = COLS - 1;
  if (nextX >= COLS) nextX = 0;
  if (nextY < 0) nextY = ROWS - 1;
  if (nextY >= ROWS) nextY = 0;
  
  // Check if the next cell is a wall
  return maze[nextY][nextX] !== MazeCell.WALL;
}

// Get a random valid direction
function getRandomDirection(ghost: GhostState, maze: MazeCell[][]): Direction {
  const available = getAvailableDirections(ghost, maze);
  
  if (available.length === 0) {
    // Default to current direction if no options
    return ghost.direction;
  }
  
  return available[Math.floor(Math.random() * available.length)];
}

// Chase target position
function chaseTarget(
  ghost: GhostState, 
  targetX: number, 
  targetY: number, 
  maze: MazeCell[][]
): Direction {
  const available = getAvailableDirections(ghost, maze);
  
  if (available.length === 0) {
    return ghost.direction;
  }
  
  // Find direction that minimizes distance to target
  let bestDirection = available[0];
  let shortestDistance = Infinity;
  
  available.forEach(direction => {
    let nextX = ghost.x;
    let nextY = ghost.y;
    
    switch (direction) {
      case "up":
        nextY -= 1;
        break;
      case "down":
        nextY += 1;
        break;
      case "left":
        nextX -= 1;
        break;
      case "right":
        nextX += 1;
        break;
    }
    
    const distance = Math.sqrt(
      Math.pow(nextX - targetX, 2) + Math.pow(nextY - targetY, 2)
    );
    
    if (distance < shortestDistance) {
      shortestDistance = distance;
      bestDirection = direction;
    }
  });
  
  return bestDirection;
}

// Move ghost based on direction
function moveGhost(
  ghost: GhostState, 
  direction: Direction, 
  maze: MazeCell[][]
): GhostState {
  let { x, y } = ghost;
  
  // Speed is reduced while scared
  const speed = ghost.scared ? SCARED_GHOST_SPEED : GHOST_SPEED;
  
  // Move in the specified direction
  switch (direction) {
    case "up":
      y -= speed;
      break;
    case "down":
      y += speed;
      break;
    case "left":
      x -= speed;
      break;
    case "right":
      x += speed;
      break;
  }
  
  // Wrap around for tunnels
  if (x < 0) x = COLS - 1;
  if (x >= COLS) x = 0;
  if (y < 0) y = ROWS - 1;
  if (y >= ROWS) y = 0;
  
  return {
    ...ghost,
    x,
    y,
    direction
  };
}

// Move ghost back to home base
function moveGhostHome(ghost: GhostState, maze: MazeCell[][]): GhostState {
  // Calculate direction to home
  const direction = chaseTarget(
    ghost, 
    ghost.homeX, 
    ghost.homeY, 
    maze
  );
  
  // Move faster when returning home
  let { x, y } = ghost;
  const speed = GHOST_SPEED * 1.5;
  
  switch (direction) {
    case "up":
      y -= speed;
      break;
    case "down":
      y += speed;
      break;
    case "left":
      x -= speed;
      break;
    case "right":
      x += speed;
      break;
  }
  
  // Wrap around for tunnels
  if (x < 0) x = COLS - 1;
  if (x >= COLS) x = 0;
  if (y < 0) y = ROWS - 1;
  if (y >= ROWS) y = 0;
  
  // Check if ghost has arrived home
  const gridX = Math.floor(x);
  const gridY = Math.floor(y);
  const arrivedHome = 
    gridX === ghost.homeX && 
    gridY === ghost.homeY;
  
  return {
    ...ghost,
    x,
    y,
    direction,
    returningHome: !arrivedHome
  };
}
