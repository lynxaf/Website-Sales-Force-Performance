"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProductivityData {
  level: string
  count: number
  percentage: number
  revenue?: number
  conversionRate?: number
}

interface ProductivityAnalysisChartProps {
  data: ProductivityData[]
  title?: string
  description?: string
  onProductivityClick?: (productivityLevel: string) => void
  clickable?: boolean
}

const PRODUCTIVITY_COLORS = {
  Productive: "#10B981",
  Active: "#F59E0B",
  "Non PS": "#EF4444",
}

export function ProductivityAnalysisChart({
  data,
  title = "Productivity Analysis",
  description = "Sales force productivity breakdown and metrics",
  onProductivityClick,
  clickable = false,
}: ProductivityAnalysisChartProps) {
  const [activeView, setActiveView] = useState("bar")

  const handleProductivityClick = (productivityLevel: string) => {
    if (clickable && onProductivityClick) {
      onProductivityClick(productivityLevel)
    }
  }

  const BarChart = ({ data }: { data: ProductivityData[] }) => {
    const maxCount = Math.max(...data.map((item) => item.count))

    return (
      <div className="space-y-6">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full ${clickable ? "cursor-pointer hover:scale-110" : ""}`}
                  style={{ backgroundColor: PRODUCTIVITY_COLORS[item.level as keyof typeof PRODUCTIVITY_COLORS] }}
                  onClick={() => handleProductivityClick(item.level)}
                />
                <span
                  className={`font-medium ${clickable ? "cursor-pointer hover:underline" : ""}`}
                  onClick={() => handleProductivityClick(item.level)}
                >
                  {item.level}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {item.count} members ({item.percentage}%)
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-8">
              <div
                className={`h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-medium ${
                  clickable ? "cursor-pointer hover:opacity-80" : ""
                }`}
                style={{
                  width: `${(item.count / maxCount) * 100}%`,
                  backgroundColor: PRODUCTIVITY_COLORS[item.level as keyof typeof PRODUCTIVITY_COLORS],
                }}
                onClick={() => handleProductivityClick(item.level)}
              >
                {item.count}
              </div>
            </div>
            {item.revenue && (
              <div className="text-xs text-muted-foreground">
                Avg Revenue: ${item.revenue.toLocaleString()} | Conversion: {item.conversionRate}%
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const PieChart = ({ data }: { data: ProductivityData[] }) => {
    let cumulativePercentage = 0

    return (
      <div className="flex items-center justify-center">
        <div className="relative w-64 h-64">
          <svg viewBox="0 0 42 42" className="w-full h-full">
            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e5e7eb" strokeWidth="3" />
            {data.map((item, index) => {
              const strokeDasharray = `${item.percentage} ${100 - item.percentage}`
              const strokeDashoffset = 25 - cumulativePercentage
              const color = PRODUCTIVITY_COLORS[item.level as keyof typeof PRODUCTIVITY_COLORS]
              cumulativePercentage += item.percentage

              return (
                <circle
                  key={index}
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke={color}
                  strokeWidth="3"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 21 21)"
                  className={clickable ? "cursor-pointer hover:opacity-80" : ""}
                  onClick={() => handleProductivityClick(item.level)}
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{data.reduce((sum, item) => sum + item.count, 0)}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
        <div className="ml-8 space-y-3">
          {data.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full ${clickable ? "cursor-pointer hover:scale-110" : ""}`}
                  style={{ backgroundColor: PRODUCTIVITY_COLORS[item.level as keyof typeof PRODUCTIVITY_COLORS] }}
                  onClick={() => handleProductivityClick(item.level)}
                />
                <span
                  className={`text-sm font-medium ${clickable ? "cursor-pointer hover:underline" : ""}`}
                  onClick={() => handleProductivityClick(item.level)}
                >
                  {item.level}
                </span>
              </div>
              <div className="text-xs text-muted-foreground ml-6">
                {item.count} members ({item.percentage}%)
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
          {clickable && (
            <span className="block text-xs text-blue-600 mt-1">💡 Click on productivity levels to view details</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="pie">Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="bar" className="mt-4">
            <BarChart data={data} />
          </TabsContent>

          <TabsContent value="pie" className="mt-4">
            <PieChart data={data} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
