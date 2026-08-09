import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { STARTER_COMPANIES } from "../src/data/starter-companies";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_USER_EMAIL || "admin@jobtracker.local")
    .toLowerCase()
    .trim();
  const password = process.env.SEED_USER_PASSWORD || "admin123";

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed },
    create: {
      email,
      password: hashed,
      name: "Demo User",
    },
  });

  const existing = await prisma.company.count({ where: { userId: user.id } });
  if (existing === 0) {
    await prisma.company.createMany({
      data: STARTER_COMPANIES.map((c) => ({
        userId: user.id,
        name: c.name,
        category: c.category,
        location: c.location,
        description: c.description,
        status: "not_applied",
      })),
    });
    console.log(
      `Seeded ${STARTER_COMPANIES.length} companies for demo user.`
    );
  } else {
    console.log(
      `Demo user already has ${existing} companies; skipping company seed.`
    );
  }

  console.log(`Demo user ready: ${email} / ${password}`);
  console.log("New users should register at /signup — each has their own data.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
