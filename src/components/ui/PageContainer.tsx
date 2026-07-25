import { Box } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

const MotionBox = motion.create(Box)

interface PageContainerProps {
  children: ReactNode
  heading?: string
}

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <MotionBox
      as="section"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      p={6}
      flex={1}
      overflow="auto"
    >
      {children}
    </MotionBox>
  )
}

// Re-export for convenience
export type { HTMLMotionProps }
export { MotionBox, pageVariants }
