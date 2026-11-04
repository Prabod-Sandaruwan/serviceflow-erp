import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { Modal } from '../../src/components/ui/Modal';
import { Select } from '../../src/components/ui/Forms';
import { ProgressRing } from '../../src/components/ui/ProgressRing';

describe('UI Components', () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) { this.open = true; });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) { this.open = false; });
  });

  it('Modal triggers onClose when cancel event (Esc) is fired', () => {
    const handleClose = vi.fn();
    const { container } = render(<Modal isOpen={true} onClose={handleClose} title="Test Modal"><p>Modal Content</p></Modal>);
    const dialog = container.querySelector('dialog');
    expect(dialog).toBeInTheDocument();
    fireEvent(dialog!, new Event('cancel'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('Select component receives focus and changes value, validating keyboard accessibility', () => {
    const handleChange = vi.fn();
    const options = [{ value: 'opt1', label: 'Option 1' }, { value: 'opt2', label: 'Option 2' }];
    render(<Select id="test-select" label="Choose Option" options={options} onChange={handleChange} />);
    const select = screen.getByLabelText('Choose Option');
    select.focus();
    expect(select).toHaveFocus();
    fireEvent.change(select, { target: { value: 'opt2' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(select).toHaveValue('opt2');
  });

  it('ProgressRing renders label, percentage and clamps values between 0 and 100', () => {
    const { rerender } = render(<ProgressRing label="Sprint Health" percent={75} subtitle="On Track" />);
    expect(screen.getByText('Sprint Health')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('On Track')).toBeInTheDocument();

    rerender(<ProgressRing label="Sprint Health" percent={150} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
