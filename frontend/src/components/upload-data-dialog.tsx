"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Download, CheckCircle } from "lucide-react"

interface UploadDataDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadDataDialog({ open, onOpenChange }: UploadDataDialogProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")

  const handleFileUpload = async (type: string) => {
    setIsUploading(true)
    setUploadProgress(0)
    setUploadStatus("idle")

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadStatus("success")
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Data Management
          </DialogTitle>
          <DialogDescription>
            Upload Salesforce and Performance data files. Only Excel files (.xlsx, .xls) are supported.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="salesforce" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="salesforce">Salesforce Data</TabsTrigger>
            <TabsTrigger value="performance">Performance Data</TabsTrigger>
          </TabsList>

          <TabsContent value="salesforce" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Download Template</Label>
                <Button variant="outline" className="w-full bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Download Salesforce Template
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sf-file">Upload Salesforce Excel File</Label>
                <Input id="sf-file" type="file" accept=".xlsx,.xls" />
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {uploadStatus === "success" && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Upload successful! Data processed and categories assigned.</span>
                </div>
              )}

              <Button className="w-full" onClick={() => handleFileUpload("salesforce")} disabled={isUploading}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Salesforce Data
              </Button>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Supported formats: .xlsx, .xls</p>
                <p>• Maximum file size: 10MB</p>
                <p>• Data will be automatically updated in SF master list</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Download Template</Label>
                <Button variant="outline" className="w-full bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Download Performance Template
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="perf-file">Upload Performance Excel File</Label>
                <Input id="perf-file" type="file" accept=".xlsx,.xls" />
              </div>

              <Button className="w-full" onClick={() => handleFileUpload("performance")} disabled={isUploading}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Performance Data
              </Button>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>• System matches data by Sales Code & Order ID</p>
                <p>• Automatically calculates PS count for each SF</p>
                <p>• Auto-assigns SF category and productivity level</p>
                <p>• Updates performance summary</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
