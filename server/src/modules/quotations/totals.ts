export interface QuotationItemInput {
  quantity: number;
  unitPrice: number;
  description?: string;
  [key: string]: any;
}

export interface ComputedLine extends QuotationItemInput {
  quantity: number;
  unitPrice: number;
  lineAmount: number;
}

export interface ComputedTotals {
  lines: ComputedLine[];
  subtotal: number;
  taxAmount: number;
  total: number;
}

export function computeTotals(items: QuotationItemInput[], taxAmount: number = 0): ComputedTotals {
  if (!items || items.length === 0) {
    throw new Error('Quotation items cannot be empty');
  }

  if (taxAmount < 0) {
    throw new Error('Tax amount cannot be negative');
  }

  const lines: ComputedLine[] = items.map((item) => {
    if (item.quantity <= 0) {
      throw new Error(`Item quantity must be greater than zero, received: ${item.quantity}`);
    }
    if (item.unitPrice < 0) {
      throw new Error(`Item unit price cannot be negative, received: ${item.unitPrice}`);
    }

    const lineAmount = Math.round(item.quantity * item.unitPrice * 100) / 100;
    return {
      ...item,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineAmount,
    };
  });

  const subtotal = Math.round(lines.reduce((sum, line) => sum + line.lineAmount, 0) * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  return {
    lines,
    subtotal,
    taxAmount,
    total,
  };
}
