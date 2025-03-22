import { useEffect, useState } from "react";
import Board from "./components/Game/Board";
import { KeyboardControls } from "@react-three/drei";
import GameUI from "./components/Game/GameUI";
import { usePacmanGame } from "./lib/stores/usePacmanGame";
import "@fontsource/inter";

// Define control keys for the game
const controls = [
  { name: "up", keys: ["KeyW", "ArrowUp"] },
  { name: "down", keys: ["KeyS", "ArrowDown"] },
  { name: "left", keys: ["KeyA", "ArrowLeft"] },
  { name: "right", keys: ["KeyD", "ArrowRight"] },
];

// Main App component
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { gameState, startGame, resetGame } = usePacmanGame();
  
  // Simulate a short loading time for assets
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-black overflow-hidden">
      {gameState === "menu" && (
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold text-yellow-400 mb-6">PAC-MAN</h1>
          <p className="text-white mb-8">1984 Edition</p>
          <button 
            onClick={startGame}
            className="px-8 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
          >
            START GAME
          </button>
        </div>
      )}

      {gameState === "playing" && (
        <KeyboardControls map={controls}>
          <div className="relative">
            <Board />
            <GameUI />
          </div>
        </KeyboardControls>
      )}

      {gameState === "gameover" && (
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold text-red-500 mb-6">GAME OVER</h1>
          <p className="text-white mb-8">Score: {usePacmanGame.getState().score}</p>
          <button 
            onClick={resetGame}
            className="px-8 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {gameState === "victory" && (
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold text-green-500 mb-6">VICTORY!</h1>
          <p className="text-white mb-8">Score: {usePacmanGame.getState().score}</p>
          <button 
            onClick={resetGame}
            className="px-8 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
