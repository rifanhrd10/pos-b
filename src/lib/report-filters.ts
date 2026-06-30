import { Prisma } from "@prisma/client";

export type ReportFilterState = {
  dateFrom?: string;
  dateTo?: string;
  cashierId?: string;
  paymentMethodId?: string;
};

export function parseReportFilters(searchParams: URLSearchParams | Record<string, string | string[] | undefined>) {
  const read = (key: string) => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key) || undefined;
    }
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value || undefined;
  };

  return {
    dateFrom: read("dateFrom"),
    dateTo: read("dateTo"),
    cashierId: read("cashierId"),
    paymentMethodId: read("paymentMethodId"),
  } satisfies ReportFilterState;
}

export function buildTransactionWhere(filters: ReportFilterState): Prisma.TransactionWhereInput {
  const createdAt: Prisma.DateTimeFilter = {};

  if (filters.dateFrom) {
    createdAt.gte = new Date(`${filters.dateFrom}T00:00:00.000Z`);
  }

  if (filters.dateTo) {
    createdAt.lte = new Date(`${filters.dateTo}T23:59:59.999Z`);
  }

  return {
    status: "PAID",
    deletedAt: null,
    ...(filters.cashierId ? { cashierId: filters.cashierId } : {}),
    ...(filters.paymentMethodId
      ? {
          payments: {
            some: {
              paymentMethodId: filters.paymentMethodId,
            },
          },
        }
      : {}),
    ...(filters.dateFrom || filters.dateTo ? { createdAt } : {}),
  };
}
