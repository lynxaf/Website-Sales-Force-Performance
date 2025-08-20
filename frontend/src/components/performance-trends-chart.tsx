// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// interface PerformanceData {
//   month: string
//   psCount: number
//   revenue: number
//   conversionRate: number
//   activeMembers: number
// }

// interface PerformanceTrendsChartProps {
//   data: PerformanceData[]
//   title?: string
//   description?: string
// }

// export function PerformanceTrendsChart({
//   data,
//   title = "Performance Trends",
//   description = "Monthly performance metrics and trends",
// }: PerformanceTrendsChartProps) {
//   const [selectedMetric, setSelectedMetric] = useState("psCount")
//   const [activeView, setActiveView] = useState("line")

//   const getMetricData = () => {
//     switch (selectedMetric) {
//       case "revenue":
//         return data.map((d) => ({ ...d, value: d.revenue }))
//       case "conversionRate":
//         return data.map((d) => ({ ...d, value: d.conversionRate }))
//       case "activeMembers":
//         return data.map((d) => ({ ...d, value: d.activeMembers }))
//       default:
//         return data.map((d) => ({ ...d, value: d.psCount }))
//     }
//   }

//   const getMetricLabel = () => {
//     switch (selectedMetric) {
//       case "revenue":
//         return "Revenue ($)"
//       case "conversionRate":
//         return "Conversion Rate (%)"
//       case "activeMembers":
//         return "Active Members"
//       default:
//         return "PS Count"
//     }
//   }

//   const getMetricColor = () => {
//     switch (selectedMetric) {
//       case "revenue":
//         return "#10B981"
//       case "conversionRate":
//         return "#F59E0B"
//       case "activeMembers":
//         return "#3B82F6"
//       default:
//         return "#8B5CF6"
//     }
//   }

//   const LineChart = ({ data }: { data: any[] }) => {
//     const maxValue = Math.max(...data.map((item) => item.value))
//     const minValue = Math.min(...data.map((item) => item.value))
//     const range = maxValue - minValue || 1

//     return (
//       <div className="space-y-4">
//         <div className="h-64 relative border rounded-lg p-4 bg-gray-50">
//           <svg viewBox="0 0 400 200" className="w-full h-full">
//             {/* Grid lines */}
//             {[0, 1, 2, 3, 4].map((i) => (
//               <line key={i} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="#e5e7eb" strokeWidth="1" />
//             ))}

//             {/* Data line */}
//             <polyline
//               fill="none"
//               stroke={getMetricColor()}
//               strokeWidth="3"
//               points={data
//                 .map((item, index) => {
//                   const x = (index / (data.length - 1)) * 400
//                   const y = 200 - ((item.value - minValue) / range) * 200
//                   return `${x},${y}`
//                 })
//                 .join(" ")}
//             />

//             {/* Data points */}
//             {data.map((item, index) => {
//               const x = (index / (data.length - 1)) * 400
//               const y = 200 - ((item.value - minValue) / range) * 200
//               return <circle key={index} cx={x} cy={y} r="4" fill={getMetricColor()} stroke="white" strokeWidth="2" />
//             })}
//           </svg>
//         </div>

//         {/* X-axis labels */}
//         <div className="flex justify-between text-sm text-muted-foreground">
//           {data.map((item, index) => (
//             <span key={index}>{item.month}</span>
//           ))}
//         </div>

//         {/* Legend */}
//         <div className="flex items-center gap-4 text-sm">
//           <div className="flex items-center gap-2">
//             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getMetricColor() }} />
//             <span>{getMetricLabel()}</span>
//           </div>
//           <span className="text-muted-foreground">
//             Range:{" "}
//             {selectedMetric === "revenue"
//               ? `$${minValue.toLocaleString()} - $${maxValue.toLocaleString()}`
//               : `${minValue} - ${maxValue}`}
//           </span>
//         </div>
//       </div>
//     )
//   }

//   const AreaChart = ({ data }: { data: any[] }) => {
//     const maxValue = Math.max(...data.map((item) => item.value))
//     const minValue = Math.min(...data.map((item) => item.value))
//     const range = maxValue - minValue || 1

//     return (
//       <div className="space-y-4">
//         <div className="h-64 relative border rounded-lg p-4 bg-gray-50">
//           <svg viewBox="0 0 400 200" className="w-full h-full">
//             {/* Grid lines */}
//             {[0, 1, 2, 3, 4].map((i) => (
//               <line key={i} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="#e5e7eb" strokeWidth="1" />
//             ))}

//             {/* Area fill */}
//             <polygon
//               fill={getMetricColor()}
//               fillOpacity="0.3"
//               stroke={getMetricColor()}
//               strokeWidth="2"
//               points={[
//                 "0,200",
//                 ...data.map((item, index) => {
//                   const x = (index / (data.length - 1)) * 400
//                   const y = 200 - ((item.value - minValue) / range) * 200
//                   return `${x},${y}`
//                 }),
//                 "400,200",
//               ].join(" ")}
//             />

//             {/* Data points */}
//             {data.map((item, index) => {
//               const x = (index / (data.length - 1)) * 400
//               const y = 200 - ((item.value - minValue) / range) * 200
//               return <circle key={index} cx={x} cy={y} r="4" fill={getMetricColor()} stroke="white" strokeWidth="2" />
//             })}
//           </svg>
//         </div>

//         {/* X-axis labels */}
//         <div className="flex justify-between text-sm text-muted-foreground">
//           {data.map((item, index) => (
//             <span key={index}>{item.month}</span>
//           ))}
//         </div>
//       </div>
//     )
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <div>
//             <CardTitle>{title}</CardTitle>
//             <CardDescription>{description}</CardDescription>
//           </div>
//           <Select value={selectedMetric} onValueChange={setSelectedMetric}>
//             <SelectTrigger className="w-48">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="psCount">PS Count</SelectItem>
//               <SelectItem value="revenue">Revenue</SelectItem>
//               <SelectItem value="conversionRate">Conversion Rate</SelectItem>
//               <SelectItem value="activeMembers">Active Members</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="line">Line Chart</TabsTrigger>
//             <TabsTrigger value="area">Area Chart</TabsTrigger>
//           </TabsList>

//           <TabsContent value="line" className="mt-4">
//             <LineChart data={getMetricData()} />
//           </TabsContent>

//           <TabsContent value="area" className="mt-4">
//             <AreaChart data={getMetricData()} />
//           </TabsContent>
//         </Tabs>
//       </CardContent>
//     </Card>
//   )
// }
