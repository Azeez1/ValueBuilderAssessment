import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

  const { data, isLoading } = useQuery({
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
  });

  const handleExportPdf = () => {
    const params = new URLSearchParams();
    if (userName) params.append("userName", userName);
    if (companyName) params.append("companyName", companyName);
    if (industry) params.append("industry", industry);
    window.open(
      `/api/reports/export/pdf/${sessionId}?${params.toString()}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center">Generating preview...</div>
          ) : (
            <div
              className="p-6 max-h-[70vh] overflow-auto"
              dangerouslySetInnerHTML={{ __html: data || "" }}
            />
          )}
        </CardContent>
      </Card>
      <div className="flex justify-end space-x-2">
        <Button onClick={onSendEmail}>Send Report via Email</Button>
        <Button variant="outline" onClick={handleExportPdf}>
          Export as PDF
        </Button>
      </div>
    </div>
  );
}
