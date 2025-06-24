import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home', () => {
  it('renders the home page', () => {
    render(<Home />)
    expect(screen.getByText('Get started by editing')).toBeInTheDocument()
  })
})