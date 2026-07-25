import { useEffect, useState, useMemo } from 'react'
import {
  Flex, Text, Box, Input, InputGroup, InputLeftElement, Divider, Spinner, useToast,
} from '@chakra-ui/react'
import { Power, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/ui/PageContainer'
import { StartupItemRow } from '../components/tuning/StartupItemRow'
import { getStartupItems, toggleStartupItem, removeStartupItem, openStartupItemLocation } from '../lib/tuning-api'
import type { StartupItem } from '../types/tuning'

export function StartupManagerPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const [items, setItems] = useState<StartupItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    getStartupItems()
      .then(setItems)
      .catch((e) => toast({ title: '加载失败', description: String(e), status: 'error', duration: 3000 }))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter((i) => i.name.toLowerCase().includes(q) || i.publisher.toLowerCase().includes(q))
  }, [items, search])

  const enabledCount = items.filter((i) => i.enabled).length

  // Sort: impact order high > medium > low
  const sortedItems = useMemo(() => {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 }
    return [...filteredItems].sort((a, b) => (order[a.impact] ?? 2) - (order[b.impact] ?? 2))
  }, [filteredItems])

  const handleToggle = async (id: string, enabled: boolean) => {
    setActionLoading(id)
    try {
      await toggleStartupItem(id, enabled)
      toast({ title: enabled ? '已启用' : '已禁用', status: 'success', duration: 1500 })
      load()
    } catch (e) {
      toast({ title: '操作失败', description: String(e), status: 'error', duration: 3000 })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemove = async (id: string) => {
    setActionLoading(id)
    try {
      await removeStartupItem(id)
      toast({ title: '已删除启动项', status: 'success', duration: 1500 })
      load()
    } catch (e) {
      toast({ title: '删除失败', description: String(e), status: 'error', duration: 3000 })
    } finally {
      setActionLoading(null)
    }
  }

  const handleOpenLocation = async (id: string) => {
    try {
      await openStartupItemLocation(id)
    } catch (e) {
      toast({ title: '打开位置失败', description: String(e), status: 'error', duration: 3000 })
    }
  }

  return (
    <PageContainer>
      <Flex align="center" gap={2} mb={4}>
        <Box as={Power} size={20} color="#6C63FF" />
        <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
          {t('tuning.startup.title')}
        </Text>
      </Flex>

      {/* Summary + Search */}
      <Flex justify="space-between" align="center" mb={4} px={1}>
        <Flex gap={3}>
          <Text fontSize="xs" color="#8B949E">
            {t('tuning.startup.totalItems', { count: items.length })}
          </Text>
          <Text fontSize="xs" color="#8B949E">
            {t('tuning.startup.enabledItems', { count: enabledCount })}
          </Text>
        </Flex>
        <InputGroup maxW="240px" size="sm">
          <InputLeftElement pointerEvents="none">
            <Search size={14} color="#636D7D" />
          </InputLeftElement>
          <Input
            placeholder="搜索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg="#161B22"
            border="1px solid"
            borderColor="#30363D"
            color="#E6EDF3"
            fontSize="sm"
            borderRadius="8px"
            _focus={{ borderColor: '#6C63FF' }}
          />
        </InputGroup>
      </Flex>

      {loading && (
        <Flex direction="column" align="center" justify="center" py={20} gap={4}>
          <Spinner size="xl" color="#6C63FF" />
          <Text color="#8B949E" fontSize="sm">{t('common.loading')}</Text>
        </Flex>
      )}

      {!loading && sortedItems.length === 0 && (
        <Flex direction="column" align="center" justify="center" py={20} gap={4}>
          <Text color="#8B949E" fontSize="sm">
            {search ? '没有匹配的启动项' : '暂无启动项'}
          </Text>
        </Flex>
      )}

      {!loading && sortedItems.length > 0 && (
        <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" overflow="hidden">
          {sortedItems.map((item, i) => (
            <Box key={item.id}>
              {i > 0 && <Divider borderColor="#30363D" />}
              <StartupItemRow
                item={item}
                onToggle={handleToggle}
                onRemove={handleRemove}
                onOpenLocation={handleOpenLocation}
                loading={actionLoading === item.id}
              />
            </Box>
          ))}
        </Box>
      )}
    </PageContainer>
  )
}
