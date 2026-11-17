import { api } from "../../lib/api";
import { downloadCsv } from "../../lib/csv";
import type { Quotation } from "./types";

export async function downloadAllQuotationsCsv(fallback: Quotation[] = []) {
  let list = fallback;
  try {
    const res = await api.get<{ data: Quotation[] }>(
      "/quotations?pageSize=100&page=1",
    );
    if (res?.data && res.data.length > 0) list = [...res.data];
  } catch {
    // fallback
  }

  const headers = [
    "Quotation #",
    "Title",
    "Client",
    "Total Amount",
    "Status",
    "Date",
    "Valid Until",
    "Expired",
  ];
  const rows = list.map((q) => [
    q.quotationNumber,
    q.title,
    q.clientName || q.clientId,
    Number(q.total || 0).toFixed(2),
    q.status,
    q.quotationDate || "-",
    q.validUntil || "-",
    q.isExpired ? "Yes" : "No",
  ]);

  downloadCsv(
    `quotations_export_${new Date().toISOString().slice(0, 10)}.csv`,
    headers,
    rows,
  );
}

export default downloadAllQuotationsCsv;
