"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    revenue: 4000,
    month: "Jan",
  },
  {
    revenue: 3000,
    month: "Feb",
  },
  {
    revenue: 2000,
    month: "Mar",
  },
  {
    revenue: 2780,
    month: "Apr",
  },
  {
    revenue: 1890,
    month: "May",
  },
  {
    revenue: 2390,
    month: "Jun",
  },
  {
    revenue: 3490,
    month: "Jul",
  },
]

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

