"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Download, FileSpreadsheet, BarChart3 } from "lucide-react"

interface DownloadInsightsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userRole: string
}

export function DownloadInsightsDialog({ open, onOpenChange, userRole }: DownloadInsightsDialogProps) {
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [format, setFormat] = useState("xlsx")
  const [dateRange, setDateRange] = useState("current_month")

  const availableReports = [
    {
      id: "category_distribution",
      label: "Category Distribution Report",
      description: "SF distribution across all categories",
    },
    {
      id: "productivity_analysis",
      label: "Productivity Analysis Report",
      description: "Detailed productivity breakdown",
    },
    { id: "performance_trends", label: "Performance Trends Report", description: "Monthly performance metrics" },
    {
      id: "revenue_analysis",
      label: "Revenue Analysis Report",
      description: "Revenue breakdown by category and branch",
    },
    { id: "conversion_rates", label: "Conversion Rates Report", description: "Conversion analysis across segments" },
    {
      id: "branch_comparison",
      label: "Branch Comparison Report",
      description: "Performance comparison across branches",
    },
  ]

  // Team leaders might have restricted access to some reports
  const filteredReports =
    userRole === "team_leader"
      ? availableReports.filter((report) => !["revenue_analysis", "branch_comparison"].includes(report.id))
      : availableReports

  const handleReportToggle = (reportId: string) => {
    setSelectedReports((prev) => (prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]))
  }

  const handleDownload = () => {
    if (selectedReports.length === 0) return

    // In real app, this would generate and download the reports
    const filename = `sales_insights_${dateRange}_${new Date().toISOString().split("T")[0]}.${format}`
    console.log(`Downloading ${filename} with reports:`, selectedReports)

    // Simulate download
    setTimeout(() => {
      onOpenChange(false)
      setSelectedReports([])
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Insights & Reports
          </DialogTitle>
          <DialogDescription>
            Select the reports you want to download. Available formats: Excel (.xlsx) and CSV (.csv)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Range Selection */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">Current Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                <SelectItem value="current_year">Current Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <Label>File Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV (.csv)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Report Selection */}
          <div className="space-y-4">
            <Label>Select Reports to Download</Label>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {filteredReports.map((report) => (
                <div key={report.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={report.id}
                    checked={selectedReports.includes(report.id)}
                    onCheckedChange={() => handleReportToggle(report.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={report.id} className="font-medium cursor-pointer">
                      {report.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                  </div>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {selectedReports.length} report{selectedReports.length !== 1 ? "s" : ""} selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleDownload} disabled={selectedReports.length === 0} className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Download Reports
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
