import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
});
async function main() {
    console.log("🌱 Seeding database...");
    // --- User ---
    const user = await prisma.user.create({
        data: {
            email: "admin@example.com",
            password: "hashedpassword123",
            firstName: "Admin",
            lastName: "User",
            role: "ADMIN",
        },
    });
    // --- Contractor ---
    const contractor = await prisma.contractor.create({
        data: {
            name: "Acme Contracting",
            email: "contact@acme.com",
            phone: "555-1234",
        },
    });
    // --- Project ---
    const project = await prisma.project.create({
        data: {
            name: "Safety Training Project",
            description: "Initial rollout of safety training",
            contractorId: contractor.id,
            users: {
                connect: { id: user.id },
            },
        },
    });
    // --- Course ---
    const course = await prisma.course.create({
        data: {
            title: "Workplace Safety 101",
            description: "Basic safety training",
            projectId: project.id,
        },
    });
    // --- Module ---
    const module = await prisma.module.create({
        data: {
            title: "Introduction to Safety",
            content: "Safety basics...",
            order: 1,
            courseId: course.id,
        },
    });
    // --- Assignment ---
    const assignment = await prisma.assignment.create({
        data: {
            title: "Safety Checklist",
            description: "Complete the safety checklist",
            moduleId: module.id,
        },
    });
    // --- Quiz ---
    const quiz = await prisma.quiz.create({
        data: {
            title: "Safety Quiz",
            courseId: course.id,
            questions: {
                create: [
                    { text: "What is PPE?", answer: "Personal Protective Equipment" },
                    { text: "When should you report hazards?", answer: "Immediately" },
                ],
            },
        },
    });
    // --- Quiz Attempt ---
    await prisma.quizAttempt.create({
        data: {
            score: 95,
            userId: user.id,
            quizId: quiz.id,
        },
    });
    // --- Training Record ---
    await prisma.trainingRecord.create({
        data: {
            userId: user.id,
            assignmentId: assignment.id,
            score: 100,
            notes: "Completed successfully",
        },
    });
    // --- Credential ---
    await prisma.credential.create({
        data: {
            name: "Safety Certified",
            userId: user.id,
            metadata: { issuedBy: "Admin" },
        },
    });
    // --- Ledger Entry ---
    await prisma.ledgerEntry.create({
        data: {
            action: "SEED_DATA_CREATED",
            metadata: { timestamp: new Date().toISOString() },
        },
    });
    console.log("🌱 Seed complete!");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
