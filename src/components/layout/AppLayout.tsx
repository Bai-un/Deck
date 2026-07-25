import { Flex } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { TitleBar } from './TitleBar'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <Flex direction="column" h="100vh" overflow="hidden">
      <TitleBar />
      <Flex flex={1} overflow="hidden">
        <Sidebar />
        <Flex as="main" flex={1} overflow="auto" bg="#0D1117">
          <Outlet />
        </Flex>
      </Flex>
    </Flex>
  )
}
