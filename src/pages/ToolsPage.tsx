import { useNavigate } from 'react-router-dom'
import { Box, SimpleGrid, Flex, Text } from '@chakra-ui/react'
import { HardDrive, PenLine, Download, Terminal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/ui/PageContainer'
const toolCards = [
  {
    icon: HardDrive,
    label: '磁盘健康',
    desc: 'S.M.A.R.T. 磁盘健康检测与属性查看',
    path: '/tools/disk-health',
    color: '#4ECDC4',
  },
  {
    icon: PenLine,
    label: 'GPU 改名',
    desc: '自定义显卡显示名称',
    path: '/tools/gpu-rename',
    color: '#FFA500',
  },
  {
    icon: Download,
    label: 'NVIDIA 驱动管理',
    desc: '驱动版本查看与更新检查',
    path: '/tools/nvidia-driver',
    color: '#6C63FF',
  },
  {
    icon: Terminal,
    label: '系统工具',
    desc: '任务管理器、设备管理器等快捷入口',
    path: '/tools/builtin',
    color: '#FF5555',
  },
]

export function ToolsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <PageContainer>
      <Flex align="center" gap={2} mb={6}>
        <Terminal size={20} color="#6C63FF" />
        <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
          {t('pages.tools.title')}
        </Text>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        {toolCards.map((card) => (
          <Flex
            key={card.path}
            direction="column"
            bg="#161B22"
            border="1px solid"
            borderColor="#30363D"
            borderRadius="12px"
            p={5}
            gap={3}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ borderColor: card.color, boxShadow: `0 4px 12px rgba(0,0,0,0.3)` }}
            onClick={() => navigate(card.path)}
          >
            <Flex align="center" gap={2}>
              <Box as={card.icon} size={20} color={card.color} />
              <Text fontSize="sm" fontWeight={600} color="#E6EDF3">
                {card.label}
              </Text>
            </Flex>
            <Text fontSize="xs" color="#636D7D">
              {card.desc}
            </Text>
          </Flex>
        ))}
      </SimpleGrid>
    </PageContainer>
  )
}
