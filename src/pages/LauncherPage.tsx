import { useEffect, useState } from 'react'
import {
  Flex,
  Text,
  Button,
  SimpleGrid,
  Box,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  ModalFooter,
} from '@chakra-ui/react'
import { Rocket, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/ui/PageContainer'
import { AppCard } from '../components/launcher/AppCard'
import { useLauncherStore } from '../stores/useLauncherStore'
import { open } from '@tauri-apps/plugin-dialog'

export function LauncherPage() {
  const { t } = useTranslation()
  const { items, loading, fetchItems, addItem } = useLauncherStore()
  const { isOpen: isNameOpen, onOpen: onNameOpen, onClose: onNameClose } = useDisclosure()
  const [pendingPath, setPendingPath] = useState<string | null>(null)
  const [customName, setCustomName] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handlePickExe = async () => {
    try {
      const selected = await open({
        title: t('launcher.selectExe'),
        filters: [{ name: 'Executable', extensions: ['exe'] }],
        multiple: false,
      })
      if (!selected) return

      setPendingPath(selected)
      setCustomName('')
      onNameOpen()
    } catch (err) {
      console.error('File picker failed:', err)
    }
  }

  const handleAddWithName = async () => {
    if (!pendingPath) return
    setAdding(true)
    try {
      await addItem(pendingPath, customName.trim() || undefined)
      onNameClose()
      setPendingPath(null)
      setCustomName('')
    } catch (err) {
      // error handled in store
    } finally {
      setAdding(false)
    }
  }

  // Sort items by sort_order
  const sortedItems = [...items].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <PageContainer>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Flex align="center" gap={2} mb={1}>
            <Icon as={Rocket} size={20} color="#6C63FF" />
            <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3">
              {t('launcher.title')}
            </Text>
          </Flex>
        </Box>
        <Button
          leftIcon={<Plus size={16} />}
          size="sm"
          bg="#6C63FF"
          color="white"
          borderRadius="8px"
          _hover={{ bg: '#5A52D5' }}
          onClick={handlePickExe}
        >
          {t('launcher.addApp')}
        </Button>
      </Flex>

      {/* Empty state */}
      {!loading && sortedItems.length === 0 && (
        <Flex
          direction="column"
          align="center"
          justify="center"
          py={20}
          gap={4}
          color="#8B949E"
        >
          <Icon as={Rocket} size={48} strokeWidth={1} />
          <Text fontSize="md" fontWeight={600} color="#E6EDF3">
            {t('launcher.emptyTitle')}
          </Text>
          <Text fontSize="sm" mb={2}>
            {t('launcher.emptyDesc')}
          </Text>
          <Button
            leftIcon={<Plus size={16} />}
            size="sm"
            bg="#6C63FF"
            color="white"
            borderRadius="8px"
            _hover={{ bg: '#5A52D5' }}
            onClick={handlePickExe}
          >
            {t('launcher.addApp')}
          </Button>
        </Flex>
      )}

      {/* Card grid */}
      {sortedItems.length > 0 && (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} gap={4}>
          {sortedItems.map((item) => (
            <AppCard key={item.id} item={item} />
          ))}
          {/* Add card */}
          <Flex
            direction="column"
            align="center"
            justify="center"
            bg="#161B22"
            border="2px dashed"
            borderColor="#30363D"
            borderRadius="12px"
            p={4}
            cursor="pointer"
            transition="all 0.15s"
            minH="195px"
            _hover={{
              borderColor: '#6C63FF',
              bg: 'rgba(108, 99, 255, 0.05)',
            }}
            onClick={handlePickExe}
          >
            <Icon as={Plus} size={32} color="#8B949E" />
            <Text fontSize="xs" color="#8B949E" mt={2}>
              {t('launcher.addApp')}
            </Text>
          </Flex>
        </SimpleGrid>
      )}

      {/* Loading state */}
      {loading && sortedItems.length === 0 && (
        <Flex align="center" justify="center" py={20}>
          <Text color="#8B949E" fontSize="sm">
            {t('common.loading')}
          </Text>
        </Flex>
      )}

      {/* Name input modal */}
      <Modal isOpen={isNameOpen} onClose={onNameClose} isCentered size="sm">
        <ModalOverlay bg="rgba(0,0,0,0.6)" />
        <ModalContent bg="#161B22" border="1px solid" borderColor="#30363D" color="#E6EDF3">
          <ModalHeader fontSize="md">{t('launcher.customName')}</ModalHeader>
          <ModalBody>
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={pendingPath ? pendingPath.split('\\').pop()?.replace('.exe', '') : ''}
              bg="#0D1117"
              border="1px solid"
              borderColor="#30363D"
              color="#E6EDF3"
              _focus={{ borderColor: '#6C63FF' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddWithName()
              }}
              autoFocus
            />
          </ModalBody>
          <ModalFooter gap={2}>
            <Button
              variant="ghost"
              size="sm"
              color="#8B949E"
              _hover={{ color: '#E6EDF3', bg: 'rgba(255,255,255,0.05)' }}
              onClick={onNameClose}
            >
              {t('common.cancel')}
            </Button>
            <Button
              size="sm"
              bg="#6C63FF"
              color="white"
              _hover={{ bg: '#5A52D5' }}
              onClick={handleAddWithName}
              isLoading={adding}
            >
              {t('common.save')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageContainer>
  )
}
