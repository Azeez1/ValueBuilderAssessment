import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { questions } from "@/data/questions";
import { AssessmentAnswer, Assessment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AssessmentScreenProps {
  onComplete: (answers: Record<string, AssessmentAnswer>) => void;
  onExit: () => void;
  sessionId: string;
  speedTest?: boolean;
}

export default function AssessmentScreen({ onComplete, onExit, sessionId, speedTest }: AssessmentScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [showExitDialog, setShowExitDialog] = useState(false);
  const { toast } = useToast();

  // Load existing assessment if available
  const { data: existingAssessment } = useQuery<Assessment | undefined>({
    queryKey: [`/api/assessments/${sessionId}`],
    enabled: !!sessionId && sessionId.length > 0,
  });

  // Save assessment mutation
  const saveAssessmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/assessments", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Progress saved",
        description: "Your assessment progress has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Save failed",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update assessment mutation
  const updateAssessmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/assessments/${sessionId}`, data);
      return response.json();
    },
  });

  useEffect(() => {
    if (existingAssessment) {
      setAnswers((existingAssessment.answers || {}) as Record<string, AssessmentAnswer>);
      setCurrentQuestion(existingAssessment.currentQuestion || 0);
    }
  }, [existingAssessment]);

  // Trigger speed test if speedTest prop is true
  useEffect(() => {
    if (speedTest) {
      fillRandomAnswers();
    }
  }, [speedTest]);

  const handleAnswerSelect = (value: string, points: number) => {
    const newAnswers = {
      ...answers,
      [questions[currentQuestion].id]: {
        questionId: questions[currentQuestion].id,
        value,
        points,
      },
    };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    const currentAnswer = answers[questions[currentQuestion].id];
    if (!currentAnswer) {
      toast({
        title: "Please select an answer",
        description: "You must select an answer before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      saveProgress();
    } else {
      completeAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const saveProgress = () => {
    const assessmentData = {
      sessionId,
      answers,
      currentQuestion,
      completed: 0,
    };

    if (Object.keys(answers).length === 1) {
      // First save - create new assessment
      saveAssessmentMutation.mutate(assessmentData);
    } else {
      // Update existing assessment
      updateAssessmentMutation.mutate(assessmentData);
    }
  };

  const handleSkipToEnd = () => {
    // Fill remaining questions with default answers (middle value) for testing
    const remainingAnswers = { ...answers };
    for (let i = currentQuestion; i < questions.length; i++) {
      if (!remainingAnswers[questions[i].id]) {
        const middleOption = questions[i].options[Math.floor(questions[i].options.length / 2)];
        remainingAnswers[questions[i].id] = {
          questionId: questions[i].id,
          value: middleOption.points.toString(),
          points: middleOption.points,
        };
      }
    }
    setAnswers(remainingAnswers);
    completeAssessment(remainingAnswers);
  };

  const fillRandomAnswers = () => {
    const randomAnswers: Record<string, AssessmentAnswer> = {};
    questions.forEach((question) => {
      // Pick a random option for each question
      const randomIndex = Math.floor(Math.random() * question.options.length);
      const randomOption = question.options[randomIndex];
      randomAnswers[question.id] = {
        questionId: question.id,
        value: randomOption.text,
        points: randomOption.points,
      };
    });
    setAnswers(randomAnswers);
    
    // Show notification about random fill
    toast({
      title: "Speed Test Activated",
      description: "All questions have been randomly filled. You can now complete the assessment.",
    });
    
    // Jump to the last question
    setCurrentQuestion(questions.length - 1);
  };

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = () => {
    saveProgress();
    setShowExitDialog(false);
    onExit();
  };

  const completeAssessment = (finalAnswers = answers) => {
    const assessmentData = {
      sessionId,
      answers: finalAnswers,
      currentQuestion,
      completed: 1,
    };

    updateAssessmentMutation.mutate(assessmentData);
    onComplete(finalAnswers);
  };

  const currentQuestionData = questions[currentQuestion];
  const selectedAnswer = answers[currentQuestionData.id]?.value || null;

  return (
    <div className="space-y-6">
      <ProgressBar currentQuestion={currentQuestion} totalQuestions={questions.length} />
      
      <QuestionCard
        question={currentQuestionData}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={handleAnswerSelect}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSave={saveProgress}
        onSkipToEnd={handleSkipToEnd}
        onExit={handleExit}
        canGoBack={currentQuestion > 0}
        isLastQuestion={currentQuestion === questions.length - 1}
      />

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit Assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be saved. You can continue where you left off by starting the assessment again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Assessment</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit}>
              Save & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
