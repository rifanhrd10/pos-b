import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const businessId = searchParams.get("businessId")

  if (!businessId) {
    return NextResponse.json(
      { error: "businessId is required" },
      { status: 400 }
    )
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        businessId,
        status: "PAID",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        payment: {
          select: {
            method: true,
          },
        },
        outlet: {
          select: {
            name: true,
          },
        },
        employee: {
          select: {
            name: true,
          },
        },
      },
    })

    const transactions = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      outletName: order.outlet.name,
      employeeName: order.employee.name,
      method: order.payment?.method || "CASH",
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    }))

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Failed to fetch recent transactions:", error)
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}
