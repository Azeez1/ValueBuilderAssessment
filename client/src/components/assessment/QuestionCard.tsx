import { Question } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  selectedAnswer: string | null;
  onAnswerSelect: (value: string, points: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSave: () => void;
  onSkipToEnd: () => void;
  canGoBack: boolean;
  isLastQuestion: boolean;
}

export default function QuestionCard({
  question,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  onSave,
  onSkipToEnd,
  canGoBack,
  isLastQuestion
}: QuestionCardProps) {
  const getSectionIcon = (section: string) => {
    // Return appropriate icon based on section
    return "📊"; // Default icon
  };

  const getSectionWeight = (section: string) => {
    const weights: Record<string, number> = {
      "Financial Performance": 15,
      "Growth Potential": 15,
      "Switzerland Structure": 12,
      "Valuation Teeter-Totter": 12,
      "Recurring Revenue": 13,
      "Monopoly Control": 12,
      "Customer Satisfaction": 11,
      "Hub & Spoke": 10,
    };
    return weights[section] || 5;
  };

  return (
    <div className="space-y-6">
      {/* Current Section */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-lg">{getSectionIcon(question.section)}</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{question.section}</h4>
              <p className="text-sm text-gray-600">
                Weight: {getSectionWeight(question.section)}% of overall score
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="shadow-sm">
        <CardContent className="pt-8">
          <div className="mb-6">
            <h5 className="text-xl font-medium text-gray-900 mb-2">
              Question {question.id}: {question.title}
            </h5>
            <p className="text-gray-700">{question.question}</p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAnswer === option.points.toString()
                    ? "border-primary bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="current-answer"
                  value={option.points.toString()}
                  checked={selectedAnswer === option.points.toString()}
                  onChange={() => onAnswerSelect(option.points.toString(), option.points)}
                  className="mr-4 text-primary focus:ring-primary"
                />
                <span className="flex-1">{option.text}</span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {option.points} points
                </span>
              </label>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="ghost"
              onClick={onPrevious}
              disabled={!canGoBack}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onSave} className="flex items-center">
                <Save className="w-4 h-4 mr-2" />
                Save Progress
              </Button>
              <Button variant="outline" onClick={onSkipToEnd} className="text-orange-600 border-orange-600 hover:bg-orange-50">
                Skip to End (Test)
              </Button>
              <Button onClick={onNext} className="flex items-center">
                {isLastQuestion ? "Complete Assessment" : "Next Question"}
                {!isLastQuestion && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
