"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Mon",
    active: 400,
  },
  {
    name: "Tue",
    active: 300,
  },
  {
    name: "Wed",
    active: 500,
  },
  {
    name: "Thu",
    active: 280,
  },
  {
    name: "Fri",
    active: 450,
  },
  {
    name: "Sat",
    active: 600,
  },
  {
    name: "Sun",
    active: 550,
  },
]

export function UserActivityChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        <Bar dataKey="active" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

