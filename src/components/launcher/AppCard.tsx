import { useState } from 'react'
import {
  Flex,
  Text,
  Image,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  Box,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react'
import { MoreHorizontal, Trash2, Pencil, FolderOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLauncherStore } from '../../stores/useLauncherStore'
import { openFileLocation } from '../../lib/launcher-api'
import type { LauncherItem } from '../../types/launcher'

interface AppCardProps {
  item: LauncherItem
}

export function AppCard({ item }: AppCardProps) {
  const { t } = useTranslation()
  const { removeItem, renameItem, launchItem } = useLauncherStore()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(item.name)
  const [error, setError] = useState<string | null>(null)

  const handleLaunch = async () => {
    try {
      await launchItem(item.exe_path)
    } catch (err) {
      setError(t('launcher.launchFailed'))
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleRename = async () => {
    const trimmed = renameValue.trim()
    if (!trimmed || trimmed === item.name) {
      setRenaming(false)
      return
    }
    try {
      await renameItem(item.id, trimmed)
      setRenaming(false)
    } catch (err) {
      // error handled in store
    }
  }

  const handleDelete = async () => {
    try {
      await removeItem(item.id)
      onDeleteClose()
    } catch (err) {
      // error handled in store
    }
  }

  const handleOpenLocation = async () => {
    try {
      await openFileLocation(item.exe_path)
    } catch (err) {
      // ignore
    }
  }

  return (
    <>
      <Flex
        direction="column"
        align="center"
        bg="#161B22"
        border="1px solid"
        borderColor="#30363D"
        borderRadius="12px"
        p={4}
        gap={3}
        transition="all 0.15s"
        _hover={{
          borderColor: '#6C63FF',
          boxShadow: '0 4px 12px rgba(108, 99, 255, 0.1)',
        }}
        position="relative"
      >
        {/* Three-dot menu */}
        <Box position="absolute" top={2} right={2}>
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<MoreHorizontal size={14} />}
              variant="ghost"
              size="xs"
              color="#8B949E"
              _hover={{ color: '#E6EDF3', bg: 'rgba(255,255,255,0.05)' }}
              aria-label="More"
            />
            <MenuList
              bg="#161B22"
              border="1px solid"
              borderColor="#30363D"
              minW="140px"
              p={1}
            >
              <MenuItem
                icon={<Pencil size={14} />}
                bg="transparent"
                color="#E6EDF3"
                _hover={{ bg: 'rgba(255,255,255,0.05)' }}
                fontSize="sm"
                onClick={() => {
                  setRenameValue(item.name)
                  setRenaming(true)
                }}
              >
                {t('launcher.rename')}
              </MenuItem>
              <MenuItem
                icon={<FolderOpen size={14} />}
                bg="transparent"
                color="#E6EDF3"
                _hover={{ bg: 'rgba(255,255,255,0.05)' }}
                fontSize="sm"
                onClick={handleOpenLocation}
              >
                {t('launcher.openLocation')}
              </MenuItem>
              <MenuItem
                icon={<Trash2 size={14} />}
                bg="transparent"
                color="#FF5555"
                _hover={{ bg: 'rgba(255,85,85,0.1)' }}
                fontSize="sm"
                onClick={onDeleteOpen}
              >
                {t('launcher.remove')}
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>

        {/* Icon */}
        <Image
          src={`data:image/png;base64,${item.icon_base64}`}
          alt={item.name}
          w="64px"
          h="64px"
          objectFit="contain"
          mt={5}
        />

        {/* Name */}
        {renaming ? (
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') setRenaming(false)
            }}
            size="sm"
            textAlign="center"
            bg="#0D1117"
            border="1px solid"
            borderColor="#30363D"
            color="#E6EDF3"
            fontSize="xs"
            borderRadius="6px"
            autoFocus
            px={2}
            py={1}
            _focus={{ borderColor: '#6C63FF' }}
          />
        ) : (
          <Text
            fontSize="xs"
            color="#E6EDF3"
            fontWeight={500}
            textAlign="center"
            noOfLines={2}
            lineHeight="1.3"
            minH="2.6em"
          >
            {item.name}
          </Text>
        )}

        {/* Launch button */}
        <Button
          w="full"
          size="sm"
          bg="#6C63FF"
          color="white"
          borderRadius="8px"
          fontSize="xs"
          fontWeight={600}
          _hover={{ bg: '#5A52D5' }}
          _active={{ bg: '#4A42C0' }}
          onClick={handleLaunch}
        >
          {t('launcher.launch')}
        </Button>

        {/* Error toast */}
        {error && (
          <Text position="absolute" bottom={-6} fontSize="10px" color="#FF5555">
            {error}
          </Text>
        )}
      </Flex>

      {/* Delete confirmation modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered size="sm">
        <ModalOverlay bg="rgba(0,0,0,0.6)" />
        <ModalContent bg="#161B22" border="1px solid" borderColor="#30363D" color="#E6EDF3">
          <ModalHeader fontSize="md">{t('launcher.confirmDelete')}</ModalHeader>
          <ModalBody>
            <Text fontSize="sm" color="#8B949E">
              &quot;{item.name}&quot;
            </Text>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button
              variant="ghost"
              size="sm"
              color="#8B949E"
              _hover={{ color: '#E6EDF3', bg: 'rgba(255,255,255,0.05)' }}
              onClick={onDeleteClose}
            >
              {t('common.cancel')}
            </Button>
            <Button
              size="sm"
              bg="#FF5555"
              color="white"
              _hover={{ bg: '#E04444' }}
              onClick={handleDelete}
            >
              {t('launcher.remove')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
