import { useEffect, useState } from 'react'
import {
  Flex, Text, Button, Box, Input, useToast, Spinner, Wrap, WrapItem,
} from '@chakra-ui/react'
import { PenLine } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/ui/PageContainer'
import { getGpuRenameInfo, renameGpu, restoreGpuName } from '../lib/tools-api'
import type { GpuRenameInfo } from '../types/tools'

const RENAME_TEMPLATES = [
  'NVIDIA GeForce RTX 5090',
  'NVIDIA GeForce RTX 4090 D',
  'NVIDIA GeForce RTX 4080 SUPER',
  'NVIDIA GeForce RTX 4070 Ti SUPER',
  'AMD Radeon RX 7900 XTX',
  '自定义...',
]

export function GpuRenamePage() {
  const { t } = useTranslation()
  const toast = useToast()
  const [gpus, setGpus] = useState<GpuRenameInfo[]>([])
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)

  const load = () => {
    setLoading(true)
    getGpuRenameInfo()
      .then((list) => {
        setGpus(list)
        if (list.length > 0) {
          setSelectedIdx(list[0].gpu_index)
          setNewName(list[0].current_name)
        }
      })
      .catch(() => toast({ title: '加载失败', status: 'error', duration: 3000 }))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const selectedGpu = gpus.find((g) => g.gpu_index === selectedIdx) || gpus[0]

  const handleApply = async () => {
    if (!selectedGpu || !newName.trim()) return
    setApplying(true)
    try {
      await renameGpu(selectedGpu.gpu_index, newName.trim())
      toast({
        title: '改名成功',
        description: '需要重启计算机才能生效',
        status: 'success',
        duration: 5000,
      })
      load()
    } catch (e) {
      toast({ title: '改名失败', description: String(e), status: 'error', duration: 5000 })
    } finally {
      setApplying(false)
    }
  }

  const handleRestore = async () => {
    if (!selectedGpu) return
    setApplying(true)
    try {
      await restoreGpuName(selectedGpu.gpu_index)
      toast({ title: '已恢复原始名称', status: 'success', duration: 3000 })
      load()
    } catch (e) {
      toast({ title: '恢复失败', description: String(e), status: 'error', duration: 3000 })
    } finally {
      setApplying(false)
    }
  }

  const selectGpu = (idx: number) => {
    const gpu = gpus.find((g) => g.gpu_index === idx)
    if (gpu) {
      setSelectedIdx(idx)
      setNewName(gpu.current_name)
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
      <Flex align="center" gap={2} mb={6}>
        <Box as={PenLine} size={20} color="#6C63FF" />
        <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
          GPU 改名
        </Text>
      </Flex>

      {/* Admin warning */}
      <Box bg="rgba(255, 165, 0, 0.1)" border="1px solid" borderColor="rgba(255, 165, 0, 0.3)" borderRadius="8px" p={3} mb={6}>
        <Text fontSize="xs" color="#FFA500">
          ⚠ 此功能需要管理员权限，修改后需重启计算机才能生效
        </Text>
      </Box>

      {/* GPU selector tabs */}
      {gpus.length > 1 && (
        <Wrap mb={4} gap={2}>
          {gpus.map((gpu) => (
            <WrapItem key={gpu.gpu_index}>
              <Button
                size="xs"
                variant={selectedIdx === gpu.gpu_index ? 'solid' : 'outline'}
                bg={selectedIdx === gpu.gpu_index ? '#6C63FF' : 'transparent'}
                color="white"
                borderColor="#30363D"
                borderRadius="6px"
                _hover={{ bg: selectedIdx === gpu.gpu_index ? '#5A52D5' : 'rgba(255,255,255,0.05)' }}
                onClick={() => selectGpu(gpu.gpu_index)}
              >
                GPU {gpu.gpu_index}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
      )}

      {selectedGpu && (
        <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" p={5} mb={6}>
          <Flex direction="column" gap={4}>
            <Box>
              <Text fontSize="xs" color="#636D7D" mb={1}>原始名称</Text>
              <Text fontSize="sm" color="#8B949E">{selectedGpu.original_name}</Text>
            </Box>

            <Box>
              <Text fontSize="xs" color="#636D7D" mb={1}>当前名称</Text>
              <Text fontSize="sm" color="#E6EDF3">{selectedGpu.current_name}</Text>
            </Box>

            <Box>
              <Text fontSize="xs" color="#636D7D" mb={1}>状态</Text>
              <Text fontSize="sm" color={selectedGpu.is_renamed ? '#FFA500' : '#4ECDC4'}>
                {selectedGpu.is_renamed ? '已修改' : '未修改'}
              </Text>
            </Box>

            <Box>
              <Text fontSize="xs" color="#636D7D" mb={1}>新名称</Text>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                bg="#0D1117"
                border="1px solid"
                borderColor="#30363D"
                color="#E6EDF3"
                fontSize="sm"
                borderRadius="8px"
                _focus={{ borderColor: '#6C63FF' }}
                placeholder="输入新的 GPU 名称"
              />
            </Box>

            <Flex gap={3}>
              <Button
                size="sm"
                bg="#6C63FF"
                color="white"
                borderRadius="6px"
                _hover={{ bg: '#5A52D5' }}
                isLoading={applying}
                isDisabled={!newName.trim()}
                onClick={handleApply}
              >
                应用改名
              </Button>
              <Button
                size="sm"
                variant="outline"
                borderColor="#30363D"
                color="#E6EDF3"
                borderRadius="6px"
                _hover={{ bg: 'rgba(255,255,255,0.05)' }}
                isLoading={applying}
                onClick={handleRestore}
              >
                恢复原始名称
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}

      {/* Templates */}
      <Text fontSize="xs" color="#636D7D" fontWeight={600} textTransform="uppercase" letterSpacing="1px" mb={3}>
        常用改名模板
      </Text>

      <Wrap gap={2}>
        {RENAME_TEMPLATES.map((tmpl) => (
          <WrapItem key={tmpl}>
            <Button
              size="xs"
              variant="outline"
              borderColor="#30363D"
              color="#8B949E"
              borderRadius="6px"
              _hover={{ borderColor: '#6C63FF', color: '#E6EDF3' }}
              onClick={() => {
                if (tmpl !== '自定义...') {
                  setNewName(tmpl)
                }
              }}
            >
              {tmpl}
            </Button>
          </WrapItem>
        ))}
      </Wrap>
    </PageContainer>
  )
}
