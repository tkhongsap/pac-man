import { useRef, useEffect } from "react";
import { useKeyboardControls } from "@react-three/drei";
import { usePacmanGame } from "@/lib/stores/usePacmanGame";
import { drawMaze, drawDots, drawPowerPellets } from "./Maze";
import { drawPacman } from "./Character";
import { drawGhosts } from "./Ghost";
import { CELL_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { loadAudio } from "@/assets/sounds";
import type { Direction } from "./types";

const Board = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  
  const {
    maze,
    pacman,
    dots,
    powerPellets,
    ghosts,
    updatePacmanPosition,
    updateGhostPositions,
    checkCollisions,
    gameState,
    initializeGame,
  } = usePacmanGame();

  // Get keyboard controls state
  const upPressed = useKeyboardControls((state) => state.up);
  const downPressed = useKeyboardControls((state) => state.down);
  const leftPressed = useKeyboardControls((state) => state.left);
  const rightPressed = useKeyboardControls((state) => state.right);
  
  // Initialize the game on component mount
  useEffect(() => {
    if (gameState === "playing") {
      initializeGame();
      
      // Load and set up audio
      loadAudio();
    }
  }, [gameState, initializeGame]);
  
  // Handle keyboard input
  useEffect(() => {
    if (gameState !== "playing") return;
    
    let newDirection: Direction | null = null;
    
    if (upPressed) newDirection = "up";
    else if (downPressed) newDirection = "down";
    else if (leftPressed) newDirection = "left";
    else if (rightPressed) newDirection = "right";
    
    if (newDirection) {
      usePacmanGame.getState().setDirection(newDirection);
    }
  }, [upPressed, downPressed, leftPressed, rightPressed, gameState]);
  
  // Main game loop
  useEffect(() => {
    if (gameState !== "playing" || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Game update logic
    const updateGame = () => {
      // Update Pacman position based on current direction
      updatePacmanPosition();
      
      // Update ghost positions
      updateGhostPositions();
      
      // Check for collisions
      checkCollisions();
      
      // Draw everything
      drawGame(ctx);
      
      // Continue the animation loop
      animationRef.current = requestAnimationFrame(updateGame);
    };
    
    // Start the game loop
    animationRef.current = requestAnimationFrame(updateGame);
    
    // Clean up on unmount or when game state changes
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [gameState, updatePacmanPosition, updateGhostPositions, checkCollisions, maze, dots, powerPellets, ghosts, pacman]);
  
  // Draw all game elements
  const drawGame = (ctx: CanvasRenderingContext2D) => {
    // Clear the canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw maze
    drawMaze(ctx, maze);
    
    // Draw dots
    drawDots(ctx, dots);
    
    // Draw power pellets
    drawPowerPellets(ctx, powerPellets);
    
    // Draw pacman
    drawPacman(ctx, pacman);
    
    // Draw ghosts
    drawGhosts(ctx, ghosts);
  };
  
  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="border-4 border-blue-900"
      style={{ backgroundColor: "black" }}
    />
  );
};

export default Board;
