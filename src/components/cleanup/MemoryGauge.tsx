import { useEffect, useRef } from 'react'
import { Flex, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

interface MemoryGaugeProps {
  percent: number
  usedBytes: number
  totalBytes: number
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const idx = Math.min(i, units.length - 1)
  return `${(bytes / Math.pow(1024, idx)).toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`
}

export function MemoryGauge({ percent, usedBytes, totalBytes }: MemoryGaugeProps) {
  const { t } = useTranslation()
  const prevPercentRef = useRef(percent)
  const color = percent > 80 ? '#FF5555' : percent > 60 ? '#FFA500' : '#6C63FF'

  // Trigger re-render for animation
  useEffect(() => {
    prevPercentRef.current = percent
  }, [percent])

  const radius = 80
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <Flex direction="column" align="center" gap={3}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#21262D"
          strokeWidth="10"
        />
        {/* Progress circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 100 100)"
          style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
        />
        {/* Center text */}
        <text
          x="100"
          y="90"
          textAnchor="middle"
          fill="#E6EDF3"
          fontSize="28"
          fontWeight="bold"
        >
          {`${percent.toFixed(1)}%`}
        </text>
        <text
          x="100"
          y="115"
          textAnchor="middle"
          fill="#8B949E"
          fontSize="12"
        >
          {t('cleanup.memory.currentUsage')}
        </text>
      </svg>
      <Text fontSize="sm" color="#8B949E">
        {formatBytes(usedBytes)} / {formatBytes(totalBytes)}
      </Text>
    </Flex>
  )
}
