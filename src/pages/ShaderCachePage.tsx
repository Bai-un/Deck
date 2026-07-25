import { useEffect } from 'react'
import {
  Flex,
  Text,
  Button,
  Box,
  Checkbox,
  Divider,
  Spinner,
} from '@chakra-ui/react'
import { Cpu, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/ui/PageContainer'
import { useCleanupStore } from '../stores/useCleanupStore'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const idx = Math.min(i, units.length - 1)
  return `${(bytes / Math.pow(1024, idx)).toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`
}

export function ShaderCachePage() {
  const { t } = useTranslation()
  const {
    shaderCaches,
    selectedVendorIds,
    cleaningShader,
    shaderCleanResult,
    fetchShaderCaches,
    toggleVendor,
    cleanShaderCache,
  } = useCleanupStore()

  useEffect(() => {
    fetchShaderCaches()
  }, [fetchShaderCaches])

  const totalSize = shaderCaches.reduce((sum, c) => sum + c.size_bytes, 0)
  useCleanupStore // silence unused check for allSelected logic

  return (
    <PageContainer>
      <Flex align="center" gap={2} mb={6}>
        <Box as={Cpu} size={20} color="#6C63FF" />
        <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
          {t('cleanup.shader.title')}
        </Text>
      </Flex>

      {/* Loading */}
      {shaderCaches.length === 0 && !shaderCleanResult && (
        <Flex direction="column" align="center" justify="center" py={20} gap={4}>
          <Spinner size="xl" color="#6C63FF" />
          <Text color="#8B949E" fontSize="sm">
            {t('common.loading')}
          </Text>
        </Flex>
      )}

      {/* Cache list */}
      {shaderCaches.length > 0 && (
        <Box
          bg="#161B22"
          border="1px solid"
          borderColor="#30363D"
          borderRadius="12px"
          mb={4}
          overflow="hidden"
        >
          {shaderCaches.map((entry, i) => (
            <Box key={entry.gpu_vendor + entry.cache_path}>
              {i > 0 && <Divider borderColor="#30363D" />}
              <Flex
                align="center"
                gap={3}
                py={3}
                px={4}
                cursor="pointer"
                _hover={{ bg: 'rgba(255,255,255,0.02)' }}
              >
                <Checkbox
                  isChecked={selectedVendorIds.includes(entry.gpu_vendor)}
                  onChange={() => toggleVendor(entry.gpu_vendor)}
                  borderColor="#8B949E"
                  colorScheme="purple"
                />
                <Flex flex={1} direction="column">
                  <Text fontSize="sm" color="#E6EDF3" fontWeight={500}>
                    {entry.description}
                  </Text>
                  <Text fontSize="11px" color="#636D7D" fontFamily="monospace">
                    {entry.cache_path}
                  </Text>
                </Flex>
                <Text fontSize="sm" color="#E6EDF3" fontWeight={600}>
                  {formatBytes(entry.size_bytes)}
                </Text>
              </Flex>
            </Box>
          ))}
        </Box>
      )}

      {/* Total */}
      {shaderCaches.length > 0 && (
        <Flex justify="space-between" align="center" mb={4} px={4}>
          <Text fontSize="sm" color="#8B949E">
            {t('cleanup.shader.totalCache')}: {formatBytes(totalSize)}
          </Text>
        </Flex>
      )}

      {/* Clean result */}
      {shaderCleanResult && (
        <Box
          bg="#161B22"
          border="1px solid"
          borderColor="#30363D"
          borderRadius="12px"
          p={5}
          mb={4}
        >
          <Text fontSize="sm" color="#4ECDC4" fontWeight={600} mb={2}>
            {t('cleanup.shader.cleanResult', { size: formatBytes(shaderCleanResult.freed_bytes) })}
          </Text>
          {shaderCleanResult.cleaned_entries.length > 0 && (
            <Text fontSize="xs" color="#8B949E">
              已清理: {shaderCleanResult.cleaned_entries.join(', ')}
            </Text>
          )}
          {shaderCleanResult.failed_entries.length > 0 && (
            <Text fontSize="xs" color="#FF5555">
              失败: {shaderCleanResult.failed_entries.join(', ')}
            </Text>
          )}
        </Box>
      )}

      {/* Actions */}
      {shaderCaches.length > 0 && (
        <Flex gap={3} mb={4}>
          <Button
            size="sm"
            bg="#6C63FF"
            color="white"
            borderRadius="8px"
            _hover={{ bg: '#5A52D5' }}
            isLoading={cleaningShader}
            onClick={() => {
              // Select all then clean
              useCleanupStore.getState().selectAllVendors()
              setTimeout(() => cleanShaderCache(), 50)
            }}
          >
            {t('cleanup.shader.cleanAll')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            borderColor="#30363D"
            color="#E6EDF3"
            borderRadius="8px"
            _hover={{ bg: 'rgba(255,255,255,0.05)' }}
            isDisabled={selectedVendorIds.length === 0}
            isLoading={cleaningShader}
            onClick={cleanShaderCache}
          >
            {t('cleanup.shader.cleanSelected')} ({selectedVendorIds.length})
          </Button>
        </Flex>
      )}

      {/* Warning */}
      <Flex
        align="center"
        gap={2}
        bg="rgba(255, 165, 0, 0.1)"
        border="1px solid"
        borderColor="rgba(255, 165, 0, 0.3)"
        borderRadius="8px"
        p={3}
      >
        <AlertTriangle size={16} color="#FFA500" />
        <Text fontSize="xs" color="#FFA500">
          {t('cleanup.shader.warning')}
        </Text>
      </Flex>
    </PageContainer>
  )
}
