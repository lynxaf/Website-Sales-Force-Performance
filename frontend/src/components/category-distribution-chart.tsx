"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CategoryData {
  name: string
  count: number
  color: string
  percentage: number
}

interface CategoryDistributionChartProps {
  data: CategoryData[]
  title?: string
  description?: string
  onCategoryClick?: (categoryName: string) => void
  clickable?: boolean
}

const COLORS = {
  Diamond: "#8B5CF6",
  Platinum: "#6B7280",
  Gold: "#F59E0B",
  Silver: "#9CA3AF",
  Bronze: "#EA580C",
  Black: "#1F2937",
}

export function CategoryDistributionChart({
  data,
  title = "Category Distribution",
  description = "Sales force distribution across categories",
  onCategoryClick,
  clickable = false,
}: CategoryDistributionChartProps) {
  const [activeView, setActiveView] = useState("pie")

  const handleCategoryClick = (categoryName: string) => {
    if (clickable && onCategoryClick) {
      onCategoryClick(categoryName)
    }
  }

  const PieChart = ({ data }: { data: CategoryData[] }) => {
    let cumulativePercentage = 0

    return (
      <div className="flex items-center justify-center">
        <div className="relative w-64 h-64">
          <svg viewBox="0 0 42 42" className="w-full h-full">
            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e5e7eb" strokeWidth="3" />
            {data.map((item, index) => {
              const strokeDasharray = `${item.percentage} ${100 - item.percentage}`
              const strokeDashoffset = 25 - cumulativePercentage
              const color = COLORS[item.name as keyof typeof COLORS] || item.color
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
                  onClick={() => handleCategoryClick(item.name)}
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
        <div className="ml-8 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-full ${clickable ? "cursor-pointer hover:scale-110" : ""}`}
                style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] || item.color }}
                onClick={() => handleCategoryClick(item.name)}
              />
              <span
                className={`text-sm ${clickable ? "cursor-pointer hover:underline" : ""}`}
                onClick={() => handleCategoryClick(item.name)}
              >
                {item.name}: {item.count} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const BarChart = ({ data }: { data: CategoryData[] }) => {
    const maxCount = Math.max(...data.map((item) => item.count))

    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span
                className={`font-medium ${clickable ? "cursor-pointer hover:underline" : ""}`}
                onClick={() => handleCategoryClick(item.name)}
              >
                {item.name}
              </span>
              <span>
                {item.count} ({item.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className={`h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium ${
                  clickable ? "cursor-pointer hover:opacity-80" : ""
                }`}
                style={{
                  width: `${(item.count / maxCount) * 100}%`,
                  backgroundColor: COLORS[item.name as keyof typeof COLORS] || item.color,
                }}
                onClick={() => handleCategoryClick(item.name)}
              >
                {item.count}
              </div>
            </div>
          </div>
        ))}
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
            <span className="block text-xs text-blue-600 mt-1">💡 Click on categories to view details</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
          </TabsList>

          <TabsContent value="pie" className="mt-4">
            <PieChart data={data} />
          </TabsContent>

          <TabsContent value="bar" className="mt-4">
            <BarChart data={data} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
