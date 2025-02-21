"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { time: "00:00", cpu: 45, memory: 60, response: 42 },
  { time: "03:00", cpu: 55, memory: 65, response: 45 },
  { time: "06:00", cpu: 65, memory: 70, response: 48 },
  { time: "09:00", cpu: 75, memory: 75, response: 52 },
  { time: "12:00", cpu: 85, memory: 80, response: 55 },
  { time: "15:00", cpu: 70, memory: 75, response: 50 },
  { time: "18:00", cpu: 60, memory: 70, response: 45 },
  { time: "21:00", cpu: 50, memory: 65, response: 40 },
]

export function SystemMetrics() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="cpu" stroke="#ef4444" name="CPU Usage %" />
        <Line type="monotone" dataKey="memory" stroke="#3b82f6" name="Memory Usage %" />
        <Line type="monotone" dataKey="response" stroke="#22c55e" name="Response Time (ms)" />
      </LineChart>
    </ResponsiveContainer>
  )
}

