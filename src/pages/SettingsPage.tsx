import { useState, useRef } from 'react'
import {
  Flex, Heading, Text, VStack, HStack, Switch, Box, RadioGroup, Radio, Button,
  useToast,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '../components/ui/PageContainer'
import { AboutModal } from '../components/AboutModal'
import { useSettingsStore, ACCENT_COLORS } from '../stores/useSettingsStore'

export function SettingsPage() {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const [aboutOpen, setAboutOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const cancelRef = useRef(null)
  const {
    language,
    accentColor,
    autoStart,
    minimizeToTray,
    setLanguage,
    setAccentColor,
    setAutoStart,
    setMinimizeToTray,
  } = useSettingsStore()

  const handleLanguageChange = (value: string) => {
    const lang = value as 'zh-CN' | 'en'
    setLanguage(lang)
    void i18n.changeLanguage(lang)
  }

  const handleCheckUpdate = () => {
    // In production, this would call check() from @tauri-apps/plugin-updater
    toast({ title: '已是最新版本', status: 'info', duration: 3000 })
  }

  const handleReset = () => {
    setLanguage('zh-CN')
    setAccentColor(ACCENT_COLORS[0])
    setAutoStart(false)
    setMinimizeToTray(true)
    void i18n.changeLanguage('zh-CN')
    setResetOpen(false)
    toast({ title: '所有设置已重置', status: 'success', duration: 2000 })
  }

  return (
    <PageContainer>
      <Heading as="h1" size="lg" mb={6}>
        {t('settings.title')}
      </Heading>

      <VStack gap={6} align="stretch" maxW="600px">
        {/* General */}
        <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" p={5}>
          <Text fontSize="sm" fontWeight={600} color="#E6EDF3" mb={4}>
            {t('settings.general')}
          </Text>
          <VStack gap={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" color="#E6EDF3">{t('settings.language')}</Text>
              <RadioGroup value={language} onChange={handleLanguageChange} colorScheme="brand">
                <HStack gap={3}>
                  <Radio value="zh-CN" size="sm"><Text fontSize="sm">中文</Text></Radio>
                  <Radio value="en" size="sm"><Text fontSize="sm">English</Text></Radio>
                </HStack>
              </RadioGroup>
            </Flex>

            <Flex justify="space-between" align="center">
              <Text fontSize="sm" color="#E6EDF3">{t('settings.accentColor')}</Text>
              <HStack gap={2}>
                {ACCENT_COLORS.map((color) => (
                  <Box
                    key={color}
                    w="24px" h="24px" borderRadius="full" bg={color}
                    cursor="pointer"
                    border={accentColor === color ? '2px solid white' : '2px solid transparent'}
                    transition="all 0.15s"
                    _hover={{ transform: 'scale(1.15)' }}
                    onClick={() => setAccentColor(color)}
                  />
                ))}
              </HStack>
            </Flex>
          </VStack>
        </Box>

        {/* System */}
        <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" p={5}>
          <Text fontSize="sm" fontWeight={600} color="#E6EDF3" mb={4}>
            System
          </Text>
          <VStack gap={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" color="#E6EDF3">{t('settings.autoStart')}</Text>
              <Switch
                isChecked={autoStart}
                onChange={(e) => setAutoStart(e.target.checked)}
                sx={{ 'span.chakra-switch__track[data-checked]': { bg: '#6C63FF' } }}
              />
            </Flex>
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" color="#E6EDF3">{t('settings.minimizeToTray')}</Text>
              <Switch
                isChecked={minimizeToTray}
                onChange={(e) => setMinimizeToTray(e.target.checked)}
                sx={{ 'span.chakra-switch__track[data-checked]': { bg: '#6C63FF' } }}
              />
            </Flex>
          </VStack>
        </Box>

        {/* Update */}
        <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" p={5}>
          <Text fontSize="sm" fontWeight={600} color="#E6EDF3" mb={4}>
            更新
          </Text>
          <VStack gap={3} align="stretch">
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" color="#E6EDF3">当前版本</Text>
              <Text fontSize="sm" color="#8B949E">0.1.0</Text>
            </Flex>
            <Button
              size="sm"
              variant="outline"
              borderColor="#30363D"
              color="#E6EDF3"
              borderRadius="6px"
              _hover={{ bg: 'rgba(255,255,255,0.05)' }}
              onClick={handleCheckUpdate}
            >
              检查更新
            </Button>
          </VStack>
        </Box>

        {/* Advanced */}
        <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" p={5}>
          <Text fontSize="sm" fontWeight={600} color="#E6EDF3" mb={4}>
            高级
          </Text>
          <VStack gap={3} align="stretch">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color="#E6EDF3">以管理员运行</Text>
                <Text fontSize="xs" color="#636D7D">部分功能需要管理员权限</Text>
              </Box>
            </Flex>
            <Button
              size="sm"
              variant="outline"
              borderColor="#FF5555"
              color="#FF5555"
              borderRadius="6px"
              _hover={{ bg: 'rgba(255,85,85,0.1)' }}
              onClick={() => setResetOpen(true)}
            >
              重置所有设置
            </Button>
          </VStack>
        </Box>

        {/* About */}
        <Box bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="12px" p={5}>
          <Button
            size="sm"
            variant="outline"
            borderColor="#30363D"
            color="#E6EDF3"
            borderRadius="6px"
            _hover={{ bg: 'rgba(255,255,255,0.05)' }}
            onClick={() => setAboutOpen(true)}
          >
            关于 Deck
          </Button>
        </Box>
      </VStack>

      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} appVersion="0.1.0" />

      {/* Reset confirmation */}
      <AlertDialog isOpen={resetOpen} onClose={() => setResetOpen(false)} leastDestructiveRef={cancelRef} isCentered>
        <AlertDialogOverlay bg="rgba(0,0,0,0.6)">
          <AlertDialogContent bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="16px">
            <AlertDialogHeader color="#E6EDF3" fontSize="sm" fontWeight={600}>确定要重置所有设置到默认值吗？</AlertDialogHeader>
            <AlertDialogBody>
              <Text fontSize="sm" color="#8B949E">此操作不可撤销。</Text>
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <Button
                size="sm" variant="ghost" color="#8B949E"
                onClick={() => setResetOpen(false)}
              >
                取消
              </Button>
              <Button
                size="sm" bg="#FF5555" color="white" borderRadius="6px"
                _hover={{ bg: '#CC0000' }}
                onClick={handleReset}
              >
                确认重置
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </PageContainer>
  )
}
