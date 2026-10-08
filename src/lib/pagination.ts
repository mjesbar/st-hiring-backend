export interface Pagination {
  page: number;
  pageSize: number;
  offset: number;
  limit: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

/** Parses and clamps `page`/`pageSize` query params, throwing on invalid input. */
export const parsePagination = (query: Record<string, unknown>): Pagination => {
  const page = parsePositiveInt(query.page, DEFAULT_PAGE, 'page');
  const pageSize = parsePositiveInt(query.pageSize, DEFAULT_PAGE_SIZE, 'pageSize');

  if (pageSize > MAX_PAGE_SIZE) {
    throw new Error(`pageSize must not exceed ${MAX_PAGE_SIZE}`);
  }

  return { page, pageSize, offset: (page - 1) * pageSize, limit: pageSize };
};

/** Computes the total number of pages for a given total and page size. */
export const totalPages = (total: number, pageSize: number): number => Math.ceil(total / pageSize);

const parsePositiveInt = (value: unknown, fallback: number, field: string): number => {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${field} must be a positive integer`);
  }
  return parsed;
};
