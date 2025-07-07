import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AssessmentAnswer, CategoryScore } from "@shared/schema";
import { calculateCategoryScores, calculateOverallScore, getScoreGrade, getScoreColor, getScoreBarColor } from "@/lib/scoring";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Send, ChartLine, Users, Cog, UserCheck, Shield, Gem, TrendingUp, Target } from "lucide-react";

interface ResultsScreenProps {
  answers: Record<string, AssessmentAnswer>;
}

export default function ResultsScreen({ answers }: ResultsScreenProps) {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    company: "",
    industry: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  // Calculate scores
  const categoryScores = calculateCategoryScores(answers);
  const overallScore = calculateOverallScore(categoryScores);
  const grade = getScoreGrade(overallScore);

  // Submit results mutation
  const submitResultsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/results", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      setIsSubmitted(true);
      if (data.emailStatus === "success") {
        toast({
          title: "Results sent successfully!",
          description:
            "Your assessment report has been sent to your email and our team.",
        });
      } else {
        toast({
          title: "Email failed to send",
          description:
            "Your results were saved, but the email could not be delivered.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Failed to send results",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInfo.name || !userInfo.email) {
      toast({
        title: "Missing information",
        description: "Please fill in your name and email address.",
        variant: "destructive",
      });
      return;
    }

    const resultData = {
      assessmentId: 1, // This would be the actual assessment ID
      userName: userInfo.name,
      userEmail: userInfo.email,
      companyName: userInfo.company,
      industry: userInfo.industry,
      overallScore,
      categoryBreakdown: categoryScores,
    };

    submitResultsMutation.mutate(resultData);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      "Financial Performance": ChartLine,
      "Growth Potential": TrendingUp,
      "Switzerland Structure": Shield,
      "Valuation Teeter-Totter": Target,
      "Recurring Revenue": Users,
      "Monopoly Control": Gem,
      "Customer Satisfaction": UserCheck,
      "Hub & Spoke": Cog,
      "Financial Health & Analysis": ChartLine,
      "Market & Competitive Position": Users,
      "Operational Excellence": Cog,
      "Human Capital & Organization": UserCheck,
      "Legal, Risk & Compliance": Shield,
      "Strategic Assets & Intangibles": Gem,
    };
    return icons[category] || ChartLine;
  };

  const coreDrivers = [
    "Financial Performance",
    "Growth Potential",
    "Switzerland Structure",
    "Valuation Teeter-Totter",
    "Recurring Revenue",
    "Monopoly Control",
    "Customer Satisfaction",
    "Hub & Spoke",
  ];

  const supplementalDrivers = [
    "Financial Health & Analysis",
    "Market & Competitive Position",
    "Operational Excellence",
    "Human Capital & Organization",
    "Legal, Risk & Compliance",
    "Strategic Assets & Intangibles",
  ];

  const strongAreas = Object.values(categoryScores).filter(score => score.score >= 80).length;
  const priorityAreas = Object.values(categoryScores).filter(score => score.score < 60).length;

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <Card className="shadow-sm">
        <CardContent className="pt-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
          <p className="text-lg text-gray-600 mb-6">Your comprehensive business valuation analysis is ready</p>
          
          {/* Overall Score */}
          <div className="inline-block bg-gray-50 rounded-lg p-6 mb-6">
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(overallScore)}`}>
              {overallScore}
            </div>
            <div className="text-sm text-gray-600">Overall Value Builder Score</div>
            <div className="text-xs text-gray-500 mt-1">Out of 100 points</div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xl font-semibold text-gray-900">{grade}</div>
              <div className="text-sm text-gray-600">Overall Grade</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xl font-semibold text-gray-900">{strongAreas}/14</div>
              <div className="text-sm text-gray-600">Strong Areas</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xl font-semibold text-gray-900">{priorityAreas}</div>
              <div className="text-sm text-gray-600">Priority Areas</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xl font-semibold text-gray-900">Est.</div>
              <div className="text-sm text-gray-600">Valuation</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="shadow-sm">
        <CardContent className="pt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Detailed Category Breakdown</h3>
          
          {/* Core Drivers */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Part I: Core Value Builder Drivers (70% weight)</h4>
            <div className="space-y-4">
              {coreDrivers.map((driver) => {
                const score = categoryScores[driver];
                if (!score) return null;
                
                const Icon = getCategoryIcon(driver);
                return (
                  <div key={driver} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${getScoreBarColor(score.score)}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{driver}</span>
                        <span className="text-sm text-gray-600 ml-2">({Math.round(score.weight * 100)}% weight)</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className={`h-2 rounded-full ${getScoreBarColor(score.score)}`}
                          style={{ width: `${score.score}%` }}
                        />
                      </div>
                      <span className="font-semibold text-gray-900 w-8">{score.score}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supplemental Analysis */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Part II: Supplemental Deep-Dive Analysis (30% weight)</h4>
            <div className="space-y-4">
              {supplementalDrivers.map((driver) => {
                const score = categoryScores[driver];
                if (!score) return null;
                
                const Icon = getCategoryIcon(driver);
                return (
                  <div key={driver} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${getScoreBarColor(score.score)}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">{driver}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className={`h-2 rounded-full ${getScoreBarColor(score.score)}`}
                          style={{ width: `${score.score}%` }}
                        />
                      </div>
                      <span className="font-semibold text-gray-900 w-8">{score.score}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Capture */}
      {!isSubmitted && (
        <Card className="shadow-sm">
          <CardContent className="pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Your Detailed Report</h3>
            <p className="text-gray-600 mb-6">
              Enter your information to receive your comprehensive Value Builder Assessment report with detailed analysis and actionable recommendations.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                  Company Name
                </Label>
                <Input
                  id="company"
                  type="text"
                  value={userInfo.company}
                  onChange={(e) => setUserInfo({ ...userInfo, company: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="industry" className="text-sm font-medium text-gray-700">
                  Industry
                </Label>
                <Select value={userInfo.industry} onValueChange={(value) => setUserInfo({ ...userInfo, industry: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="services">Professional Services</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-blue-700"
                disabled={submitResultsMutation.isPending}
              >
                <Send className="w-4 h-4 mr-2" />
                {submitResultsMutation.isPending ? "Sending..." : "Send My Assessment Report"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {isSubmitted && (
        <Card className="shadow-sm bg-green-50 border-green-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-green-800 mb-2">Report Sent Successfully!</h4>
            <p className="text-green-700">
              Your comprehensive Value Builder Assessment report has been sent to your email address and our team at aoseni@duxvitaecapital.com.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
