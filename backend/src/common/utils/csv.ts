import { parse } from 'fast-csv';
import { Readable } from 'stream';

export type CsvRow = Record<string, string>;

export const parseCsvBuffer = (buffer: Buffer): Promise<CsvRow[]> =>
  new Promise((resolve, reject) => {
    const rows: CsvRow[] = [];
    Readable.from(buffer.toString('utf8'))
      .pipe(
        parse({
          headers: true,
          ignoreEmpty: true,
          trim: true,
        }),
      )
      .on('error', reject)
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows));
  });

export const assertRequiredColumns = (row: CsvRow | undefined, columns: string[]) => {
  if (!row) {
    throw new Error('CSV file is empty.');
  }
  const normalizedKeys = Object.keys(row).map((key) => key.trim());
  const missing = columns.filter((col) => !normalizedKeys.includes(col));
  if (missing.length > 0) {
    throw new Error(`Missing required columns: ${missing.join(', ')}`);
  }
};

export const parseNumber = (value: string, field: string): number => {
  const num = Number(value);
  if (Number.isNaN(num)) {
    throw new Error(`Invalid number for field ${field}: ${value}`);
  }
  return num;
};

export const parseDate = (value: string, field: string): Date => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date for field ${field}: ${value}`);
  }
  return date;
};
