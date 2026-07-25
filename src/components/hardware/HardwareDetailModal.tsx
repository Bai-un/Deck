import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Flex,
  Text,
  Divider,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { formatBytes } from '../../lib/format'
import type { SystemInfo } from '../../types/hardware'

interface HardwareDetailModalProps {
  isOpen: boolean
  onClose: () => void
  info: SystemInfo | null
}

export function HardwareDetailModal({ isOpen, onClose, info }: HardwareDetailModalProps) {
  const { t } = useTranslation()

  if (!info) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" scrollBehavior="inside">
      <ModalOverlay bg="rgba(0,0,0,0.6)" />
      <ModalContent bg="#161B22" border="1px solid" borderColor="#30363D" color="#E6EDF3">
        <ModalHeader fontSize="md">{t('hardware.detail')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack gap={4} align="stretch">
            {/* System */}
            <Section title={t('hardware.system')}>
              <Row label={`${t('hardware.os')}:`} value={info.os_name} />
              <Row label={`${t('hardware.osVersion')}:`} value={info.os_version} />
              <Row label={`${t('hardware.hostname')}:`} value={info.hostname} />
            </Section>

            {/* CPU */}
            <Section title={t('hardware.cpu')}>
              <Row label={`${t('hardware.brand')}:`} value={info.cpu.brand} />
              <Row label={`${t('hardware.vendor')}:`} value={info.cpu.vendor} />
              <Row
                label={`${t('hardware.coreCount')}:`}
                value={`${info.cpu.core_count}`}
              />
              <Row
                label={`${t('hardware.threadCount')}:`}
                value={`${info.cpu.thread_count}`}
              />
              <Row
                label={`${t('hardware.frequency')}:`}
                value={info.cpu.base_frequency_mhz > 0 ? `${info.cpu.base_frequency_mhz} MHz` : '-'}
              />
            </Section>

            {/* GPU */}
            <Section title={t('hardware.gpu')}>
              {info.gpus.length === 0 ? (
                <Text fontSize="sm" color="#8B949E">
                  {t('hardware.monitorUnavailable')}
                </Text>
              ) : (
                info.gpus.map((gpu, i) => (
                  <VStack key={i} align="stretch" gap={1} pl={2} borderLeft="2px solid #30363D">
                    <Row label={`${t('hardware.brand')}:`} value={gpu.name} />
                    <Row label={`${t('hardware.vendor')}:`} value={gpu.vendor} />
                    <Row
                      label={`${t('hardware.vram')}:`}
                      value={`${gpu.vram_total_mb} MB`}
                    />
                    <Row label={`${t('hardware.driver')}:`} value={gpu.driver_version} />
                  </VStack>
                ))
              )}
            </Section>

            {/* Memory */}
            <Section title={`${t('hardware.memory')}: ${formatBytes(info.total_memory_bytes)}`} />

            {/* Disks */}
            <Section title={t('hardware.disk')}>
              {info.disks.map((d, i) => (
                <Row
                  key={i}
                  label={`${d.name} (${d.mount_point}):`}
                  value={`${formatBytes(d.total_bytes)} ${d.disk_type}${d.is_removable ? ` (${t('hardware.removable')})` : ''}`}
                />
              ))}
            </Section>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <>
      <Divider borderColor="#30363D" />
      <Text fontSize="sm" fontWeight={700} color="#6C63FF">
        {title}
      </Text>
      {children && <VStack gap={1.5} align="stretch" pl={2}>{children}</VStack>}
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Flex justify="space-between" align="center">
      <Text fontSize="sm" color="#8B949E">
        {label}
      </Text>
      <Text fontSize="sm" color="#E6EDF3">
        {value}
      </Text>
    </Flex>
  )
}
