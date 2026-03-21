"use client";

import { Button } from "@/components/ui/button";
import { trackFileDownload } from "@/components/GoogleAnalytics";
import type { ResumeFormData, TemplateName } from "@/types/resume-builder";
import { renderResume } from "@/lib/resume-templates";
import { Download, FileText, RotateCcw, Upload } from "lucide-react";
import { useCallback, useState } from "react";

interface ExportControlsProps {
  data: ResumeFormData;
  template: TemplateName;
  onLoadSample: () => void;
  onReset: () => void;
}

export function ExportControls({
  data,
  template,
  onLoadSample,
  onReset,
}: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      const html = renderResume(data, template);

      // Create a hidden iframe to render the HTML
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.left = "-9999px";
      iframe.style.top = "-9999px";
      iframe.style.width = "794px"; // A4 width at 96dpi
      iframe.style.height = "1123px"; // A4 height at 96dpi
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument ?? iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Could not access iframe document");

      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      // Wait for content to render
      await new Promise((resolve) => setTimeout(resolve, 500));

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 794,
        height: 1123,
      });

      document.body.removeChild(iframe);

      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      const fileName = data.personalInfo.name
        ? `${data.personalInfo.name.replace(/\s+/g, "_")}_Resume.pdf`
        : "Resume.pdf";

      pdf.save(fileName);
      trackFileDownload(fileName, ".pdf", "resume_builder");
    } catch (error) {
      console.error("PDF export failed:", error); // eslint-disable-line no-console
    } finally {
      setIsExporting(false);
    }
  }, [data, template]);

  const handleExportJson = useCallback(() => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-data.json";
    a.click();
    URL.revokeObjectURL(url);
    trackFileDownload("resume-data.json", ".json", "resume_export");
  }, [data]);

  const handleImportJson = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text) as ResumeFormData;
        // Store in localStorage and reload
        localStorage.setItem("resume-builder-data", JSON.stringify(parsed));
        window.location.reload();
      } catch {
        console.error("Invalid JSON file"); // eslint-disable-line no-console
      }
    };
    input.click();
  }, []);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        onClick={handleDownloadPdf}
        disabled={isExporting}
        className="bg-cyan-400 hover:bg-cyan-500 text-background font-medium"
      >
        <Download className="h-4 w-4 mr-1.5" />
        {isExporting ? "Generating..." : "Download PDF"}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={onLoadSample}
        className="border-border text-foreground/70"
      >
        <FileText className="h-4 w-4 mr-1.5" />
        Load Sample
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={handleExportJson}
        className="text-foreground/50"
      >
        <Upload className="h-4 w-4 mr-1.5" />
        Export JSON
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={handleImportJson}
        className="text-foreground/50"
      >
        <Download className="h-4 w-4 mr-1.5" />
        Import JSON
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={onReset}
        className="text-red-400/60 hover:text-red-400"
      >
        <RotateCcw className="h-4 w-4 mr-1.5" />
        Reset
      </Button>
    </div>
  );
}
