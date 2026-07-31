const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const business = await prisma.business.findFirst();
  
  if (!business) {
    console.log("No business found to attach the payment request to.");
    return;
  }
  
  const existingReq = await prisma.paymentRequest.findFirst({
    where: { status: "PENDING" }
  });
  
  if (existingReq) {
     console.log("Already has a pending payment request.");
     return;
  }

  await prisma.paymentRequest.create({
    data: {
      businessId: business.id,
      status: "PENDING"
    }
  });
  
  console.log("Mock payment request created!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
