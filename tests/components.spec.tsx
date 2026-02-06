/** @jsxImportSource react */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  PageSkeleton,
  Skeleton,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonText,
} from '../client/components/Skeleton'

const MIN_SKELETON_ELEMENTS = 1
const MIN_PAGE_SKELETON_ELEMENTS = 5

describe('Skeleton Components', () => {
  describe('Skeleton', () => {
    it('should render with default props', () => {
      render(<Skeleton />)
      const skeletons = screen.getAllByTestId('skeleton')
      const skeleton = skeletons.find(
        (s) => s.classList.contains('animate-pulse') && !s.classList.contains('h-4'),
      )
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('animate-pulse')
    })

    it('should apply custom className', () => {
      render(<Skeleton className='custom-class' />)
      const skeletons = screen.getAllByTestId('skeleton')
      const skeleton = skeletons.find((s) => s.classList.contains('custom-class'))
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('custom-class')
    })
  })

  describe('SkeletonText', () => {
    it('should render single line', () => {
      render(<SkeletonText />)
      const skeletons = screen.getAllByTestId('skeleton')
      const skeleton = skeletons.find(
        (s) => s.classList.contains('h-4') && s.classList.contains('w-full'),
      )
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('h-4', 'w-full')
    })

    it('should render multiple lines', () => {
      render(<SkeletonText lines={3} />)
      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons.length).toBeGreaterThanOrEqual(3)
      const fullWidth = skeletons.filter(
        (s) => s.classList.contains('h-4') && s.classList.contains('w-full'),
      )
      expect(fullWidth.length).toBeGreaterThanOrEqual(1)
      const partialWidth = skeletons.filter(
        (s) => s.classList.contains('h-4') && s.classList.contains('w-3/4'),
      )
      expect(partialWidth.length).toBeGreaterThanOrEqual(1)
    })

    it('should apply custom className', () => {
      render(<SkeletonText className='custom-text' />)
      const skeletons = screen.getAllByTestId('skeleton')
      const skeleton = skeletons.find((s) => s.classList.contains('custom-text'))
      expect(skeleton).toBeInTheDocument()
      expect(skeleton).toHaveClass('custom-text')
    })
  })

  describe('SkeletonCard', () => {
    it('should render card skeleton', () => {
      render(<SkeletonCard />)
      const cards = screen.getAllByTestId('skeleton-card')
      const card = cards.find((c) => c.classList.contains('rounded-lg'))
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-lg', 'border', 'p-6')

      // Should contain skeleton text elements
      const skeletons = card?.querySelectorAll('[data-testid="skeleton"]') || []
      expect(skeletons.length).toBeGreaterThan(MIN_SKELETON_ELEMENTS)
    })

    it('should apply custom className', () => {
      render(<SkeletonCard className='custom-card' />)
      const cards = screen.getAllByTestId('skeleton-card')
      const card = cards.find((c) => c.classList.contains('custom-card'))
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('custom-card')
    })
  })

  describe('SkeletonAvatar', () => {
    it('should render small avatar', () => {
      render(<SkeletonAvatar size='sm' />)
      const container = document.body
      const avatar = Array.from(container.querySelectorAll('[data-testid="skeleton"]')).find(
        (el) => el.classList.contains('rounded-full') && el.classList.contains('h-8'),
      )
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveClass('rounded-full', 'h-8', 'w-8')
    })

    it('should render medium avatar', () => {
      render(<SkeletonAvatar size='md' />)
      const container = document.body
      const avatar = Array.from(container.querySelectorAll('[data-testid="skeleton"]')).find(
        (el) => el.classList.contains('rounded-full') && el.classList.contains('h-12'),
      )
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveClass('rounded-full', 'h-12', 'w-12')
    })

    it('should render large avatar', () => {
      render(<SkeletonAvatar size='lg' />)
      const container = document.body
      const avatar = Array.from(container.querySelectorAll('[data-testid="skeleton"]')).find(
        (el) => el.classList.contains('rounded-full') && el.classList.contains('h-16'),
      )
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveClass('rounded-full', 'h-16', 'w-16')
    })

    it('should apply custom className', () => {
      render(<SkeletonAvatar className='custom-avatar' />)
      const container = document.body
      const avatar = Array.from(container.querySelectorAll('[data-testid="skeleton"]')).find(
        (el) => el.classList.contains('rounded-full') && el.classList.contains('custom-avatar'),
      )
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveClass('custom-avatar')
    })
  })

  describe('SkeletonButton', () => {
    it('should render button skeleton', () => {
      render(<SkeletonButton />)
      const buttons = screen.getAllByTestId('skeleton')
      const button = buttons.find((b) => b.classList.contains('h-10'))
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('h-10', 'w-24')
    })

    it('should apply custom className', () => {
      render(<SkeletonButton className='custom-button' />)
      const buttons = screen.getAllByTestId('skeleton')
      const button = buttons.find((b) => b.classList.contains('custom-button'))
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('custom-button')
    })
  })

  describe('PageSkeleton', () => {
    it('should render page skeleton', () => {
      render(<PageSkeleton />)
      const page = screen.getByTestId('page-skeleton')
      expect(page).toHaveClass('min-h-screen')

      // Should contain multiple skeleton elements
      const skeletons = screen.getAllByTestId('skeleton')
      expect(skeletons.length).toBeGreaterThan(MIN_PAGE_SKELETON_ELEMENTS)
    })
  })
})
