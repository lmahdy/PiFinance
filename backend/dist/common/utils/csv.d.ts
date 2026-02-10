export type CsvRow = Record<string, string>;
export declare const parseCsvBuffer: (buffer: Buffer) => Promise<CsvRow[]>;
export declare const assertRequiredColumns: (row: CsvRow | undefined, columns: string[]) => void;
export declare const parseNumber: (value: string, field: string) => number;
export declare const parseDate: (value: string, field: string) => Date;
