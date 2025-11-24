import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Utils - cn function', () => {
  it('merges class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toContain('text-red-500');
    expect(result).toContain('bg-blue-500');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toContain('base-class');
    expect(result).toContain('active-class');
  });

  it('handles false/null/undefined values', () => {
    const result = cn('text-red-500', false, null, undefined, 'bg-blue-500');
    expect(result).toContain('text-red-500');
    expect(result).toContain('bg-blue-500');
  });

  it('merges conflicting Tailwind classes correctly', () => {
    // twMerge should keep the last class when there's a conflict
    const result = cn('p-4', 'p-8');
    expect(result).toBe('p-8');
  });

  it('handles array of classes', () => {
    const result = cn(['text-red-500', 'bg-blue-500']);
    expect(result).toContain('text-red-500');
    expect(result).toContain('bg-blue-500');
  });

  it('handles object notation', () => {
    const result = cn({
      'text-red-500': true,
      'bg-blue-500': false,
      'p-4': true,
    });
    expect(result).toContain('text-red-500');
    expect(result).not.toContain('bg-blue-500');
    expect(result).toContain('p-4');
  });

  it('returns empty string for no arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });
});
