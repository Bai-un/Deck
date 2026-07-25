import { Component, type ReactNode } from 'react'
import { Flex, Text, Button } from '@chakra-ui/react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Flex direction="column" align="center" justify="center" h="100vh" bg="#0D1117" gap={4}>
          <Text fontSize="2xl" fontWeight={700} color="#FF5555">
            出了点问题
          </Text>
          <Text color="#8B949E" fontSize="sm" maxW="500px" textAlign="center" px={4}>
            {this.state.error?.message}
          </Text>
          <Button
            mt={2}
            bg="#6C63FF"
            color="white"
            borderRadius="8px"
            _hover={{ bg: '#5A52D5' }}
            onClick={() => window.location.reload()}
          >
            重新加载
          </Button>
        </Flex>
      )
    }
    return this.props.children
  }
}
