import { useEffect, useState } from 'react'
import { Flex, Text } from '@chakra-ui/react'
import { useSearchParams } from 'react-router-dom'

/**
 * Standalone fullscreen color filter overlay window.
 * Renders a fullscreen semi-transparent color overlay with pointer-events: none.
 * Receives filter parameters via URL search params: ?r=1.0&g=0.85&b=0.6&opacity=0.3
 */
export function ColorFilterWindow() {
  const [search] = useSearchParams()

  const r = parseFloat(search.get('r') || '1')
  const g = parseFloat(search.get('g') || '0.85')
  const b = parseFloat(search.get('b') || '0.6')
  const opacity = parseFloat(search.get('opacity') || '0.3')

  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Small delay to ensure mount before render
    setReady(true)
  }, [])

  if (!ready) return null

  return (
    <Flex
      w="100vw"
      h="100vh"
      position="fixed"
      top={0}
      left={0}
      bg={`rgba(${r * 255}, ${g * 255}, ${b * 255}, ${opacity})`}
      sx={{ pointerEvents: 'none' }}
      zIndex={99999}
    >
      <Text position="absolute" bottom={2} right={2} fontSize="10px" color="white" opacity={0.15}>
        Deck Color Filter
      </Text>
    </Flex>
  )
}
