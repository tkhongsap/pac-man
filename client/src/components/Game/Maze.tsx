import { CELL_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { MazeCell, DotState, PowerPelletState } from "./types";

// Colors
const WALL_COLOR = "#2121FF"; // Blue maze walls
const DOT_COLOR = "#FFFA9D";  // Light yellow dots
const POWER_PELLET_COLOR = "#FFFA9D"; // Same color as dots but larger

// Constants for drawing
const DOT_RADIUS = 2;
const POWER_PELLET_RADIUS = 6;
const WALL_THICKNESS = 2;

/**
 * Draws the maze walls on the canvas
 */
export const drawMaze = (ctx: CanvasRenderingContext2D, maze: MazeCell[][]) => {
  ctx.fillStyle = WALL_COLOR;
  
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === MazeCell.WALL) {
        ctx.fillRect(
          x * CELL_SIZE, 
          y * CELL_SIZE, 
          CELL_SIZE, 
          CELL_SIZE
        );
      }
    }
  }
  
  // Draw maze border
  ctx.strokeStyle = WALL_COLOR;
  ctx.lineWidth = WALL_THICKNESS * 2;
  ctx.strokeRect(
    WALL_THICKNESS, 
    WALL_THICKNESS, 
    CANVAS_WIDTH - WALL_THICKNESS * 2, 
    CANVAS_HEIGHT - WALL_THICKNESS * 2
  );
};

/**
 * Draws the dots (small food pellets) on the canvas
 */
export const drawDots = (ctx: CanvasRenderingContext2D, dots: DotState[]) => {
  ctx.fillStyle = DOT_COLOR;
  
  dots.forEach(dot => {
    if (dot.visible) {
      const centerX = dot.x * CELL_SIZE + CELL_SIZE / 2;
      const centerY = dot.y * CELL_SIZE + CELL_SIZE / 2;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
  });
};

/**
 * Draws the power pellets (large food pellets) on the canvas
 */
export const drawPowerPellets = (ctx: CanvasRenderingContext2D, powerPellets: PowerPelletState[]) => {
  ctx.fillStyle = POWER_PELLET_COLOR;
  
  // Make power pellets pulse for visual effect
  const pulseScale = 1 + 0.2 * Math.sin(Date.now() / 200);
  const radius = POWER_PELLET_RADIUS * pulseScale;
  
  powerPellets.forEach(pellet => {
    if (pellet.visible) {
      const centerX = pellet.x * CELL_SIZE + CELL_SIZE / 2;
      const centerY = pellet.y * CELL_SIZE + CELL_SIZE / 2;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  });
};
