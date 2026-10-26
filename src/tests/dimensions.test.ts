import { describe, it, expect } from 'vitest';
import { getDimensionsForFormat } from '../engine/canvasRenderer';

describe('Format Dimensions & Layout Calibration', () => {
  it('returns standard 4:5 portrait post dimensions (1080x1350)', () => {
    const dim = getDimensionsForFormat('portrait');
    expect(dim.w).toBe(1080);
    expect(dim.h).toBe(1350);
    expect(dim.perfAxis).toBe('y');
    expect(dim.perfAt).toBe(1020);
  });

  it('returns standard 9:16 story/status dimensions (1080x1920)', () => {
    const dim = getDimensionsForFormat('story');
    expect(dim.w).toBe(1080);
    expect(dim.h).toBe(1920);
    expect(dim.perfAxis).toBe('y');
    expect(dim.h - dim.perfAt).toBeGreaterThan(200); // adequate safe area for stub & story controls
  });

  it('returns 1:1 square dimensions (1080x1080)', () => {
    const dim = getDimensionsForFormat('square');
    expect(dim.w).toBe(1080);
    expect(dim.h).toBe(1080);
    expect(dim.perfAxis).toBe('y');
  });

  it('returns 16:9 landscape dimensions (1200x675) with horizontal perforation axis', () => {
    const dim = getDimensionsForFormat('landscape');
    expect(dim.w).toBe(1200);
    expect(dim.h).toBe(675);
    expect(dim.perfAxis).toBe('x');
    expect(dim.perfAt).toBe(860);
  });
});
