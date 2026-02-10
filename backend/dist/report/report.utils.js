"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSalesVolatility = exports.calculateRevenueGrowth = exports.calculateKpis = exports.isOverheadType = exports.sum = void 0;
const sum = (values) => values.reduce((acc, value) => acc + value, 0);
exports.sum = sum;
const isOverheadType = (type) => {
    const normalized = (type || '').toLowerCase();
    return ['overhead', 'expense', 'utility', 'rent', 'salary', 'service'].some((key) => normalized.includes(key));
};
exports.isOverheadType = isOverheadType;
const calculateKpis = (sales, purchases, taxRate) => {
    const revenue = (0, exports.sum)(sales.map((sale) => sale.total));
    const overheadCosts = (0, exports.sum)(purchases.filter((purchase) => (0, exports.isOverheadType)(purchase.type)).map((p) => p.totalCost));
    const stockPurchases = purchases.filter((purchase) => !(0, exports.isOverheadType)(purchase.type));
    const costMap = new Map();
    for (const purchase of stockPurchases) {
        const item = purchase.item;
        const record = costMap.get(item) || { totalCost: 0, totalQty: 0 };
        record.totalCost += purchase.totalCost;
        record.totalQty += purchase.quantity;
        costMap.set(item, record);
    }
    let cogs = 0;
    for (const sale of sales) {
        const record = costMap.get(sale.product);
        const avgCost = record && record.totalQty > 0 ? record.totalCost / record.totalQty : 0;
        cogs += avgCost * sale.quantity;
    }
    const costs = cogs + overheadCosts;
    const profit = revenue - costs;
    const taxes = profit > 0 ? profit * (taxRate / 100) : 0;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
    return {
        revenue,
        cogs,
        overheadCosts,
        costs,
        profit,
        taxes,
        profitMargin,
    };
};
exports.calculateKpis = calculateKpis;
const calculateRevenueGrowth = (sales) => {
    if (sales.length === 0) {
        return 0;
    }
    const sorted = [...sales].sort((a, b) => a.date.getTime() - b.date.getTime());
    const endDate = sorted[sorted.length - 1].date;
    const startWindow = new Date(endDate);
    startWindow.setDate(startWindow.getDate() - 30);
    const prevWindowStart = new Date(startWindow);
    prevWindowStart.setDate(prevWindowStart.getDate() - 30);
    let current = 0;
    let previous = 0;
    for (const sale of sorted) {
        if (sale.date >= startWindow) {
            current += sale.total;
        }
        else if (sale.date >= prevWindowStart && sale.date < startWindow) {
            previous += sale.total;
        }
    }
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
};
exports.calculateRevenueGrowth = calculateRevenueGrowth;
const calculateSalesVolatility = (sales) => {
    if (sales.length === 0) {
        return 0;
    }
    const daily = new Map();
    for (const sale of sales) {
        const key = sale.date.toISOString().slice(0, 10);
        daily.set(key, (daily.get(key) || 0) + sale.total);
    }
    const values = Array.from(daily.values());
    const mean = (0, exports.sum)(values) / values.length;
    if (mean === 0) {
        return 0;
    }
    const variance = (0, exports.sum)(values.map((value) => Math.pow(value - mean, 2))) / values.length;
    const stdDev = Math.sqrt(variance);
    return (stdDev / mean) * 100;
};
exports.calculateSalesVolatility = calculateSalesVolatility;
//# sourceMappingURL=report.utils.js.map