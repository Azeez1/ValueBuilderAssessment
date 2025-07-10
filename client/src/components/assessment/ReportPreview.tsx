import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Download, Mail } from "lucide-react";

interface ReportPreviewProps {
  sessionId: string;
  userName?: string;
  companyName?: string;
  industry?: string;
  onSendEmail: () => void;
}

export default function ReportPreview({
  sessionId,
  userName,
  companyName,
  industry,
  onSendEmail,
}: ReportPreviewProps) {
  const queryKey = [
    "reportPreview",
    sessionId,
    userName,
    companyName,
    industry,
  ];

  const { data: reportHtml, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userName) params.append("userName", userName);
      if (companyName) params.append("companyName", companyName);
      if (industry) params.append("industry", industry);
      const res = await apiRequest(
        "GET",
        `/api/reports/preview/${sessionId}?${params.toString()}`
      );
      return res.text();
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleExportPdf = () => {
    // Get the iframe content
    const iframe = document.querySelector('iframe[title="Assessment Report Preview"]') as HTMLIFrameElement;
    if (!iframe || !iframe.contentDocument) {
      alert('Report not ready for download. Please wait for it to load completely.');
      return;
    }

    // Create a new window with the report content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download the PDF');
      return;
    }

    // Get the HTML content from the iframe
    const htmlContent = iframe.contentDocument.documentElement.outerHTML;
    
    // Write the content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Close the window after printing (user can cancel print and window stays open)
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      }, 500);
    };
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Generating Your Comprehensive Report</h3>
              <p className="text-gray-600">
                Our AI is analyzing your assessment results and creating personalized insights...
              </p>
              <div className="mt-6 space-y-2 max-w-md mx-auto text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary animate-pulse mr-2"></div>
                  <span>Calculating category scores and benchmarks...</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary animate-pulse mr-2"></div>
                  <span>Generating AI-powered strategic insights...</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary animate-pulse mr-2"></div>
                  <span>Creating personalized recommendations...</span>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">
              <p>Failed to generate report. Please try again.</p>
            </div>
          ) : (
            <div className="relative">
              <iframe
                srcDoc={reportHtml}
                className="w-full h-[800px] border-0"
                title="Assessment Report Preview"
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button onClick={handleExportPdf} variant="default" className="shadow-lg">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={onSendEmail} variant="outline" className="shadow-lg bg-white">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Report
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!isLoading && !error && (
        <div className="text-center text-sm text-gray-600">
          <p>
            This report includes AI-generated insights specific to your business profile and assessment results.
          </p>
        </div>
      )}
    </div>
  );
}
