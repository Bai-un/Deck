import { useState } from 'react'
import { Flex, Text, Button, Box, Collapse, useDisclosure } from '@chakra-ui/react'
import { ChevronDown, ChevronRight, FolderOpen, Trash2 } from 'lucide-react'
import type { StartupItem } from '../../types/tuning'

interface StartupItemRowProps {
  item: StartupItem
  onToggle: (id: string, enabled: boolean) => void
  onRemove: (id: string) => void
  onOpenLocation: (id: string) => void
  loading?: boolean
}

const impactColors: Record<string, string> = {
  high: '#FF5555',
  medium: '#FFA500',
  low: '#4ECDC4',
  none: '#8B949E',
}

export function StartupItemRow({ item, onToggle, onRemove, onOpenLocation, loading }: StartupItemRowProps) {
  const { isOpen, onToggle: onExpand } = useDisclosure()
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <Box>
      <Flex align="center" gap={3} py={3} px={4}>
        <Box
          w="12px"
          h="12px"
          borderRadius="3px"
          border="2px solid"
          borderColor={item.enabled ? '#6C63FF' : '#636D7D'}
          bg={item.enabled ? '#6C63FF' : 'transparent'}
          cursor="pointer"
          onClick={() => onToggle(item.id, !item.enabled)}
          flexShrink={0}
        />
        <Flex flex={1} direction="column" minW={0}>
          <Flex align="center" gap={2}>
            <Text fontSize="sm" color="#E6EDF3" fontWeight={500} noOfLines={1}>
              {item.name}
            </Text>
            <Box
              fontSize="10px"
              color={impactColors[item.impact] || '#8B949E'}
              bg={`${impactColors[item.impact] || '#8B949E'}20`}
              px={1.5}
              py={0.5}
              borderRadius="4px"
              fontWeight={500}
            >
              {item.impact === 'high' ? '高影响' : item.impact === 'medium' ? '中影响' : '低影响'}
            </Box>
          </Flex>
          <Text fontSize="11px" color="#636D7D">
            {item.publisher}
          </Text>
        </Flex>
        <Flex gap={1.5} align="center" flexShrink={0}>
          <Button
            size="xs"
            variant="ghost"
            color="#8B949E"
            _hover={{ color: '#E6EDF3' }}
            title="打开位置"
            onClick={() => onOpenLocation(item.id)}
            p={1}
            minW="auto"
          >
            <FolderOpen size={14} />
          </Button>
          <Button
            size="xs"
            variant="ghost"
            color={item.enabled ? '#FFA500' : '#4ECDC4'}
            _hover={{ color: '#E6EDF3' }}
            isLoading={loading}
            onClick={() => onToggle(item.id, !item.enabled)}
          >
            {item.enabled ? '禁用' : '启用'}
          </Button>
          {showConfirm ? (
            <Flex gap={1}>
              <Button
                size="xs"
                bg="#FF5555"
                color="white"
                borderRadius="4px"
                _hover={{ bg: '#E04444' }}
                isLoading={loading}
                onClick={() => { onRemove(item.id); setShowConfirm(false) }}
              >
                确认
              </Button>
              <Button
                size="xs"
                variant="ghost"
                color="#8B949E"
                onClick={() => setShowConfirm(false)}
              >
                取消
              </Button>
            </Flex>
          ) : (
            <Button
              size="xs"
              variant="ghost"
              color="#FF5555"
              _hover={{ color: '#E04444', bg: 'rgba(255,85,85,0.1)' }}
              onClick={() => setShowConfirm(true)}
              p={1}
              minW="auto"
            >
              <Trash2 size={14} />
            </Button>
          )}
        </Flex>
        <Box
          as="button"
          onClick={onExpand}
          color="#636D7D"
          _hover={{ color: '#E6EDF3' }}
          flexShrink={0}
        >
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </Box>
      </Flex>
      <Collapse in={isOpen}>
        <Box px={4} pb={3}>
          <Text fontSize="11px" color="#636D7D" fontFamily="monospace" wordBreak="break-all">
            {item.command}
          </Text>
        </Box>
      </Collapse>
    </Box>
  )
}
