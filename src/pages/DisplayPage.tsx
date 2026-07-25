import { Box, Flex, Text, SimpleGrid, Icon } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '../components/ui/PageContainer'
import { Palette, Cpu, Monitor, Layers, PanelRight } from 'lucide-react'

interface CardDef {
  icon: any
  label: string
  path: string
  summary: string
  color: string
}

export function DisplayPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const cards: CardDef[] = [
    {
      icon: Palette,
      label: t('display.filter.title'),
      path: '/display/filter',
      summary: t('display.filter.desc'),
      color: '#6C63FF',
    },
    {
      icon: Cpu,
      label: t('display.dlss.title'),
      path: '/display/dlss',
      summary: t('display.dlss.desc'),
      color: '#4ECDC4',
    },
    {
      icon: Monitor,
      label: t('display.resolution.title'),
      path: '/display/resolution',
      summary: t('display.resolution.desc'),
      color: '#FFA500',
    },
    {
      icon: Layers,
      label: t('display.overlay.title'),
      path: '/display/overlay',
      summary: t('display.overlay.desc'),
      color: '#A66CFF',
    },
    {
      icon: PanelRight,
      label: t('display.vertical.title'),
      path: '/display/vertical',
      summary: t('display.vertical.desc'),
      color: '#FF6B6B',
    },
  ]

  return (
    <PageContainer>
      <Text as="h1" fontSize="xl" fontWeight={700} color="#E6EDF3" mb={1}>
        {t('pages.display.title')}
      </Text>
      <Text color="#8B949E" fontSize="sm" mb={6}>
        {t('pages.display.desc')}
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {cards.map((card) => (
          <Flex
            key={card.path}
            direction="column"
            bg="#161B22"
            border="1px solid"
            borderColor="#30363D"
            borderRadius="12px"
            p={5}
            gap={4}
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              borderColor: '#6C63FF',
              boxShadow: '0 4px 12px rgba(108, 99, 255, 0.1)',
            }}
            onClick={() => navigate(card.path)}
          >
            <Flex align="center" gap={3}>
              <Box
                w="40px"
                h="40px"
                borderRadius="10px"
                bg={`${card.color}20`}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={card.icon} size={20} color={card.color} />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight={600} color="#E6EDF3">
                  {card.label}
                </Text>
                <Text fontSize="xs" color="#8B949E">
                  {card.summary}
                </Text>
              </Box>
            </Flex>
          </Flex>
        ))}
      </SimpleGrid>
    </PageContainer>
  )
}
