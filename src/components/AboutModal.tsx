import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Flex,
  VStack,
} from '@chakra-ui/react'

interface Props {
  isOpen: boolean
  onClose: () => void
  appVersion?: string
}

export function AboutModal({ isOpen, onClose, appVersion = '0.1.0' }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay bg="rgba(0,0,0,0.6)" />
      <ModalContent bg="#161B22" border="1px solid" borderColor="#30363D" borderRadius="16px">
        <ModalHeader>
          <Flex direction="column" align="center" gap={2} pt={4}>
            <Text fontSize="3xl" fontWeight={800} color="#6C63FF">
              Deck
            </Text>
          </Flex>
        </ModalHeader>
        <ModalBody>
          <VStack gap={2} align="center">
            <Text fontSize="xs" color="#636D7D">
              版本 {appVersion}
            </Text>
            <Text fontSize="sm" color="#E6EDF3" textAlign="center">
              轻量级 PC 系统工具箱
            </Text>
            <Text fontSize="xs" color="#636D7D" mt={2} textAlign="center">
              基于 Tauri 2 + React 构建
            </Text>
            <Text fontSize="xs" color="#636D7D">
              &copy; 2026 Deck
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter justifyContent="center" pb={6}>
          <Button
            size="sm"
            variant="outline"
            borderColor="#30363D"
            color="#E6EDF3"
            borderRadius="8px"
            _hover={{ bg: 'rgba(255,255,255,0.05)' }}
            onClick={onClose}
          >
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
