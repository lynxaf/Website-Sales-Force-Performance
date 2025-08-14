"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download, Users, Target, TrendingUp, DollarSign, Filter, Eye } from "lucide-react"

import { CategoryDistributionChart } from "@/components/category-distribution-chart"
// import { PerformanceTrendsChart } from "@/components/performance-trends-chart"
import { ProductivityAnalysisChart } from "@/components/productivity-analysis-chart"
import { UploadDataDialog } from "@/components/upload-data-dialog"
import { SalesDetailDialog } from "@/components/sales-detail-dialog"
import { DownloadInsightsDialog } from "@/components/download-insights-dialog"

interface User {
  username: string
  role: string
}

interface UnifiedDashboardProps {
  user: User
}

export function UnifiedDashboard({ user }: UnifiedDashboardProps) {
  const [selectedBranch, setSelectedBranch] = useState("all")
  const [selectedWOK, setSelectedWOK] = useState("all")
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showSalesDetail, setShowSalesDetail] = useState(false)
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedProductivity, setSelectedProductivity] = useState("")

  // Sample data - in real app this would come from API
  const branches = [
    { value: "all", label: "All Branches" },
    { value: "jakarta", label: "Jakarta" },
    { value: "surabaya", label: "Surabaya" },
    { value: "bandung", label: "Bandung" },
    { value: "medan", label: "Medan" },
  ]

  const wokOptions = [
    { value: "all", label: "All WOK" },
    { value: "wok1", label: "WOK-001" },
    { value: "wok2", label: "WOK-002" },
    { value: "wok3", label: "WOK-003" },
    { value: "wok4", label: "WOK-004" },
  ]

  const categoryData = [
    { name: "Diamond", count: 12, color: "#8B5CF6", percentage: 8 },
    { name: "Platinum", count: 28, color: "#6B7280", percentage: 18 },
    { name: "Gold", count: 45, color: "#F59E0B", percentage: 29 },
    { name: "Silver", count: 38, color: "#9CA3AF", percentage: 25 },
    { name: "Bronze", count: 22, color: "#EA580C", percentage: 14 },
    { name: "Black", count: 10, color: "#1F2937", percentage: 6 },
  ]

  const productivityData = [
    { level: "Productive", count: 89, percentage: 57, revenue: 28500, conversionRate: 15.2 },
    { level: "Active", count: 45, percentage: 29, revenue: 18200, conversionRate: 11.8 },
    { level: "Non PS", count: 21, percentage: 14, revenue: 5800, conversionRate: 4.2 },
  ]

  const performanceTrendsData = [
    { month: "Jan", psCount: 145, revenue: 2100000, conversionRate: 12.5, activeMembers: 132 },
    { month: "Feb", psCount: 152, revenue: 2250000, conversionRate: 13.2, activeMembers: 138 },
    { month: "Mar", psCount: 148, revenue: 2180000, conversionRate: 12.8, activeMembers: 135 },
    { month: "Apr", psCount: 165, revenue: 2400000, conversionRate: 14.1, activeMembers: 142 },
    { month: "May", psCount: 158, revenue: 2320000, conversionRate: 13.6, activeMembers: 140 },
    { month: "Jun", psCount: 172, revenue: 2500000, conversionRate: 14.8, activeMembers: 155 },
  ]

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName)
    setShowSalesDetail(true)
  }

  const handleProductivityClick = (productivityLevel: string) => {
    setSelectedProductivity(productivityLevel)
    setShowSalesDetail(true)
  }

  const canUpload = user.role === "super_admin"
  const canDownload = user.role === "super_admin" || user.role === "team_leader"
  const canViewOnly = user.role === "sales_person"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Performance Dashboard</h1>
          <p className="text-muted-foreground">
            {user.role === "super_admin" && "Complete sales force management and analytics"}
            {user.role === "team_leader" && "Team performance insights and reporting"}
            {user.role === "sales_person" && "View sales performance metrics"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {user.role.replace("_", " ")}
          </Badge>
          <Badge variant="secondary">{user.username}</Badge>
        </div>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Branch:</label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.value} value={branch.value}>
                      {branch.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">WOK:</label>
              <Select value={selectedWOK} onValueChange={setSelectedWOK}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {wokOptions.map((wok) => (
                    <SelectItem key={wok.value} value={wok.value}>
                      {wok.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              {canUpload && (
                <Button onClick={() => setShowUploadDialog(true)} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Data
                </Button>
              )}
              {canDownload && (
                <Button variant="outline" onClick={() => setShowDownloadDialog(true)} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Insights
                </Button>
              )}
              {canViewOnly && (
                <Button variant="outline" disabled className="gap-2 bg-transparent">
                  <Eye className="h-4 w-4" />
                  View Only
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales Force</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">155</div>
            <p className="text-xs text-muted-foreground">
              {selectedBranch !== "all" && `Branch: ${branches.find((b) => b.value === selectedBranch)?.label}`}
              {selectedWOK !== "all" && ` | WOK: ${wokOptions.find((w) => w.value === selectedWOK)?.label}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.4M</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg PS Count</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5</div>
            <p className="text-xs text-muted-foreground">+2.1 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryDistributionChart
          data={categoryData}
          title="SF Category Distribution"
          description="Click on categories to view detailed sales list"
          onCategoryClick={handleCategoryClick}
          clickable={true}
        />
        <ProductivityAnalysisChart
          data={productivityData}
          title="SF Productivity Analysis"
          description="Click on productivity levels to view detailed sales list"
          onProductivityClick={handleProductivityClick}
          clickable={true}
        />
      </div>

      {/* <PerformanceTrendsChart
        data={performanceTrendsData}
        title="Performance Trends Overview"
        description="Monthly performance metrics and growth trends"
      /> */}

      {/* Dialogs */}
      {canUpload && <UploadDataDialog open={showUploadDialog} onOpenChange={setShowUploadDialog} />}

      {canDownload && (
        <DownloadInsightsDialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog} userRole={user.role} />
      )}

      <SalesDetailDialog
        open={showSalesDetail}
        onOpenChange={setShowSalesDetail}
        category={selectedCategory}
        productivity={selectedProductivity}
        canDownload={canDownload}
        branch={selectedBranch}
        wok={selectedWOK}
      />
    </div>
  )
}
