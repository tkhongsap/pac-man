import { PacmanState } from "./types";
import { CELL_SIZE } from "./constants";

// Constants for Pacman drawing
const PACMAN_RADIUS = CELL_SIZE / 2 - 1; // Increased Pac-Man radius (was CELL_SIZE / 2 - 2)
const MOUTH_ANGLE_MIN = 0.1;
const MOUTH_ANGLE_MAX = 0.6;

/**
 * Draws the Pacman character on the canvas
 */
export const drawPacman = (ctx: CanvasRenderingContext2D, pacman: PacmanState) => {
  const { x, y, direction, mouthOpen, powerMode } = pacman;
  
  // Calculate center position of Pacman
  const centerX = x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = y * CELL_SIZE + CELL_SIZE / 2;
  
  // Set the color
  ctx.fillStyle = powerMode ? "#FFFFFF" : "#FFFF00";
  
  // Calculate mouth angle based on mouthOpen state
  const mouthAngle = mouthOpen 
    ? Math.PI * MOUTH_ANGLE_MAX 
    : Math.PI * MOUTH_ANGLE_MIN;
  
  // Start drawing Pacman
  ctx.beginPath();
  
  // Determine starting angle based on direction
  let startAngle = 0;
  let endAngle = 0;
  
  switch (direction) {
    case "right":
      startAngle = mouthAngle;
      endAngle = 2 * Math.PI - mouthAngle;
      break;
    case "left":
      startAngle = Math.PI + mouthAngle;
      endAngle = 3 * Math.PI - mouthAngle;
      break;
    case "up":
      startAngle = Math.PI * 1.5 + mouthAngle;
      endAngle = Math.PI * 3.5 - mouthAngle;
      break;
    case "down":
      startAngle = Math.PI * 0.5 + mouthAngle;
      endAngle = Math.PI * 2.5 - mouthAngle;
      break;
  }
  
  // Draw the Pacman arc
  ctx.arc(centerX, centerY, PACMAN_RADIUS, startAngle, endAngle);
  
  // Close the path and fill
  ctx.lineTo(centerX, centerY);
  ctx.fill();
  
  // Add the eye
  ctx.fillStyle = "black";
  
  // Position the eye based on direction
  let eyeX = centerX;
  let eyeY = centerY;
  
  switch (direction) {
    case "right":
    case "left":
      eyeX = centerX;
      eyeY = centerY - PACMAN_RADIUS / 2;
      break;
    case "up":
      eyeX = centerX - PACMAN_RADIUS / 3;
      eyeY = centerY - PACMAN_RADIUS / 3;
      break;
    case "down":
      eyeX = centerX - PACMAN_RADIUS / 3;
      eyeY = centerY + PACMAN_RADIUS / 3;
      break;
  }
  
  // Only draw the eye when not in power mode
  if (!powerMode) {
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, PACMAN_RADIUS / 6, 0, 2 * Math.PI);
    ctx.fill();
  }
};

/**
 * Animation function to toggle Pacman's mouth open/closed
 */
export const animatePacmanMouth = () => {
  const { pacman, updatePacmanMouth } = usePacmanGame.getState();
  updatePacmanMouth(!pacman.mouthOpen);
};

// Import the store at the end to avoid circular dependencies
import { usePacmanGame } from "@/lib/stores/usePacmanGame";
