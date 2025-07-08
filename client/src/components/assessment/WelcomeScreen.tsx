import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartLine, Clock, HelpCircle, BarChart3, Users, Cog, UserCheck, Shield, Gem } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
  canContinue?: boolean;
  onContinue?: () => void;
  onSpeedTest?: () => void;
}

export default function WelcomeScreen({ onStart, canContinue, onContinue, onSpeedTest }: WelcomeScreenProps) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="shadow-sm">
        <CardContent className="pt-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Value Builder Assessment™
            </h2>
            <p className="text-lg text-gray-600 mb-6">Complete Business Valuation Framework</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">128</div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">14</div>
                <div className="text-sm text-gray-600">Assessment Areas</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">25-30</div>
                <div className="text-sm text-gray-600">Minutes</div>
              </div>
            </div>
            <div className="space-x-4">
              {canContinue && (
                <Button onClick={onContinue} variant="outline">
                  Continue Assessment
                </Button>
              )}
              <Button onClick={onStart} className="bg-primary hover:bg-blue-700 text-white font-medium px-8 py-3">
                Begin Assessment
              </Button>
              {onSpeedTest && (
                <Button onClick={onSpeedTest} variant="outline" className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3">
                  Speed Test (Random Fill)
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Overview */}
      <Card className="shadow-sm">
        <CardContent className="pt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Assessment Structure</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Part I */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  1
                </div>
                <h4 className="text-lg font-medium text-gray-900">Core Value Builder Drivers</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Questions 1-64 covering the foundational 8 drivers that determine baseline business value
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Financial Performance</span>
                  <span className="font-medium">15%</span>
                </div>
                <div className="flex justify-between">
                  <span>Growth Potential</span>
                  <span className="font-medium">15%</span>
                </div>
                <div className="flex justify-between">
                  <span>Switzerland Structure</span>
                  <span className="font-medium">12%</span>
                </div>
                <div className="flex justify-between">
                  <span>Valuation Teeter-Totter</span>
                  <span className="font-medium">12%</span>
                </div>
                <div className="flex justify-between">
                  <span>Recurring Revenue</span>
                  <span className="font-medium">13%</span>
                </div>
                <div className="flex justify-between">
                  <span>Monopoly Control</span>
                  <span className="font-medium">12%</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer Satisfaction</span>
                  <span className="font-medium">11%</span>
                </div>
                <div className="flex justify-between">
                  <span>Hub & Spoke</span>
                  <span className="font-medium">10%</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <strong>Weight: 70%</strong> of overall score
              </div>
            </div>

            {/* Part II */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  2
                </div>
                <h4 className="text-lg font-medium text-gray-900">Supplemental Deep-Dive</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Questions 65-128 providing comprehensive valuation insights across 6 additional dimensions
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <ChartLine className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Financial Health & Analysis</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Market & Competitive Position</span>
                </div>
                <div className="flex items-center">
                  <Cog className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Operational Excellence</span>
                </div>
                <div className="flex items-center">
                  <UserCheck className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Human Capital & Organization</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Legal, Risk & Compliance</span>
                </div>
                <div className="flex items-center">
                  <Gem className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Strategic Assets & Intangibles</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <strong>Weight: 30%</strong> of overall score
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
