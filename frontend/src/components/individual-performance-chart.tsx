"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface IndividualPerformanceData {
  date: string
  psCount: number
  revenue: number
  orders: number
  target: number
}

interface IndividualPerformanceChartProps {
  data: IndividualPerformanceData[]
  title?: string
  description?: string
}

export function IndividualPerformanceChart({
  data,
  title = "My Performance Tracking",
  description = "Daily performance metrics and progress",
}: IndividualPerformanceChartProps) {
  const [activeView, setActiveView] = useState("progress")

  const ProgressChart = ({ data }: { data: IndividualPerformanceData[] }) => {
    const maxValue = Math.max(...data.map((item) => Math.max(item.psCount, item.target)))

    return (
      <div className="space-y-4">
        <div className="h-64 relative border rounded-lg p-4 bg-gray-50">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="#e5e7eb" strokeWidth="1" />
            ))}

            {/* Target line */}
            <polyline
              fill="none"
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="5,5"
              points={data
                .map((item, index) => {
                  const x = (index / (data.length - 1)) * 400
                  const y = 200 - (item.target / maxValue) * 200
                  return `${x},${y}`
                })
                .join(" ")}
            />

            {/* PS Count line */}
            <polyline
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="3"
              points={data
                .map((item, index) => {
                  const x = (index / (data.length - 1)) * 400
                  const y = 200 - (item.psCount / maxValue) * 200
                  return `${x},${y}`
                })
                .join(" ")}
            />

            {/* PS Count points */}
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 400
              const y = 200 - (item.psCount / maxValue) * 200
              return <circle key={index} cx={x} cy={y} r="4" fill="#8B5CF6" stroke="white" strokeWidth="2" />
            })}

            {/* Target points */}
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 400
              const y = 200 - (item.target / maxValue) * 200
              return (
                <circle key={`target-${index}`} cx={x} cy={y} r="3" fill="#EF4444" stroke="white" strokeWidth="2" />
              )
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between text-sm text-muted-foreground">
          {data.map((item, index) => (
            <span key={index}>{item.date}</span>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-600" />
            <span>PS Count</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-red-500" />
            <span>Target</span>
          </div>
        </div>
      </div>
    )
  }

  const RevenueChart = ({ data }: { data: IndividualPerformanceData[] }) => {
    const maxRevenue = Math.max(...data.map((item) => item.revenue))

    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.date}</span>
                <span>${item.revenue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className="h-6 rounded-full bg-green-500 flex items-center justify-end pr-2 text-white text-xs font-medium"
                  style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                >
                  ${item.revenue.toLocaleString()}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Orders: {item.orders} | PS Count: {item.psCount}
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
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="progress">Progress vs Target</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Trend</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="mt-4">
            <ProgressChart data={data} />
          </TabsContent>

          <TabsContent value="revenue" className="mt-4">
            <RevenueChart data={data} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
