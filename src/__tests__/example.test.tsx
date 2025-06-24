import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '@/app/page'

describe('Home Page', () => {
  it('renders the Next.js logo', () => {
    render(<Home />)
    const logo = screen.getByAltText('Next.js logo')
    expect(logo).toBeInTheDocument()
  })

  it('renders the getting started text', () => {
    render(<Home />)
    const gettingStarted = screen.getByText(/Get started by editing/i)
    expect(gettingStarted).toBeInTheDocument()
  })
})