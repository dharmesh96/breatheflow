// src/BreathingViewModel.ts

export interface BreathingPattern {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
}

export interface SessionData {
  userId: string;
  pattern: string;
  reps: number;
  duration: number;
}

// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
let API_BASE_URL = "";

// Lazy-load config.json once
export async function loadConfig() {
  const response = await fetch("/config.json");
  const data = await response.json();
  API_BASE_URL = data.apiBaseUrl;
  console.log("🌍 Loaded config:", API_BASE_URL);
}

export class BreathingViewModel {
  private startTime: number = 0;
  private reps: number = 0;
  private currentPattern: BreathingPattern;

  constructor(pattern: BreathingPattern) {
    this.currentPattern = pattern;
  }

  start() {
    this.startTime = Date.now();
    this.reps = 0;
  }

  nextRep() {
    this.reps++;
  }

  getElapsedSeconds(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  getSessionSummary(): SessionData {
    return {
      userId: "testuser",
      pattern: this.currentPattern.name,
      reps: this.reps,
      duration: this.getElapsedSeconds(),
    };
  }

  async saveSessionToBackend() {
    const session = this.getSessionSummary();
    if (!API_BASE_URL) {
      console.warn("⚠️ API URL not loaded yet — using default localhost");
      API_BASE_URL = "http://localhost:8080";
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });

      const data = await response.json();
      console.log("✅ Session saved:", data);
    } catch (err) {
      console.error("❌ Failed to save session:", err);
    }
  }
}

