import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DataCard } from '../data-card';
import { BarChart } from 'lucide-react';

describe('DataCard', () => {
  it('renders title and value correctly', () => {
    render(<DataCard title="Test Title" value="100" />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });
  
  it('renders description when provided', () => {
    render(
      <DataCard 
        title="Test Title" 
        value="100" 
        description="Test Description" 
      />
    );
    
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
  
  it('displays positive trend correctly', () => {
    render(
      <DataCard 
        title="Test Title" 
        value="100" 
        trend={5.5} 
      />
    );
    
    expect(screen.getByText('5.5%')).toBeInTheDocument();
    expect(screen.getByText('from previous period')).toBeInTheDocument();
  });
  
  it('displays negative trend correctly', () => {
    render(
      <DataCard 
        title="Test Title" 
        value="100" 
        trend={-3.2} 
      />
    );
    
    expect(screen.getByText('3.2%')).toBeInTheDocument();
  });
  
  it('renders icon when provided', () => {
    render(
      <DataCard 
        title="Test Title" 
        value="100" 
        icon={<BarChart data-testid="chart-icon" />} 
      />
    );
    
    expect(screen.getByTestId('chart-icon')).toBeInTheDocument();
  });
});
