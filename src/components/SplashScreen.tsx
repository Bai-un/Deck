import { useEffect, useState } from 'react'
import { Flex, Text, Spinner } from '@chakra-ui/react'

interface Props {
  onFinished: () => void
  minDuration?: number
}

export function SplashScreen({ onFinished, minDuration = 1500 }: Props) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(onFinished, 400)
    }, minDuration)
    return () => clearTimeout(timer)
  }, [onFinished, minDuration])

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      h="100vh"
      bg="#0D1117"
      gap={6}
      opacity={fadeOut ? 0 : 1}
      transition="opacity 0.4s ease"
      position="fixed"
      inset={0}
      zIndex={9999}
    >
      <Text fontSize="4xl" fontWeight={800} color="#6C63FF" letterSpacing="tight">
        Deck
      </Text>
      <Text fontSize="sm" color="#636D7D">
        轻量级 PC 工具箱
      </Text>
      <Spinner size="sm" color="#6C63FF" mt={4} />
    </Flex>
  )
}
