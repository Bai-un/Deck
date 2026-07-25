import { Flex, Box, IconButton } from '@chakra-ui/react'
import { Minus, Square, X, Monitor } from 'lucide-react'
import { getCurrentWindow } from '../../lib/tauri'
import { useTranslation } from 'react-i18next'

export function TitleBar() {
  const { t } = useTranslation()

  const handleMinimize = () => {
    void getCurrentWindow().minimize()
  }

  const handleMaximize = async () => {
    const win = getCurrentWindow()
    const maximized = await win.isMaximized()
    if (maximized) {
      await win.unmaximize()
    } else {
      await win.maximize()
    }
  }

  const handleClose = () => {
    void getCurrentWindow().close()
  }

  return (
    <Flex
      h="32px"
      bg="#0D1117"
      borderBottom="1px solid"
      borderColor="#30363D"
      align="center"
      flexShrink={0}
      data-tauri-drag-region
    >
      {/* App icon + name */}
      <Flex align="center" gap={2} px={3} data-tauri-drag-region>
        <Monitor size={14} color="#6C63FF" />
        <Box
          as="span"
          fontSize="sm"
          fontWeight="semibold"
          color="#E6EDF3"
          data-tauri-drag-region
        >
          Deck
        </Box>
      </Flex>

      {/* Drag region */}
      <Flex flex={1} h="full" data-tauri-drag-region />

      {/* Window controls */}
      <Flex h="full">
        <IconButton
          aria-label={t('titleBar.minimize')}
          icon={<Minus size={14} />}
          variant="ghost"
          size="sm"
          borderRadius={0}
          h="full"
          w="46px"
          color="#E6EDF3"
          _hover={{ bg: '#21262D' }}
          onClick={handleMinimize}
        />
        <IconButton
          aria-label={t('titleBar.maximize')}
          icon={<Square size={12} />}
          variant="ghost"
          size="sm"
          borderRadius={0}
          h="full"
          w="46px"
          color="#E6EDF3"
          _hover={{ bg: '#21262D' }}
          onClick={handleMaximize}
        />
        <IconButton
          aria-label={t('titleBar.close')}
          icon={<X size={14} />}
          variant="ghost"
          size="sm"
          borderRadius={0}
          h="full"
          w="46px"
          color="#E6EDF3"
          _hover={{ bg: '#FF5555', color: 'white' }}
          onClick={handleClose}
        />
      </Flex>
    </Flex>
  )
}

export default TitleBar
