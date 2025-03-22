import { useEffect, useCallback } from "react";
import { usePacmanGame } from "@/lib/stores/usePacmanGame";
import { animatePacmanMouth } from "./Character";
import { playSound } from "@/assets/sounds";
import { Direction } from "./types";

/**
 * Custom hook for handling game logic
 */
export const useGameLogic = () => {
  const {
    pacman,
    ghosts,
    maze,
    dots,
    powerPellets,
    score,
    updateGhostPositions,
    updatePacmanPosition,
    checkCollisions,
    setDirection,
    gameState,
    endGame,
    checkVictory
  } = usePacmanGame();
  
  // Function to validate if a move is legal based on the maze
  const canMove = useCallback((x: number, y: number, direction: Direction): boolean => {
    const { maze } = usePacmanGame.getState();
    
    // Calculate next position based on direction
    let nextX = x;
    let nextY = y;
    
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
    
    // Wrap around the maze for tunnels
    if (nextX < 0) nextX = maze[0].length - 1;
    if (nextX >= maze[0].length) nextX = 0;
    if (nextY < 0) nextY = maze.length - 1;
    if (nextY >= maze.length) nextY = 0;
    
    // Check if the next cell is a wall
    return maze[nextY][nextX] !== 1;
  }, []);
  
  // Handle Pacman mouth animation
  useEffect(() => {
    if (gameState !== "playing") return;
    
    const mouthInterval = setInterval(animatePacmanMouth, 200);
    return () => clearInterval(mouthInterval);
  }, [gameState]);
  
  // Check for victory
  useEffect(() => {
    if (gameState === "playing") {
      checkVictory();
    }
  }, [dots, powerPellets, gameState, checkVictory]);
  
  return {
    canMove,
    pacman,
    ghosts,
    maze,
    dots,
    powerPellets,
    score,
    updateGhostPositions,
    updatePacmanPosition,
    checkCollisions,
    setDirection
  };
};
