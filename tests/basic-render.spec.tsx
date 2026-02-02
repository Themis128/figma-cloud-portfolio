import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

describe('Basic Rendering Test', () => {
  it('renders a simple div', () => {
    render(<div>Hello World</div>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
