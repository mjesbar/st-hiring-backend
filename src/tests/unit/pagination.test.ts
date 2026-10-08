import { parsePagination, totalPages } from '../../lib/pagination';

describe('parsePagination', () => {
  it('applies defaults when params are absent', () => {
    expect(parsePagination({})).toEqual({ page: 1, pageSize: 20, offset: 0, limit: 20 });
  });

  it('parses page and pageSize into offset/limit', () => {
    expect(parsePagination({ page: '3', pageSize: '10' })).toEqual({ page: 3, pageSize: 10, offset: 20, limit: 10 });
  });

  it.each([
    ['page', { page: '0' }],
    ['page', { page: 'abc' }],
    ['pageSize', { pageSize: '-1' }],
    ['pageSize', { pageSize: '1.5' }],
  ])('rejects invalid %s', (_field, query) => {
    expect(() => parsePagination(query)).toThrow();
  });

  it('rejects pageSize above the maximum', () => {
    expect(() => parsePagination({ pageSize: '101' })).toThrow('pageSize must not exceed 100');
  });
});

describe('totalPages', () => {
  it('rounds up', () => {
    expect(totalPages(100, 10)).toBe(10);
    expect(totalPages(101, 10)).toBe(11);
    expect(totalPages(0, 10)).toBe(0);
  });
});
