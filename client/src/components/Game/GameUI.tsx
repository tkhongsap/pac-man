import { usePacmanGame } from "@/lib/stores/usePacmanGame";

const GameUI = () => {
  const { score, lives, level } = usePacmanGame();
  
  return (
    <div className="absolute top-0 left-0 w-full flex justify-between p-2 text-white font-bold">
      <div className="flex items-center">
        <span className="mr-4">SCORE: {score}</span>
        <span>LEVEL: {level}</span>
      </div>
      
      <div className="flex items-center">
        <span className="mr-2">LIVES:</span>
        {Array.from({ length: lives }).map((_, index) => (
          <div 
            key={index} 
            className="w-5 h-5 mx-1 bg-yellow-400 rounded-full"
            style={{
              clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 75%, 50% 100%, 0 25%)"
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default GameUI;
