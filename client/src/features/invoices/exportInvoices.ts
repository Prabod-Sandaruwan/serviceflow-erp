import { api } from "../../lib/api";
import { downloadCsv } from "../../lib/csv";
import type { Invoice, InvoicesResponse } from "./types";

export async function downloadAllInvoicesCsv(fallbackInvoices: Invoice[] = []) {
  let list = fallbackInvoices;
  try {
    const res = await api.get<InvoicesResponse>(
      "/invoices?pageSize=100&page=1",
    );
    if (res?.data && res.data.length > 0) {
      list = [...res.data];
      const totalPages = res.meta?.totalPages || 1;
      for (let p = 2; p <= Math.min(totalPages, 10); p++) {
        const next = await api.get<InvoicesResponse>(
          `/invoices?pageSize=100&page=${p}`,
        );
        if (next?.data?.length) list.push(...next.data);
      }
    }
  } catch {
    // fallback
  }

  const headers = [
    "Invoice Number",
    "Project",
    "Client",
    "Issue Date",
    "Due Date",
    "Total",
    "Balance",
    "Status",
    "Is Overdue",
  ];
  const rows = list.map((i) => [
    i.invoiceNumber,
    i.project?.name || (i.projectId ? `Project #${i.projectId}` : ""),
    i.project?.client?.displayName || "",
    i.issueDate || "-",
    i.dueDate || "-",
    i.total,
    i.balance,
    i.status,
    i.isOverdue ? "Yes" : "No",
  ]);

  downloadCsv(
    `invoices_export_${new Date().toISOString().slice(0, 10)}.csv`,
    headers,
    rows,
  );
}

export default downloadAllInvoicesCsv;
