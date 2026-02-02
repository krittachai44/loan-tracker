import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InfoCard } from '../../components/InfoCard';

describe('InfoCard', () => {
  it('should render calculation method title', () => {
    render(<InfoCard />);
    expect(screen.getByText(/Calculation Method/i)).toBeInTheDocument();
  });

  it('should render Thai Bank Logic description', () => {
    render(<InfoCard />);
    expect(screen.getByText(/Thai Bank Logic/i)).toBeInTheDocument();
  });

  it('should render interest calculation details', () => {
    render(<InfoCard />);
    expect(screen.getByText(/Interest is calculated daily/i)).toBeInTheDocument();
  });

  it('should mention 365 days/year', () => {
    render(<InfoCard />);
    expect(screen.getByText(/365 days\/year/i)).toBeInTheDocument();
  });

  it('should describe payment deduction order', () => {
    render(<InfoCard />);
    expect(screen.getByText(/Payments deduct accrued interest first/i)).toBeInTheDocument();
  });

  it('should render with correct structure', () => {
    const { container } = render(<InfoCard />);
    expect(container.querySelector('.MuiCard-root')).toBeInTheDocument();
  });

  it('should have proper styling', () => {
    const { container } = render(<InfoCard />);
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });
});
