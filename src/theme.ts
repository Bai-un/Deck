import { extendTheme, type ThemeOverride } from '@chakra-ui/react'

const config: ThemeOverride = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
  styles: {
    global: {
      body: {
        bg: '#0D1117',
        color: '#E6EDF3',
      },
    },
  },
  colors: {
    brand: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6C63FF',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },
    bg: {
      primary: '#0D1117',
      secondary: '#161B22',
      tertiary: '#21262D',
    },
    border: {
      muted: '#30363D',
    },
  },
  semanticTokens: {
    colors: {
      'chakra-body-bg': { _light: '#0D1117', _dark: '#0D1117' },
    },
  },
  components: {
    Card: {
      baseStyle: {
        bg: '#161B22',
        border: '1px solid',
        borderColor: '#30363D',
        borderRadius: '12px',
        p: 5,
        transition: 'all 0.2s',
        _hover: {
          borderColor: '#6C63FF',
          boxShadow: '0 4px 12px rgba(108, 99, 255, 0.1)',
        },
      },
    },
  },
}

const theme = extendTheme(config)

export default theme
