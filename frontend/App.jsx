import { useState, useEffect } from "react";

const patterns = [
  { name: "Inhale", duration: 4 },
  { name: "Hold", duration: 7 },
  { name: "Exhale", duration: 8 },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(patterns[0].duration);
  const [running, setRunning] = useState(false);
  const [reps, setReps] = useState(1);
  const [currentRep, setCurrentRep] = useState(1);

  useEffect(() => {
    let timer;
    if (running) {
      timer = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            const nextStep = (currentStep + 1) % patterns.length;
            if (nextStep === 0) {
              if (currentRep >= reps) {
                setRunning(false);
                return patterns[0].duration;
              } else {
                setCurrentRep((r) => r + 1);
              }
            }
            setCurrentStep(nextStep);
            return patterns[nextStep].duration;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [running, currentStep, reps, currentRep]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-50">
      <h1 className="text-4xl font-bold mb-6">BreatheFlow</h1>
      
      <div className="flex flex-col items-center mb-6">
        <div className="text-2xl font-semibold mb-2">{patterns[currentStep].name}</div>
        <div className="text-xl mb-2">Time Left: {timeLeft}s</div>
        <div className="text-lg">Rep: {currentRep} / {reps}</div>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => setRunning(true)}
        >
          Start
        </button>
        <button
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          onClick={() => setRunning(false)}
        >
          Pause
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => {
            setRunning(false);
            setCurrentStep(0);
            setTimeLeft(patterns[0].duration);
            setCurrentRep(1);
          }}
        >
          Reset
        </button>
      </div>

      <div className="flex flex-col items-center">
        <label className="mb-2">Number of Reps:</label>
        <input
          type="number"
          min="1"
          value={reps}
          onChange={(e) => setReps(parseInt(e.target.value) || 1)}
          className="border px-2 py-1 rounded w-20 text-center"
        />
      </div>

      {/* Circle visual */}
      <div
        className="mt-10 rounded-full bg-blue-400"
        style={{
          width: `${50 + timeLeft * 10}px`,
          height: `${50 + timeLeft * 10}px`,
          transition: "width 1s linear, height 1s linear",
        }}
      ></div>
    </div>
  );
}

