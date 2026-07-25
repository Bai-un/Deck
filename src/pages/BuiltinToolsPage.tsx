import { useEffect, useState, useMemo } from 'react'
import { Flex, Text, Box, Input, useToast, Spinner, SimpleGrid } from '@chakra-ui/react'
import { Terminal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/ui/PageContainer'
import { ToolShortcutCard } from '../components/tools/ToolShortcutCard'
import { getBuiltinTools, launchBuiltinTool } from '../lib/tools-api'
import type { BuiltinTool } from '../types/tools'

export function BuiltinToolsPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const [tools, setTools] = useState<BuiltinTool[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getBuiltinTools()
      .then(setTools)
      .catch(() => toast({ title: '加载失败', status: 'error', duration: 3000 }))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(
    () => tools.filter((tool) => tool.name.includes(search) || tool.description.includes(search)),
    [tools, search],
  )

  const grouped = useMemo(() => {
    const groups: Record<string, BuiltinTool[]> = {}
    for (const tool of filtered) {
      if (!groups[tool.category]) groups[tool.category] = []
      groups[tool.category].push(tool)
    }
    return groups
  }, [filtered])

  const categoryLabels: Record<string, string> = {
    system: '系统',
    systemInfo: '系统信息',
    network: '网络',
    disk: '磁盘',
    security: '安全',
  }

  const handleLaunch = async (tool: BuiltinTool) => {
    try {
      await launchBuiltinTool(tool.command)
      toast({ title: `正在启动 ${tool.name}`, status: 'info', duration: 2000 })
    } catch (e) {
      toast({ title: '启动失败', description: String(e), status: 'error', duration: 3000 })
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <Flex direction="column" align="center" justify="center" py={20} gap={4}>
          <Spinner size="xl" color="#6C63FF" />
          <Text color="#8B949E" fontSize="sm">{t('common.loading')}</Text>
        </Flex>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Flex align="center" gap={2} mb={4}>
        <Box as={Terminal} size={20} color="#6C63FF" />
        <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
          系统工具
        </Text>
      </Flex>

      {/* Search */}
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="搜索工具..."
        bg="#0D1117"
        border="1px solid"
        borderColor="#30363D"
        color="#E6EDF3"
        fontSize="sm"
        borderRadius="8px"
        _focus={{ borderColor: '#6C63FF' }}
        mb={6}
      />

      {/* Tool groups */}
      {Object.entries(grouped).map(([category, catTools]) => (
        <Box key={category} mb={6}>
          <Text fontSize="xs" color="#636D7D" fontWeight={600} textTransform="uppercase" letterSpacing="1px" mb={3}>
            {categoryLabels[category] || category}
          </Text>
          <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={3}>
            {catTools.map((tool) => (
              <ToolShortcutCard
                key={tool.id}
                tool={tool}
                onClick={() => handleLaunch(tool)}
              />
            ))}
          </SimpleGrid>
        </Box>
      ))}

      {filtered.length === 0 && (
        <Flex direction="column" align="center" justify="center" py={10} bg="#161B22" borderRadius="12px" border="1px solid" borderColor="#30363D">
          <Text color="#8B949E" fontSize="sm">未找到匹配的工具</Text>
        </Flex>
      )}
    </PageContainer>
  )
}
