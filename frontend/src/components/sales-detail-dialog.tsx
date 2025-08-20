"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Search } from "lucide-react"

interface SalesDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: string
  productivity: string
  canDownload: boolean
  branch: string
  wok: string
}

interface SalesPersonData {
  id: string
  name: string
  branch: string
  wok: string
  category: string
  productivity: string
  psCount: number
  revenue: number
  conversionRate: number
  lastUpdate: string
}

export function SalesDetailDialog({
  open,
  onOpenChange,
  category,
  productivity,
  canDownload,
  branch,
  wok,
}: SalesDetailDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")

  // Sample data - in real app this would be filtered based on category/productivity
  const salesData: SalesPersonData[] = [
    {
      id: "SF001",
      name: "John Smith",
      branch: "Jakarta",
      wok: "WOK-001",
      category: "Gold",
      productivity: "Productive",
      psCount: 15,
      revenue: 45000,
      conversionRate: 12.5,
      lastUpdate: "2024-01-15",
    },
    {
      id: "SF002",
      name: "Sarah Johnson",
      branch: "Surabaya",
      wok: "WOK-002",
      category: "Silver",
      productivity: "Active",
      psCount: 8,
      revenue: 28000,
      conversionRate: 9.2,
      lastUpdate: "2024-01-15",
    },
    {
      id: "SF003",
      name: "Mike Chen",
      branch: "Bandung",
      wok: "WOK-001",
      category: "Platinum",
      productivity: "Productive",
      psCount: 25,
      revenue: 68000,
      conversionRate: 15.8,
      lastUpdate: "2024-01-15",
    },
    {
      id: "SF004",
      name: "Lisa Brown",
      branch: "Jakarta",
      wok: "WOK-003",
      category: "Bronze",
      productivity: "Non PS",
      psCount: 3,
      revenue: 12000,
      conversionRate: 4.1,
      lastUpdate: "2024-01-15",
    },
    {
      id: "SF005",
      name: "David Wilson",
      branch: "Medan",
      wok: "WOK-002",
      category: "Gold",
      productivity: "Productive",
      psCount: 12,
      revenue: 38000,
      conversionRate: 11.3,
      lastUpdate: "2024-01-15",
    },
  ]

  // Filter data based on category, productivity, branch, and wok
  const filteredData = salesData.filter((person) => {
    const matchesCategory = !category || person.category === category
    const matchesProductivity = !productivity || person.productivity === productivity
    const matchesBranch = branch === "all" || person.branch.toLowerCase().includes(branch)
    const matchesWok = wok === "all" || person.wok === wok.toUpperCase()
    const matchesSearch =
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.id.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesCategory && matchesProductivity && matchesBranch && matchesWok && matchesSearch
  })

  const handleDownload = (format: "csv" | "xlsx") => {
    // In real app, this would generate and download the file
    const filename = `sales_detail_${category || productivity}_${new Date().toISOString().split("T")[0]}.${format}`
    console.log(`Downloading ${filename}`)

    // Simulate download
    const element = document.createElement("a")
    const file = new Blob([generateCSV(filteredData)], { type: "text/csv" })
    element.href = URL.createObjectURL(file)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const generateCSV = (data: SalesPersonData[]) => {
    const headers = [
      "ID",
      "Name",
      "Branch",
      "WOK",
      "Category",
      "Productivity",
      "PS Count",
      "Revenue",
      "Conversion Rate",
      "Last Update",
    ]
    const rows = data.map((person) => [
      person.id,
      person.name,
      person.branch,
      person.wok,
      person.category,
      person.productivity,
      person.psCount,
      person.revenue,
      person.conversionRate,
      person.lastUpdate,
    ])

    return [headers, ...rows].map((row) => row.join(",")).join("\n")
  }

  const getTitle = () => {
    if (category) return `Sales Force - ${category} Category`
    if (productivity) return `Sales Force - ${productivity} Productivity`
    return "Sales Force Details"
  }

  const getCategoryColor = (cat: string) => {
    const colors = {
      Diamond: "bg-purple-100 text-purple-800",
      Platinum: "bg-gray-100 text-gray-800",
      Gold: "bg-yellow-100 text-yellow-800",
      Silver: "bg-gray-100 text-gray-600",
      Bronze: "bg-orange-100 text-orange-800",
      Black: "bg-gray-800 text-white",
    }
    return colors[cat as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getProductivityColor = (prod: string) => {
    const colors = {
      Productive: "bg-green-100 text-green-800",
      Active: "bg-yellow-100 text-yellow-800",
      "Non PS": "bg-red-100 text-red-800",
    }
    return colors[prod as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{getTitle()}</span>
            {canDownload && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload("csv")}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload("xlsx")}>
                  <Download className="mr-2 h-4 w-4" />
                  Excel
                </Button>
              </div>
            )}
          </DialogTitle>
          <DialogDescription>
            Detailed list of sales force members. Total: {filteredData.length} members
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex gap-4 items-center py-4 border-b">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="psCount">Sort by PS Count</SelectItem>
              <SelectItem value="revenue">Sort by Revenue</SelectItem>
              <SelectItem value="conversionRate">Sort by Conversion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>WOK</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Productivity</TableHead>
                <TableHead>PS Count</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Conversion Rate</TableHead>
                <TableHead>Last Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className="font-medium">{person.id}</TableCell>
                  <TableCell>{person.name}</TableCell>
                  <TableCell>{person.branch}</TableCell>
                  <TableCell>{person.wok}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(person.category)}>{person.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getProductivityColor(person.productivity)}>{person.productivity}</Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium">{person.psCount}</TableCell>
                  <TableCell>${person.revenue.toLocaleString()}</TableCell>
                  <TableCell>{person.conversionRate}%</TableCell>
                  <TableCell>{person.lastUpdate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
