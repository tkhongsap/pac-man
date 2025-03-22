import { GhostState } from "./types";
import { CELL_SIZE } from "./constants";

// Ghost colors
const GHOST_COLORS = {
  blinky: "#FF0000", // Red
  pinky: "#FFC0CB",  // Pink
  inky: "#00FFFF",   // Cyan
  clyde: "#FFA500",  // Orange
};

// Ghost scared colors
const SCARED_COLOR = "#2121FF"; // Blue
const SCARED_END_COLOR = "#FFFFFF"; // White, flashing near end

// Constants for ghost drawing
const GHOST_RADIUS = CELL_SIZE / 2 - 2;

/**
 * Draws a single ghost on the canvas
 */
const drawGhost = (
  ctx: CanvasRenderingContext2D, 
  ghost: GhostState,
  isFlashing: boolean = false
) => {
  const { x, y, type, scared } = ghost;
  
  // Calculate center position
  const centerX = x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = y * CELL_SIZE + CELL_SIZE / 2;
  
  // Set ghost color based on state
  if (scared) {
    ctx.fillStyle = isFlashing ? SCARED_END_COLOR : SCARED_COLOR;
  } else {
    ctx.fillStyle = GHOST_COLORS[type];
  }
  
  // Draw ghost body (semi-circle top)
  ctx.beginPath();
  ctx.arc(
    centerX, 
    centerY - CELL_SIZE / 8, 
    GHOST_RADIUS, 
    Math.PI, 
    0, 
    false
  );
  
  // Draw the bottom part of the ghost (wavy edge)
  const bottomY = centerY + GHOST_RADIUS - CELL_SIZE / 8;
  const waveHeight = GHOST_RADIUS / 3;
  
  // Draw right side
  ctx.lineTo(centerX + GHOST_RADIUS, bottomY);
  
  // Draw wavy bottom (3 waves)
  ctx.lineTo(centerX + GHOST_RADIUS * 2/3, bottomY - waveHeight);
  ctx.lineTo(centerX + GHOST_RADIUS * 1/3, bottomY);
  ctx.lineTo(centerX, bottomY - waveHeight);
  ctx.lineTo(centerX - GHOST_RADIUS * 1/3, bottomY);
  ctx.lineTo(centerX - GHOST_RADIUS * 2/3, bottomY - waveHeight);
  ctx.lineTo(centerX - GHOST_RADIUS, bottomY);
  
  // Close the shape
  ctx.lineTo(centerX - GHOST_RADIUS, centerY - CELL_SIZE / 8);
  
  // Fill the ghost body
  ctx.fill();
  
  // Draw eyes (only if not scared)
  if (!scared) {
    // White part of eyes
    ctx.fillStyle = "white";
    
    // Left eye
    ctx.beginPath();
    ctx.arc(
      centerX - GHOST_RADIUS / 2.5, 
      centerY - CELL_SIZE / 8, 
      GHOST_RADIUS / 3, 
      0, 
      2 * Math.PI
    );
    ctx.fill();
    
    // Right eye
    ctx.beginPath();
    ctx.arc(
      centerX + GHOST_RADIUS / 2.5, 
      centerY - CELL_SIZE / 8, 
      GHOST_RADIUS / 3, 
      0, 
      2 * Math.PI
    );
    ctx.fill();
    
    // Pupils (black part of eyes)
    ctx.fillStyle = "black";
    
    // Left pupil
    ctx.beginPath();
    ctx.arc(
      centerX - GHOST_RADIUS / 2.5 + GHOST_RADIUS / 8, 
      centerY - CELL_SIZE / 8, 
      GHOST_RADIUS / 6, 
      0, 
      2 * Math.PI
    );
    ctx.fill();
    
    // Right pupil
    ctx.beginPath();
    ctx.arc(
      centerX + GHOST_RADIUS / 2.5 + GHOST_RADIUS / 8, 
      centerY - CELL_SIZE / 8, 
      GHOST_RADIUS / 6, 
      0, 
      2 * Math.PI
    );
    ctx.fill();
  } else {
    // Draw scared eyes (X shape)
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    
    // Left eye X
    const leftEyeX = centerX - GHOST_RADIUS / 2.5;
    const leftEyeY = centerY - CELL_SIZE / 8;
    const eyeSize = GHOST_RADIUS / 4;
    
    ctx.beginPath();
    ctx.moveTo(leftEyeX - eyeSize, leftEyeY - eyeSize);
    ctx.lineTo(leftEyeX + eyeSize, leftEyeY + eyeSize);
    ctx.moveTo(leftEyeX + eyeSize, leftEyeY - eyeSize);
    ctx.lineTo(leftEyeX - eyeSize, leftEyeY + eyeSize);
    ctx.stroke();
    
    // Right eye X
    const rightEyeX = centerX + GHOST_RADIUS / 2.5;
    const rightEyeY = centerY - CELL_SIZE / 8;
    
    ctx.beginPath();
    ctx.moveTo(rightEyeX - eyeSize, rightEyeY - eyeSize);
    ctx.lineTo(rightEyeX + eyeSize, rightEyeY + eyeSize);
    ctx.moveTo(rightEyeX + eyeSize, rightEyeY - eyeSize);
    ctx.lineTo(rightEyeX - eyeSize, rightEyeY + eyeSize);
    ctx.stroke();
  }
};

/**
 * Draws all ghosts on the canvas
 */
export const drawGhosts = (ctx: CanvasRenderingContext2D, ghosts: GhostState[]) => {
  const { powerModeTimeLeft } = usePacmanGame.getState();
  
  // Check if ghosts should flash (when power mode is about to end)
  const isFlashing = powerModeTimeLeft > 0 && powerModeTimeLeft < 2000 && 
                    Math.floor(Date.now() / 250) % 2 === 0;
  
  // Draw each ghost
  ghosts.forEach(ghost => {
    drawGhost(ctx, ghost, isFlashing);
  });
};

// Import at the end to avoid circular dependencies
import { usePacmanGame } from "@/lib/stores/usePacmanGame";
