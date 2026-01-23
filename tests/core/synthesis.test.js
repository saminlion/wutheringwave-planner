import { describe, it, expect } from 'vitest';
import { SynthesisEngine } from '@/core/engine/synthesis';

describe('SynthesisEngine', () => {
  it('should create with default 3:1 ratio', () => {
    const engine = new SynthesisEngine();
    expect(engine.ratio).toBe(3);
  });

  it('should accept custom ratio', () => {
    const engine = new SynthesisEngine({ ratio: 4 });
    expect(engine.ratio).toBe(4);
  });
});
