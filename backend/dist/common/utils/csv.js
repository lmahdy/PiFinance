"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = exports.parseNumber = exports.assertRequiredColumns = exports.parseCsvBuffer = void 0;
const fast_csv_1 = require("fast-csv");
const stream_1 = require("stream");
const parseCsvBuffer = (buffer) => new Promise((resolve, reject) => {
    const rows = [];
    stream_1.Readable.from(buffer.toString('utf8'))
        .pipe((0, fast_csv_1.parse)({
        headers: true,
        ignoreEmpty: true,
        trim: true,
    }))
        .on('error', reject)
        .on('data', (row) => rows.push(row))
        .on('end', () => resolve(rows));
});
exports.parseCsvBuffer = parseCsvBuffer;
const assertRequiredColumns = (row, columns) => {
    if (!row) {
        throw new Error('CSV file is empty.');
    }
    const normalizedKeys = Object.keys(row).map((key) => key.trim());
    const missing = columns.filter((col) => !normalizedKeys.includes(col));
    if (missing.length > 0) {
        throw new Error(`Missing required columns: ${missing.join(', ')}`);
    }
};
exports.assertRequiredColumns = assertRequiredColumns;
const parseNumber = (value, field) => {
    const num = Number(value);
    if (Number.isNaN(num)) {
        throw new Error(`Invalid number for field ${field}: ${value}`);
    }
    return num;
};
exports.parseNumber = parseNumber;
const parseDate = (value, field) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid date for field ${field}: ${value}`);
    }
    return date;
};
exports.parseDate = parseDate;
//# sourceMappingURL=csv.js.map