import { useAudio } from "@/lib/stores/useAudio";

// Sound effect types
type SoundEffect = "chomp" | "death" | "ghost" | "powerup" | "starting";

// Sound cache to avoid reloading
const soundCache: Record<SoundEffect, HTMLAudioElement | null> = {
  chomp: null,
  death: null,
  ghost: null,
  powerup: null,
  starting: null
};

/**
 * Load all game audio
 */
export const loadAudio = () => {
  // Create and set audio elements
  const chompSound = new Audio("/sounds/chomp.mp3");
  chompSound.volume = 0.5;
  soundCache.chomp = chompSound;
  
  const deathSound = new Audio("/sounds/death.mp3");
  deathSound.volume = 0.7;
  soundCache.death = deathSound;
  
  const ghostSound = new Audio("/sounds/ghost.mp3");
  ghostSound.volume = 0.6;
  soundCache.ghost = ghostSound;
  
  const powerupSound = new Audio("/sounds/powerup.mp3");
  powerupSound.volume = 0.7;
  soundCache.powerup = powerupSound;
  
  // Save into store for global access
  useAudio.getState().setHitSound(ghostSound);
  useAudio.getState().setSuccessSound(powerupSound);
};

/**
 * Play a sound effect
 */
export const playSound = (sound: SoundEffect) => {
  const { isMuted } = useAudio.getState();
  
  // Don't play sounds if muted
  if (isMuted) return;
  
  const audioElement = soundCache[sound];
  if (audioElement) {
    // Reset time to start and play
    audioElement.currentTime = 0;
    audioElement.play().catch(error => {
      console.error(`Error playing ${sound} sound:`, error);
    });
  }
};

/**
 * Play the chomp sound with optimization to prevent overlapping
 */
let lastChompTime = 0;
export const playChompSound = () => {
  const now = Date.now();
  // Only play chomp sound if last chomp was more than 100ms ago
  if (now - lastChompTime > 100) {
    playSound("chomp");
    lastChompTime = now;
  }
};
