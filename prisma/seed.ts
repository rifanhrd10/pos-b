import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Upsert plans (idempotent)
  const plans = [
    {
      name: "starter",
      displayName: "Starter",
      maxOutlets: 1,
      maxEmployees: 5,
      features: ["basic_reports"],
      price: 0,
    },
    {
      name: "pro",
      displayName: "Pro",
      maxOutlets: 10,
      maxEmployees: 50,
      features: ["shift", "advanced_reports", "export"],
      price: 199000,
    },
    {
      name: "enterprise",
      displayName: "Enterprise",
      maxOutlets: -1,
      maxEmployees: -1,
      features: ["shift", "advanced_reports", "export", "api", "priority_support"],
      price: 599000,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
    console.log(`✓ Plan "${plan.displayName}" seeded`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
