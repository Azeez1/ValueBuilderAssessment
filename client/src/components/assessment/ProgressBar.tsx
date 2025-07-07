interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
}

export default function ProgressBar({ currentQuestion, totalQuestions }: ProgressBarProps) {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const isCorePhase = currentQuestion < 64;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Assessment Progress</h3>
        <span className="text-sm text-gray-600">
          Question {currentQuestion + 1} of {totalQuestions}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span className={isCorePhase ? "font-medium text-primary" : ""}>
          Part I: Core Drivers
        </span>
        <span className={!isCorePhase ? "font-medium text-primary" : ""}>
          Part II: Deep-Dive
        </span>
      </div>
    </div>
  );
}
