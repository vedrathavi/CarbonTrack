import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TopContributor from '@/components/Dashboard/TopContributor';

describe('TopContributor Component', () => {
  it('renders "No Data Yet" when no appliances provided', () => {
    render(<TopContributor applianceTotals={null} topAppliance={null} />);
    expect(screen.getByText('No Data Yet')).toBeInTheDocument();
    expect(screen.getByText('Start using appliances to see insights')).toBeInTheDocument();
  });

  it('displays top appliance name correctly', () => {
    const mockApplianceTotals = {
      airConditioner: 500,
      refrigerator: 200,
      washingMachine: 100,
    };
    
    render(<TopContributor applianceTotals={mockApplianceTotals} topAppliance="airConditioner" />);
    expect(screen.getByText('Air Conditioner')).toBeInTheDocument();
  });

  it('displays emission value for top appliance', () => {
    const mockApplianceTotals = {
      airConditioner: 500.7,
      refrigerator: 200,
    };
    
    render(<TopContributor applianceTotals={mockApplianceTotals} topAppliance="airConditioner" />);
    expect(screen.getByText('500.7')).toBeInTheDocument();
    expect(screen.getByText('gCO₂ today')).toBeInTheDocument();
  });

  it('calculates percentage contribution correctly', () => {
    const mockApplianceTotals = {
      airConditioner: 500,
      refrigerator: 300,
      washingMachine: 200,
    };
    // Total = 1000, airConditioner = 500, so 50%
    
    render(<TopContributor applianceTotals={mockApplianceTotals} topAppliance="airConditioner" />);
    expect(screen.getByText('50.0%')).toBeInTheDocument();
  });

  it('displays total emissions', () => {
    const mockApplianceTotals = {
      airConditioner: 500,
      refrigerator: 300,
      washingMachine: 200,
    };
    
    render(<TopContributor applianceTotals={mockApplianceTotals} topAppliance="airConditioner" />);
    expect(screen.getByText(/Total: 1000\.0g/)).toBeInTheDocument();
  });

  it('formats appliance names with spaces', () => {
    const mockApplianceTotals = {
      washingMachine: 300,
    };
    
    render(<TopContributor applianceTotals={mockApplianceTotals} topAppliance="washingMachine" />);
    expect(screen.getByText('Washing Machine')).toBeInTheDocument();
  });

  it('automatically selects highest emitter when topAppliance not provided', () => {
    const mockApplianceTotals = {
      refrigerator: 300,
      airConditioner: 500,
      washingMachine: 200,
    };
    
    render(<TopContributor applianceTotals={mockApplianceTotals} topAppliance={null} />);
    expect(screen.getByText('Air Conditioner')).toBeInTheDocument();
    expect(screen.getByText('500.0')).toBeInTheDocument();
  });
});
