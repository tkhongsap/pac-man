// Game state types
export type GameState = "menu" | "playing" | "gameover" | "victory";
export type Direction = "up" | "down" | "left" | "right";
export type GhostType = "blinky" | "pinky" | "inky" | "clyde";

// Maze cell types
export enum MazeCell {
  EMPTY = 0,
  WALL = 1,
  DOT = 2,
  POWER_PELLET = 3
}

// Pacman state
export interface PacmanState {
  x: number;
  y: number;
  direction: Direction;
  nextDirection: Direction | null;
  mouthOpen: boolean;
  powerMode: boolean;
}

// Ghost state
export interface GhostState {
  x: number;
  y: number;
  type: GhostType;
  direction: Direction;
  scared: boolean;
  // Position to return to when eaten
  homeX: number;
  homeY: number;
  // Is the ghost currently returning home after being eaten
  returningHome: boolean;
}

// Dot state
export interface DotState {
  x: number;
  y: number;
  visible: boolean;
}

// Power pellet state
export interface PowerPelletState {
  x: number;
  y: number;
  visible: boolean;
}
