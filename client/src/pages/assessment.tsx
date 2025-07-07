import { useState, useEffect } from "react";
import { AssessmentAnswer } from "@shared/schema";
import WelcomeScreen from "@/components/assessment/WelcomeScreen";
import AssessmentScreen from "@/components/assessment/AssessmentScreen";
import ResultsScreen from "@/components/assessment/ResultsScreen";
import { ChartLine, Clock, HelpCircle, BarChart3 } from "lucide-react";

export default function AssessmentPage() {
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "assessment" | "results">("welcome");
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("assessmentSessionId");
    if (stored) {
      setSessionId(stored);
    }
  }, []);

  const handleStartAssessment = () => {
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(id);
    localStorage.setItem("assessmentSessionId", id);
    setCurrentScreen("assessment");
  };

  const handleContinueAssessment = () => {
    if (sessionId) {
      setCurrentScreen("assessment");
    }
  };

  const handleExitAssessment = () => {
    setCurrentScreen("welcome");
    if (sessionId) {
      localStorage.setItem("assessmentSessionId", sessionId);
    }
  };

  const handleCompleteAssessment = (answers: Record<string, AssessmentAnswer>) => {
    setAssessmentAnswers(answers);
    setCurrentScreen("results");
    localStorage.removeItem("assessmentSessionId");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <ChartLine className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Value Builder Assessment™</h1>
                <p className="text-sm text-gray-600">Professional Edition</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>25-30 minutes</span>
              </div>
              <div className="flex items-center">
                <HelpCircle className="w-4 h-4 mr-2" />
                <span>128 questions</span>
              </div>
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                <span>14 dimensions</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentScreen === "welcome" && (
          <WelcomeScreen
            onStart={handleStartAssessment}
            canContinue={!!sessionId}
            onContinue={handleContinueAssessment}
          />
        )}
        {currentScreen === "assessment" && sessionId && (
          <AssessmentScreen
            sessionId={sessionId}
            onComplete={handleCompleteAssessment}
            onExit={handleExitAssessment}
          />
        )}
        {currentScreen === "results" && (
          <ResultsScreen answers={assessmentAnswers} />
        )}
      </main>
    </div>
  );
}
