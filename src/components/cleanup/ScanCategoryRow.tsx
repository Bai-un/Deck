import { useState } from 'react'
import { Flex, Text, Checkbox, Box, Collapse } from '@chakra-ui/react'
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import type { ScanCategory } from '../../types/cleanup'

interface ScanCategoryRowProps {
  category: ScanCategory
  checked: boolean
  onChange: (id: string) => void
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const idx = Math.min(i, units.length - 1)
  return `${(bytes / Math.pow(1024, idx)).toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`
}

export function ScanCategoryRow({ category, checked, onChange }: ScanCategoryRowProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Box>
      <Flex
        align="center"
        gap={3}
        py={3}
        px={4}
        cursor="pointer"
        _hover={{ bg: 'rgba(255,255,255,0.02)' }}
        borderRadius="8px"
        onClick={() => setExpanded(!expanded)}
      >
        <Box onClick={(e) => e.stopPropagation()}>
          <Checkbox
            isChecked={checked}
            onChange={() => onChange(category.id)}
            borderColor="#8B949E"
            colorScheme="purple"
          />
        </Box>
        <Flex flex={1} align="center" gap={2}>
          <Text fontSize="sm" color="#E6EDF3" fontWeight={500}>
            {category.name}
          </Text>
          {!category.safe_to_clean && (
            <AlertTriangle size={14} color="#FFA500" />
          )}
        </Flex>
        <Text fontSize="sm" color="#E6EDF3" fontWeight={600} w="80px" textAlign="right">
          {formatBytes(category.size_bytes)}
        </Text>
        <Text fontSize="xs" color="#8B949E" w="60px" textAlign="right">
          {category.file_count > 0 ? `${Math.round(category.file_count / 1000)}K` : '0'} 文件
        </Text>
        {expanded ? (
          <ChevronDown size={14} color="#8B949E" />
        ) : (
          <ChevronRight size={14} color="#8B949E" />
        )}
      </Flex>
      <Collapse in={expanded}>
        <Box px={12} pb={2}>
          <Text fontSize="xs" color="#8B949E" mb={1}>
            {category.description}
          </Text>
          {category.paths.map((path, i) => (
            <Text key={i} fontSize="11px" color="#636D7D" fontFamily="monospace">
              {path}
            </Text>
          ))}
          {!category.safe_to_clean && (
            <Text fontSize="11px" color="#FFA500" mt={1}>
              ⚠ 清除后将无法恢复最近打开记录
            </Text>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}
