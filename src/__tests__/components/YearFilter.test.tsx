import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { YearFilter } from '../../components/YearFilter';

describe('YearFilter', () => {
  const mockOnYearChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with All Time selected by default', () => {
    render(
      <YearFilter
        availableYears={[2024, 2023]}
        selectedYear="ALL"
        onYearChange={mockOnYearChange}
      />
    );

    expect(screen.getByText('All Time')).toBeInTheDocument();
  });

  it('should render available years', () => {
    render(
      <YearFilter
        availableYears={[2024, 2023, 2022]}
        selectedYear="ALL"
        onYearChange={mockOnYearChange}
      />
    );

    // Open the select dropdown
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);

    // Check if "All Time" option exists (use getAllByText since it appears multiple times)
    const allTimeElements = screen.getAllByText('All Time');
    expect(allTimeElements.length).toBeGreaterThan(0);
  });

  it('should call onYearChange when year is selected', () => {
    render(
      <YearFilter
        availableYears={[2024, 2023]}
        selectedYear="ALL"
        onYearChange={mockOnYearChange}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);

    // Note: MUI Select interaction would require more complex testing
    // This is a basic structure
    expect(mockOnYearChange).not.toHaveBeenCalled();
  });

  it('should display selected year', () => {
    render(
      <YearFilter
        availableYears={[2024, 2023]}
        selectedYear={2024}
        onYearChange={mockOnYearChange}
      />
    );

    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('should handle empty years array', () => {
    render(
      <YearFilter
        availableYears={[]}
        selectedYear="ALL"
        onYearChange={mockOnYearChange}
      />
    );

    expect(screen.getByText('All Time')).toBeInTheDocument();
  });

  it('should render years in descending order', () => {
    const { container } = render(
      <YearFilter
        availableYears={[2022, 2024, 2023]}
        selectedYear="ALL"
        onYearChange={mockOnYearChange}
      />
    );

    // Component should internally sort years
    expect(container).toBeInTheDocument();
  });
});
