import { PrismaClient } from "@prisma/client"
import { hash } from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seeding...")

  // Create an organization
  const organization = await prisma.organization.create({
    data: {
      name: "Demo Organization",
      slug: "demo-organization",
    },
  })

  console.log("Created organization:", organization.name)

  // Create admin user
  const adminPassword = await hash("@kabz123", 10)
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "kabogp@gmail.com",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
      organizationId: organization.id,
    },
  })

  console.log("Created admin user:", admin.email)

  // Create manager user
  const managerPassword = await hash("@kabz123", 10)
  const manager = await prisma.user.create({
    data: {
      name: "Manager User",
      email: "manager@example.com",
      password: managerPassword,
      role: "MANAGER",
      emailVerified: new Date(),
      organizationId: organization.id,
    },
  })

  console.log("Created manager user:", manager.email)

  // Create staff user
  const staffPassword = await hash("@kabz123", 10)
  const staff = await prisma.user.create({
    data: {
      name: "Staff User",
      email: "staff@example.com",
      password: staffPassword,
      role: "STAFF",
      emailVerified: new Date(),
      organizationId: organization.id,
    },
  })

  console.log("Created staff user:", staff.email)

  // Create clients
  const clients = await Promise.all(
    Array.from({ length: 5 }).map(async (_, i) => {
      const client = await prisma.client.create({
        data: {
          name: `Client ${i + 1}`,
          email: `client${i + 1}@example.com`,
          phone: `+1 555-${String(i + 1).padStart(3, "0")}-${String(i + 1).padStart(4, "0")}`,
          address: `${i + 100} Main St, City, State, 12345`,
          notes: `Notes for Client ${i + 1}`,
          organizationId: organization.id,
        },
      })
      return client
    }),
  )

  console.log(`Created ${clients.length} clients`)

  // Create client user accounts
  for (const client of clients) {
    const clientPassword = await hash("@kabz123", 10)
    const clientUser = await prisma.user.create({
      data: {
        name: client.name,
        email: client.email,
        password: clientPassword,
        role: "CLIENT",
        emailVerified: new Date(),
        organizationId: organization.id,
      },
    })
    console.log("Created client user:", clientUser.email)
  }

  // Create tasks
  const priorities = ["LOW", "MEDIUM", "HIGH"]
  const statuses = ["TODO", "IN_PROGRESS", "COMPLETED"]

  const tasks = await Promise.all(
    Array.from({ length: 10 }).map(async (_, i) => {
      const task = await prisma.task.create({
        data: {
          title: `Task ${i + 1}`,
          description: `Description for Task ${i + 1}`,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          priority: priorities[i % 3] as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: statuses[i % 3] as any,
          dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // Due in i+1 days
          organizationId: organization.id,
          createdById: admin.id,
          assignedToId: [admin.id, manager.id, staff.id][i % 3],
          clientId: i % 2 === 0 ? clients[i % clients.length].id : null,
        },
      })
      return task
    }),
  )

  console.log(`Created ${tasks.length} tasks`)

  console.log("Seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

