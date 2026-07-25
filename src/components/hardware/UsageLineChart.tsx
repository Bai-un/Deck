import { Box } from '@chakra-ui/react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  YAxis,
} from 'recharts'

interface UsageLineChartProps {
  data: number[]
  color: string
  height?: number
  maxPoints?: number
  showArea?: boolean
  unit?: string
}

export function UsageLineChart({
  data,
  color,
  height = 80,
  showArea = true,
}: UsageLineChartProps) {
  const chartData = data.map((v, i) => ({ i, v }))

  return (
    <Box w="full" h={`${height}px`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={[0, 100]} hide />
          {showArea ? (
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${color})`}
              isAnimationActive={false}
              dot={false}
            />
          ) : (
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={2}
              fill="none"
              isAnimationActive={false}
              dot={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  )
}
