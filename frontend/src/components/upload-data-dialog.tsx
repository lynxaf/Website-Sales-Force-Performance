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
    const input = document.getElementById(
      type === "salesforce" ? "sf-file" : "perf-file"
    ) as HTMLInputElement;

    if (!input?.files?.length) {
      alert("Please select a file first!");
      return;
    }

    const file = input.files[0];

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload only Excel (.xlsx, .xls) or CSV files");
      return;
    }

    const formData = new FormData();
    formData.append("sales_data", file); // Match the multer field name

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("idle");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMessage = responseData?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      // Simulate progress bar while processing
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadStatus("success");

          // Show success message
          alert("File uploaded successfully!");
        }
      }, 200);

    } catch (err) {
      console.error("Upload error:", err);
      setIsUploading(false);
      setUploadStatus("error");

      // Show specific error message to user
      alert(`Upload failed:`);
    }
  };

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

        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {/* <TabsTrigger value="salesforce">Salesforce Data</TabsTrigger> */}
            <TabsTrigger value="performance">Performance Data</TabsTrigger>
          </TabsList>

          {/* Salesforce Tab
          <TabsContent value="salesforce" className="space-y-4">
            <div className="space-y-4">
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
                  <span className="text-sm">
                    Upload successful! Data processed and categories assigned.
                  </span>
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => handleFileUpload("salesforce")}
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Salesforce Data
              </Button>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Supported formats: .xlsx, .xls</p>
                <p>• Maximum file size: 10MB</p>
                <p>• Data will be automatically updated in SF master list</p>
              </div>
            </div>
          </TabsContent> */}

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="perf-file">Upload Performance Excel File</Label>
                <Input id="perf-file" type="file" accept=".xlsx,.xls" />
              </div>

              <Button
                className="w-full"
                onClick={() => handleFileUpload("performance")}
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Performance Data
              </Button>
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
                  <span className="text-sm">
                    Upload successful! Data processed and categories assigned.
                  </span>
                </div>
              )}

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
