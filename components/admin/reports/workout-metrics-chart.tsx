"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    completion: 85,
    intensity: 65,
    satisfaction: 90,
    week: "Week 1",
  },
  {
    completion: 88,
    intensity: 70,
    satisfaction: 85,
    week: "Week 2",
  },
  {
    completion: 82,
    intensity: 75,
    satisfaction: 88,
    week: "Week 3",
  },
  {
    completion: 90,
    intensity: 72,
    satisfaction: 92,
    week: "Week 4",
  },
]

export function WorkoutMetricsChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="week" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        <Line type="monotone" strokeWidth={2} dataKey="completion" stroke="#ef4444" dot={false} />
        <Line type="monotone" strokeWidth={2} dataKey="intensity" stroke="#3b82f6" dot={false} />
        <Line type="monotone" strokeWidth={2} dataKey="satisfaction" stroke="#22c55e" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

