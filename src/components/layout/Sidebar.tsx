import { VStack, Flex, Text, IconButton, Tooltip, Box } from '@chakra-ui/react'
import {
  Home,
  Cpu,
  Rocket,
  Zap,
  Monitor,
  Wrench,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '../../stores/useAppStore'
import type { LucideIcon } from 'lucide-react'

interface NavItemConfig {
  labelKey: string
  path: string
  icon: LucideIcon
}

const navItems: NavItemConfig[] = [
  { labelKey: 'nav.home', path: '/', icon: Home },
  { labelKey: 'nav.launcher', path: '/launcher', icon: Rocket },
  { labelKey: 'nav.hardware', path: '/hardware', icon: Cpu },
  { labelKey: 'nav.optimize', path: '/optimize', icon: Zap },
  { labelKey: 'nav.display', path: '/display', icon: Monitor },
  { labelKey: 'nav.tools', path: '/tools', icon: Wrench },
]

const SIDEBAR_WIDTH = 200
const SIDEBAR_COLLAPSED_WIDTH = 60

export function Sidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggle = useAppStore((s) => s.toggleSidebar)

  return (
    <Flex
      as="nav"
      direction="column"
      w={collapsed ? `${SIDEBAR_COLLAPSED_WIDTH}px` : `${SIDEBAR_WIDTH}px`}
      h="full"
      bg="#161B22"
      borderRight="1px solid"
      borderColor="#30363D"
      transition="width 0.2s"
      overflow="hidden"
      flexShrink={0}
    >
      {/* Navigation */}
      <VStack flex={1} gap={1} py={3} px={collapsed ? 2 : 3} align="stretch">
        {navItems.map((item) => {
          const isActive =
            item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
          const Icon = item.icon
          const btn = (
            <Flex
              as="button"
              align="center"
              gap={3}
              px={3}
              py={2.5}
              borderRadius="8px"
              bg={isActive ? 'rgba(108, 99, 255, 0.15)' : 'transparent'}
              color={isActive ? '#6C63FF' : '#8B949E'}
              cursor="pointer"
              transition="all 0.15s"
              _hover={{
                bg: isActive ? 'rgba(108, 99, 255, 0.2)' : 'rgba(255,255,255,0.05)',
                color: isActive ? '#6C63FF' : '#E6EDF3',
              }}
              justifyContent={collapsed ? 'center' : 'flex-start'}
              onClick={() => navigate(item.path)}
              title={t(item.labelKey)}
            >
              <Icon size={20} strokeWidth={1.5} />
              {!collapsed && (
                <Text fontSize="sm" fontWeight={isActive ? 600 : 400}>
                  {t(item.labelKey)}
                </Text>
              )}
            </Flex>
          )

          return collapsed ? (
            <Tooltip key={item.path} label={t(item.labelKey)} placement="right" hasArrow>
              <Box>{btn}</Box>
            </Tooltip>
          ) : (
            <Box key={item.path}>{btn}</Box>
          )
        })}
      </VStack>

      {/* Settings + collapse */}
      <Box borderTop="1px solid" borderColor="#30363D" px={collapsed ? 2 : 3} py={2}>
        {/* Settings */}
        <Flex
          as="button"
          align="center"
          gap={3}
          px={3}
          py={2.5}
          borderRadius="8px"
          color={location.pathname === '/settings' ? '#6C63FF' : '#8B949E'}
          bg={location.pathname === '/settings' ? 'rgba(108, 99, 255, 0.15)' : 'transparent'}
          cursor="pointer"
          transition="all 0.15s"
          _hover={{
            bg: 'rgba(255,255,255,0.05)',
            color: '#E6EDF3',
          }}
          justifyContent={collapsed ? 'center' : 'flex-start'}
          onClick={() => navigate('/settings')}
          mb={2}
        >
          <Settings size={20} strokeWidth={1.5} />
          {!collapsed && <Text fontSize="sm">{t('nav.settings')}</Text>}
        </Flex>

        {/* Collapse toggle */}
        <IconButton
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          icon={collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          variant="ghost"
          size="sm"
          w="full"
          color="#8B949E"
          _hover={{ color: '#E6EDF3', bg: 'rgba(255,255,255,0.05)' }}
          onClick={toggle}
        />
      </Box>
    </Flex>
  )
}
