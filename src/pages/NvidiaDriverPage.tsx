import { useEffect, useState } from 'react'
import { Flex, Text, Button, Box, useToast, Spinner, Link } from '@chakra-ui/react'
import { Download, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/ui/PageContainer'
import { getNvidiaDriverInfo, checkNvidiaDriverUpdate } from '../lib/tools-api'
import type { NvidiaDriverInfo } from '../types/tools'

export function NvidiaDriverPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const [info, setInfo] = useState<NvidiaDriverInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingUpdate, setCheckingUpdate] = useState(false)

  const load = () => {
    setLoading(true)
    getNvidiaDriverInfo()
      .then(setInfo)
      .catch(() => toast({ title: '加载失败', status: 'error', duration: 3000 }))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true)
    try {
      const latest = await checkNvidiaDriverUpdate()
      if (latest) {
        setInfo((prev) => prev ? { ...prev, latest_version: latest, update_available: true } : prev)
        toast({ title: `最新版本: ${latest}`, status: 'success', duration: 5000 })
      } else {
        toast({ title: '无法检查更新（网络错误或无可用更新）', status: 'warning', duration: 3000 })
      }
    } catch (e) {
      toast({ title: '检查更新失败', description: String(e), status: 'error', duration: 3000 })
    } finally {
      setCheckingUpdate(false)
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

  if (!info) {
    return (
      <PageContainer>
        <Flex align="center" gap={2} mb={6}>
          <Box as={Download} size={20} color="#6C63FF" />
          <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
            NVIDIA 驱动管理
          </Text>
        </Flex>
        <Flex direction="column" align="center" justify="center" bg="#161B22" borderRadius="12px" border="1px solid" borderColor="#30363D" p={10} gap={4}>
          <AlertTriangle size={32} color="#FFA500" />
          <Text color="#8B949E" fontSize="sm">未检测到 NVIDIA GPU，此功能不可用</Text>
        </Flex>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Flex align="center" gap={2} mb={6}>
        <Box as={Download} size={20} color="#6C63FF" />
        <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
          NVIDIA 驱动管理
        </Text>
      </Flex>

      <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" p={5} mb={6}>
        <Flex direction="column" gap={4}>
          <Box>
            <Text fontSize="xs" color="#636D7D" mb={1}>GPU 名称</Text>
            <Text fontSize="md" fontWeight={600} color="#E6EDF3">{info.gpu_name}</Text>
          </Box>

          <Flex gap={8} wrap="wrap">
            <Box>
              <Text fontSize="xs" color="#636D7D" mb={1}>已安装版本</Text>
              <Text fontSize="sm" color="#E6EDF3" fontWeight={600}>{info.installed_version}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="#636D7D" mb={1}>发布日期</Text>
              <Text fontSize="sm" color="#E6EDF3">{info.driver_date}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="#636D7D" mb={1}>CUDA 版本</Text>
              <Text fontSize="sm" color="#E6EDF3">{info.cuda_version}</Text>
            </Box>
          </Flex>

          <Box borderTop="1px solid" borderColor="#30363D" pt={4}>
            <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
              <Box>
                <Text fontSize="xs" color="#636D7D" mb={1}>最新版本</Text>
                {info.latest_version ? (
                  <Text fontSize="sm" color={info.update_available ? '#4ECDC4' : '#8B949E'}>
                    {info.latest_version}
                    {info.update_available && (
                      <Text as="span" color="#4ECDC4" ml={2} fontSize="xs">有更新可用</Text>
                    )}
                  </Text>
                ) : (
                  <Text fontSize="sm" color="#8B949E">未检测</Text>
                )}
              </Box>
              <Button
                size="xs"
                variant="outline"
                borderColor="#30363D"
                color="#E6EDF3"
                borderRadius="6px"
                _hover={{ bg: 'rgba(255,255,255,0.05)' }}
                isLoading={checkingUpdate}
                onClick={handleCheckUpdate}
              >
                检查更新
              </Button>
            </Flex>
          </Box>

          <Box>
            <Link
              href="https://www.nvidia.com/Download/index.aspx"
              isExternal
              _hover={{ textDecoration: 'none' }}
            >
              <Button
                size="sm"
                bg="#6C63FF"
                color="white"
                borderRadius="6px"
                _hover={{ bg: '#5A52D5' }}
                rightIcon={<Download size={14} />}
              >
                前往 NVIDIA 官网下载
              </Button>
            </Link>
          </Box>
        </Flex>
      </Box>
    </PageContainer>
  )
}
