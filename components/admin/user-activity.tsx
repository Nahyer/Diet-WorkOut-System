"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { time: "00:00", users: 120 },
  { time: "03:00", users: 80 },
  { time: "06:00", users: 60 },
  { time: "09:00", users: 180 },
  { time: "12:00", users: 250 },
  { time: "15:00", users: 280 },
  { time: "18:00", users: 220 },
  { time: "21:00", users: 160 },
]

export function UserActivity() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="users" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

