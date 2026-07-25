import { useEffect, useState } from 'react'
import {
  Flex,
  Text,
  Button,
  Box,
  Divider,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react'
import { HardDrive, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/ui/PageContainer'
import { ScanCategoryRow } from '../components/cleanup/ScanCategoryRow'
import { useCleanupStore } from '../stores/useCleanupStore'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const idx = Math.min(i, units.length - 1)
  return `${(bytes / Math.pow(1024, idx)).toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`
}

export function StorageCleanPage() {
  const { t } = useTranslation()
  const {
    scanResult,
    scanning,
    selectedCategoryIds,
    cleaningStorage,
    storageCleanResult,
    scanStorage,
    toggleCategory,
    cleanStorage,
  } = useCleanupStore()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [initialScanDone, setInitialScanDone] = useState(false)

  useEffect(() => {
    if (!initialScanDone) {
      scanStorage()
      setInitialScanDone(true)
    }
  }, [scanStorage, initialScanDone])

  const selectedSize = scanResult?.categories
    .filter((c) => selectedCategoryIds.includes(c.id))
    .reduce((sum, c) => sum + c.size_bytes, 0) ?? 0

  const handleClean = async () => {
    onClose()
    await cleanStorage()
  }

  return (
    <PageContainer>
      <Flex justify="space-between" align="center" mb={6}>
        <Flex align="center" gap={2}>
          <Box as={HardDrive} size={20} color="#6C63FF" />
          <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
            {t('cleanup.storage.title')}
          </Text>
        </Flex>
        <Button
          size="sm"
          bg="#6C63FF"
          color="white"
          borderRadius="8px"
          _hover={{ bg: '#5A52D5' }}
          isLoading={scanning}
          loadingText={t('cleanup.storage.scanning')}
          onClick={scanStorage}
        >
          {t('cleanup.storage.scan')}
        </Button>
      </Flex>

      {/* Scanning state */}
      {scanning && (
        <Flex direction="column" align="center" justify="center" py={20} gap={4}>
          <Spinner size="xl" color="#6C63FF" />
          <Text color="#8B949E" fontSize="sm">
            {t('cleanup.storage.scanning')}
          </Text>
        </Flex>
      )}

      {/* Results */}
      {!scanning && scanResult && (
        <>
          {/* Summary */}
          <Flex justify="space-between" align="center" mb={4} px={4}>
            <Text fontSize="sm" color="#E6EDF3" fontWeight={600}>
              {t('cleanup.storage.scanResult')}
            </Text>
            <Text fontSize="sm" color="#E6EDF3" fontWeight={600}>
              {t('cleanup.storage.totalSize')}: {formatBytes(scanResult.total_size_bytes)}
            </Text>
          </Flex>

          {/* Category list */}
          <Box
            bg="#161B22"
            border="1px solid"
            borderColor="#30363D"
            borderRadius="12px"
            mb={6}
            overflow="hidden"
          >
            {scanResult.categories.map((cat, i) => (
              <Box key={cat.id}>
                {i > 0 && <Divider borderColor="#30363D" />}
                <ScanCategoryRow
                  category={cat}
                  checked={selectedCategoryIds.includes(cat.id)}
                  onChange={toggleCategory}
                />
              </Box>
            ))}
          </Box>

          {/* Storage clean result */}
          {storageCleanResult && (
            <Box
              bg="#161B22"
              border="1px solid"
              borderColor="#30363D"
              borderRadius="12px"
              p={5}
              mb={6}
            >
              <Text fontSize="sm" color="#4ECDC4" fontWeight={600} mb={2}>
                {t('cleanup.storage.cleanResult', {
                  size: formatBytes(storageCleanResult.freed_bytes),
                  count: storageCleanResult.freed_file_count,
                })}
              </Text>
              {storageCleanResult.failed_items.length > 0 && (
                <Text fontSize="xs" color="#8B949E">
                  {t('cleanup.storage.skippedFiles', {
                    count: storageCleanResult.failed_items.length,
                  })}
                </Text>
              )}
            </Box>
          )}

          {/* Bottom action */}
          <Flex align="center" justify="space-between">
            <Text fontSize="sm" color="#8B949E">
              {t('cleanup.storage.selected')}: {formatBytes(selectedSize)}
            </Text>
            <Button
              size="sm"
              bg="#6C63FF"
              color="white"
              borderRadius="8px"
              _hover={{ bg: '#5A52D5' }}
              isDisabled={selectedCategoryIds.length === 0}
              isLoading={cleaningStorage}
              onClick={onOpen}
            >
              {t('cleanup.storage.cleanSelected')}
            </Button>
          </Flex>
        </>
      )}

      {/* Confirm dialog */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
        <ModalOverlay bg="rgba(0,0,0,0.6)" />
        <ModalContent bg="#161B22" border="1px solid" borderColor="#30363D" color="#E6EDF3">
          <ModalHeader fontSize="md">{t('cleanup.storage.confirmClean', { size: formatBytes(selectedSize) })}</ModalHeader>
          <ModalBody>
            <Flex align="center" gap={2}>
              <AlertTriangle size={16} color="#FFA500" />
              <Text fontSize="sm" color="#8B949E">
                此操作将永久删除选中的文件
              </Text>
            </Flex>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button
              variant="ghost"
              size="sm"
              color="#8B949E"
              _hover={{ color: '#E6EDF3', bg: 'rgba(255,255,255,0.05)' }}
              onClick={onClose}
            >
              {t('common.cancel')}
            </Button>
            <Button
              size="sm"
              bg="#FF5555"
              color="white"
              _hover={{ bg: '#E04444' }}
              onClick={handleClean}
            >
              {t('cleanup.storage.cleanSelected')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageContainer>
  )
}
