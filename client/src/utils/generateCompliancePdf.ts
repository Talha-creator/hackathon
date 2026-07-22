import jsPDF from "jspdf";
import type { ComplianceReport } from "./complianceReport";

const MARGIN_X = 48;
const BOTTOM_MARGIN = 48;

interface TextOptions {
  size?: number;
  bold?: boolean;
  color?: [number, number, number];
  gap?: number;
}

export function downloadCompliancePdf(report: ComplianceReport) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN_X * 2;
  let y = 56;

  function ensureSpace(lineHeight: number) {
    if (y + lineHeight > pageHeight - BOTTOM_MARGIN) {
      doc.addPage();
      y = 56;
    }
  }

  function writeLine(text: string, opts: TextOptions = {}) {
    const { size = 10, bold = false, color = [30, 30, 30], gap = 14 } = opts;
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentWidth);
    for (const line of lines) {
      ensureSpace(gap);
      doc.text(line, MARGIN_X, y);
      y += gap;
    }
  }

  writeLine("Site Safety Compliance Report", { size: 18, bold: true, gap: 24 });
  writeLine(`Site: ${report.siteName}`, { size: 11, gap: 16 });
  writeLine(`Generated: ${new Date().toLocaleDateString()}`, { size: 11, gap: 22 });

  writeLine("Summary", { size: 13, bold: true, gap: 18 });
  writeLine(report.summary, { size: 10, gap: 14 });
  y += 8;

  writeLine(`Overall site security: ${report.overallPercentage}%`, { size: 13, bold: true, gap: 26 });

  writeLine("Action Needed", { size: 12, bold: true, color: [176, 40, 40], gap: 18 });
  if (report.actionItems.length === 0) {
    writeLine("None", { size: 10, gap: 20 });
  } else {
    for (const item of report.actionItems) {
      writeLine(`[${item.section}] ${item.question} — action needed`, { size: 10, gap: 14 });
    }
    y += 8;
  }

  writeLine("No Action Needed", { size: 12, bold: true, color: [12, 130, 12], gap: 18 });
  if (report.passedItems.length === 0) {
    writeLine("None", { size: 10, gap: 20 });
  } else {
    for (const item of report.passedItems) {
      writeLine(`[${item.section}] ${item.question} — passed`, { size: 10, gap: 14 });
    }
  }

  doc.save(`compliance-report-${report.auditId}.pdf`);
}
