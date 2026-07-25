import { Flex, Text, VStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { Monitor, Zap } from 'lucide-react'

export function TrayMenuPage() {
  const { t } = useTranslation()

  return (
    <Flex
      h="100vh"
      bg="transparent"
      color="#E6EDF3"
      fontFamily="system-ui, sans-serif"
      p={2}
    >
      <VStack
        flex={1}
        bg="#161B22"
        borderRadius="12px"
        border="1px solid"
        borderColor="#30363D"
        overflow="hidden"
        gap={0}
      >
        <Flex
          as="button"
          align="center"
          gap={2}
          px={3}
          py={2.5}
          w="full"
          cursor="pointer"
          _hover={{ bg: 'rgba(255,255,255,0.05)' }}
          borderRadius="8px"
        >
          <Monitor size={16} color="#6C63FF" />
          <Text fontSize="sm">{t('pages.hardware.title')}</Text>
        </Flex>
        <Flex
          as="button"
          align="center"
          gap={2}
          px={3}
          py={2.5}
          w="full"
          cursor="pointer"
          _hover={{ bg: 'rgba(255,255,255,0.05)' }}
          borderRadius="8px"
        >
          <Zap size={16} color="#6C63FF" />
          <Text fontSize="sm">{t('pages.optimize.title')}</Text>
        </Flex>
        <Flex
          as="button"
          align="center"
          justify="center"
          px={3}
          py={2.5}
          w="full"
          cursor="pointer"
          _hover={{ bg: 'rgba(255,255,255,0.05)' }}
          borderRadius="8px"
          mt="auto"
        >
          <Text fontSize="xs" color="#8B949E">
            {t('titleBar.close')}
          </Text>
        </Flex>
      </VStack>
    </Flex>
  )
}
