import { PacmanState } from "./types";
import { CELL_SIZE } from "./constants";

// Constants for Pacman drawing
const PACMAN_RADIUS = CELL_SIZE / 2 - 1; // Increased Pac-Man radius (was CELL_SIZE / 2 - 2)
const MOUTH_ANGLE_MIN = 0.05; // Smaller minimum angle (was 0.1) for better animation
const MOUTH_ANGLE_MAX = 0.8; // Larger maximum angle (was 0.6) for more expressive mouth

/**
 * Draws the Pacman character on the canvas
 */
export const drawPacman = (ctx: CanvasRenderingContext2D, pacman: PacmanState) => {
  const { x, y, direction, mouthOpen, powerMode } = pacman;
  
  // Calculate center position of Pacman
  const centerX = x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = y * CELL_SIZE + CELL_SIZE / 2;
  
  // Set the colors
  const fillColor = powerMode ? "#FFFFFF" : "#FFFF00";
  const outlineColor = powerMode ? "#AAAAAA" : "#FF9500";
  
  ctx.fillStyle = fillColor;
  
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
  
  // Draw the Pacman arc with outline
  ctx.arc(centerX, centerY, PACMAN_RADIUS, startAngle, endAngle);
  
  // Close the path and fill
  ctx.lineTo(centerX, centerY);
  ctx.fill();
  
  // Add a subtle outline for better visual definition
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(centerX, centerY, PACMAN_RADIUS, startAngle, endAngle);
  ctx.lineTo(centerX, centerY);
  ctx.stroke();
  
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
    // Draw the white of the eye
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, PACMAN_RADIUS / 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw the pupil (black)
    ctx.fillStyle = "black";
    
    // Adjust pupil position based on direction for a more lively look
    let pupilOffsetX = 0;
    let pupilOffsetY = 0;
    
    switch (direction) {
      case "right":
        pupilOffsetX = PACMAN_RADIUS / 12;
        break;
      case "left":
        pupilOffsetX = -PACMAN_RADIUS / 12;
        break;
      case "up":
        pupilOffsetY = -PACMAN_RADIUS / 12;
        break;
      case "down":
        pupilOffsetY = PACMAN_RADIUS / 12;
        break;
    }
    
    ctx.beginPath();
    ctx.arc(eyeX + pupilOffsetX, eyeY + pupilOffsetY, PACMAN_RADIUS / 10, 0, 2 * Math.PI);
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
