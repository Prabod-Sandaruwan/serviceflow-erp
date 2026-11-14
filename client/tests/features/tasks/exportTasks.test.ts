import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadAllTasksCsv } from '../../../src/features/tasks/exportTasks';
import { api } from '../../../src/lib/api';

vi.mock('../../../src/lib/api', () => ({
  api: { get: vi.fn() },
}));

describe('downloadAllTasksCsv', () => {
  let createdBlob: Blob | null = null;
  let clicked = false;

  beforeEach(() => {
    vi.clearAllMocks();
    createdBlob = null;
    clicked = false;

    window.URL.createObjectURL = vi.fn((blob: Blob) => {
      createdBlob = blob;
      return 'blob:mock-url';
    });
    window.URL.revokeObjectURL = vi.fn();

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = document.createElementNS('http://www.w3.org/1999/xhtml', tagName);
      if (tagName === 'a') {
        el.click = () => { clicked = true; };
      }
      return el as any;
    });
  });

  it('exports tasks to CSV with BOM and data rows', async () => {
    const mockTasks = [
      { id: '1', title: 'Task 1', priority: 'HIGH', status: 'TODO', assignee: { fullName: 'Bob' }, dueDate: '2026-12-01', projectId: 'p1', createdAt: '2026-11-14T10:00:00.000Z' },
    ];
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockTasks, meta: { totalPages: 1 } });

    await downloadAllTasksCsv();

    expect(clicked).toBe(true);
    expect(createdBlob).not.toBeNull();
    const buf = new Uint8Array(await (createdBlob as Blob).arrayBuffer());
    expect(buf[0]).toBe(0xef);
    expect(buf[1]).toBe(0xbb);
    expect(buf[2]).toBe(0xbf);
    const text = await (createdBlob as Blob).text();
    expect(text).toContain('Task ID,Title');
    expect(text).toContain('"1","Task 1","HIGH","TODO","Bob"');
  });

  it('falls back to provided tasks when API fails', async () => {
    vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'));
    const fallback = [
      { id: '2', title: 'Fallback Task', priority: 'LOW', status: 'DONE', assignee: null, dueDate: null, projectId: null, createdAt: null },
    ];

    await downloadAllTasksCsv(fallback as any);

    expect(clicked).toBe(true);
    const text = await (createdBlob as Blob).text();
    expect(text).toContain('"Fallback Task"');
  });
});
