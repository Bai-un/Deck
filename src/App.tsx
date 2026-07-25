import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { ChakraProvider, ColorModeScript, Flex, Spinner, Text } from '@chakra-ui/react'
import theme from './theme'
import {
  Routes,
  Route,
  Outlet,
} from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SplashScreen } from './components/SplashScreen'
import { ColorFilterWindow } from './components/display/ColorFilterWindow'
import { AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useSettingsStore } from './stores/useSettingsStore'
import { useHardwareStore } from './stores/useHardwareStore'
import './lib/i18n'

// Lazy loaded pages
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })))
const HardwarePage = lazy(() => import('./pages/HardwarePage').then(m => ({ default: m.HardwarePage })))
const OptimizePage = lazy(() => import('./pages/OptimizePage').then(m => ({ default: m.OptimizePage })))
const MemoryCleanupPage = lazy(() => import('./pages/MemoryCleanupPage').then(m => ({ default: m.MemoryCleanupPage })))
const StorageCleanPage = lazy(() => import('./pages/StorageCleanPage').then(m => ({ default: m.StorageCleanPage })))
const ShaderCachePage = lazy(() => import('./pages/ShaderCachePage').then(m => ({ default: m.ShaderCachePage })))
const NetworkOptimizerPage = lazy(() => import('./pages/NetworkOptimizerPage').then(m => ({ default: m.NetworkOptimizerPage })))
const PowerManagementPage = lazy(() => import('./pages/PowerManagementPage').then(m => ({ default: m.PowerManagementPage })))
const StartupManagerPage = lazy(() => import('./pages/StartupManagerPage').then(m => ({ default: m.StartupManagerPage })))
const PeripheralOptimizePage = lazy(() => import('./pages/PeripheralOptimizePage').then(m => ({ default: m.PeripheralOptimizePage })))
const DisplayPage = lazy(() => import('./pages/DisplayPage').then(m => ({ default: m.DisplayPage })))
const DisplayFilterPage = lazy(() => import('./pages/DisplayFilterPage').then(m => ({ default: m.DisplayFilterPage })))
const DLSSPresetPage = lazy(() => import('./pages/DLSSPresetPage').then(m => ({ default: m.DLSSPresetPage })))
const ResolutionConverterPage = lazy(() => import('./pages/ResolutionConverterPage').then(m => ({ default: m.ResolutionConverterPage })))
const OverlayPanelPage = lazy(() => import('./pages/OverlayPanelPage').then(m => ({ default: m.OverlayPanelPage })))
const VerticalOverlayPage = lazy(() => import('./pages/VerticalOverlayPage').then(m => ({ default: m.VerticalOverlayPage })))
const ToolsPage = lazy(() => import('./pages/ToolsPage').then(m => ({ default: m.ToolsPage })))
const DiskHealthPage = lazy(() => import('./pages/DiskHealthPage').then(m => ({ default: m.DiskHealthPage })))
const GpuRenamePage = lazy(() => import('./pages/GpuRenamePage').then(m => ({ default: m.GpuRenamePage })))
const NvidiaDriverPage = lazy(() => import('./pages/NvidiaDriverPage').then(m => ({ default: m.NvidiaDriverPage })))
const BuiltinToolsPage = lazy(() => import('./pages/BuiltinToolsPage').then(m => ({ default: m.BuiltinToolsPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const LauncherPage = lazy(() => import('./pages/LauncherPage').then(m => ({ default: m.LauncherPage })))
const WidgetPage = lazy(() => import('./pages/WidgetPage').then(m => ({ default: m.WidgetPage })))
const TrayMenuPage = lazy(() => import('./pages/TrayMenuPage').then(m => ({ default: m.TrayMenuPage })))
const OverlayPage = lazy(() => import('./pages/OverlayPage').then(m => ({ default: m.OverlayPage })))

function PageLoader() {
  return (
    <Flex direction="column" align="center" justify="center" py={20} gap={4}>
      <Spinner size="xl" color="#6C63FF" />
      <Text color="#8B949E" fontSize="sm">加载中...</Text>
    </Flex>
  )
}

function AnimatedOutlet() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Outlet key={location.pathname} />
    </AnimatePresence>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route element={<AnimatedOutlet />}>
          <Route index element={<Suspense fallback={<PageLoader />}><HomePage /></Suspense>} />
          <Route path="hardware" element={<Suspense fallback={<PageLoader />}><HardwarePage /></Suspense>} />
          <Route path="launcher" element={<Suspense fallback={<PageLoader />}><LauncherPage /></Suspense>} />
          <Route path="optimize" element={<Suspense fallback={<PageLoader />}><OptimizePage /></Suspense>} />
          <Route path="optimize/memory" element={<Suspense fallback={<PageLoader />}><MemoryCleanupPage /></Suspense>} />
          <Route path="optimize/storage" element={<Suspense fallback={<PageLoader />}><StorageCleanPage /></Suspense>} />
          <Route path="optimize/shader" element={<Suspense fallback={<PageLoader />}><ShaderCachePage /></Suspense>} />
          <Route path="optimize/network" element={<Suspense fallback={<PageLoader />}><NetworkOptimizerPage /></Suspense>} />
          <Route path="optimize/power" element={<Suspense fallback={<PageLoader />}><PowerManagementPage /></Suspense>} />
          <Route path="optimize/startup" element={<Suspense fallback={<PageLoader />}><StartupManagerPage /></Suspense>} />
          <Route path="optimize/peripheral" element={<Suspense fallback={<PageLoader />}><PeripheralOptimizePage /></Suspense>} />
          <Route path="display" element={<Suspense fallback={<PageLoader />}><DisplayPage /></Suspense>} />
          <Route path="display/filter" element={<Suspense fallback={<PageLoader />}><DisplayFilterPage /></Suspense>} />
          <Route path="display/dlss" element={<Suspense fallback={<PageLoader />}><DLSSPresetPage /></Suspense>} />
          <Route path="display/resolution" element={<Suspense fallback={<PageLoader />}><ResolutionConverterPage /></Suspense>} />
          <Route path="display/overlay" element={<Suspense fallback={<PageLoader />}><OverlayPanelPage /></Suspense>} />
          <Route path="display/vertical" element={<Suspense fallback={<PageLoader />}><VerticalOverlayPage /></Suspense>} />
          <Route path="tools" element={<Suspense fallback={<PageLoader />}><ToolsPage /></Suspense>} />
          <Route path="tools/disk-health" element={<Suspense fallback={<PageLoader />}><DiskHealthPage /></Suspense>} />
          <Route path="tools/gpu-rename" element={<Suspense fallback={<PageLoader />}><GpuRenamePage /></Suspense>} />
          <Route path="tools/nvidia-driver" element={<Suspense fallback={<PageLoader />}><NvidiaDriverPage /></Suspense>} />
          <Route path="tools/builtin" element={<Suspense fallback={<PageLoader />}><BuiltinToolsPage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
        </Route>
      </Route>
      <Route path="/widget" element={<WidgetPage />} />
      <Route path="/tray-menu" element={<TrayMenuPage />} />
      <Route path="/overlay" element={<OverlayPage />} />
      <Route path="/color-filter" element={<ColorFilterWindow />} />
    </Routes>
  )
}

function App() {
  const [ready, setReady] = useState(false)
  const fetchSystemInfo = useHardwareStore((s) => s.fetchSystemInfo)

  const init = useCallback(async () => {
    try {
      await fetchSystemInfo()
    } catch {
      // Silently continue — info may come later
    }
    setReady(true)
  }, [fetchSystemInfo])

  useEffect(() => {
    // Allow settings to hydrate from storage first
    if (useSettingsStore.persist.hasHydrated()) {
      init()
    } else {
      const unsub = useSettingsStore.persist.onFinishHydration(() => {
        init()
      })
      return () => unsub()
    }
  }, [init])

  if (!ready) {
    return <SplashScreen onFinished={() => setReady(true)} />
  }

  return (
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <AppRoutes />
      </ChakraProvider>
    </ErrorBoundary>
  )
}

export default App
