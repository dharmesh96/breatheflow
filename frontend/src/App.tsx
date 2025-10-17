import React, { useState } from "react";
import { BreathingViewModel, BreathingPattern } from "./BreathingViewModel";
import { loadConfig } from "./BreathingViewModel";

useEffect(() => {
  loadConfig();
}, []);


const defaultPattern: BreathingPattern = {
  name: "Calm Breathing",
  inhale: 4,
  hold: 4,
  exhale: 4,
};

export default function App() {
  const [viewModel] = useState(new BreathingViewModel(defaultPattern));
  const [status, setStatus] = useState("idle");

  const startSession = () => {
    setStatus("running");
    viewModel.start();
  };

  const completeSession = async () => {
    viewModel.nextRep();
    await viewModel.saveSessionToBackend();
    setStatus("complete");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-6">🧘‍♀️ BreatheFlow</h1>
      <p className="text-lg mb-4">
        Pattern: {defaultPattern.name} ({defaultPattern.inhale}-{defaultPattern.hold}-{defaultPattern.exhale})
      </p>

      {status === "idle" && (
        <button
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
          onClick={startSession}
        >
          Start Session
        </button>
      )}

      {status === "running" && (
        <button
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg"
          onClick={completeSession}
        >
          Complete Session
        </button>
      )}

      {status === "complete" && <p className="mt-4 text-green-400">Session Saved ✅</p>}

      <button
        onClick={() =>
          fetch("/config.json")
            .then((r) => r.json())
            .then((data) => console.log("✅ Config loaded:", data))
            .catch((err) => console.error("❌ Failed to load config:", err))
        }
        className="p-2 mt-4 border rounded bg-blue-100 hover:bg-blue-200"
      >
        Test Config
      </button>

    </div>
  );
}

