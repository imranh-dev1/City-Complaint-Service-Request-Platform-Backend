import app from "./app";
import config from "./app/config";
import { prisma } from "./app/lib/prisma";
import { seedSuperAdmin, seedTesterAdmin, seedTesterCitizen, seedTesterTechnician } from "./app/utils/seed";

const PORT = config.port;

const main = async () => {
    try {
        await prisma.$connect();
        console.log("Connected to the database successfully.");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        await seedSuperAdmin();
        await seedTesterAdmin();
        await seedTesterCitizen();
        await seedTesterTechnician();

    } catch (error) {
        console.error("Error starting the server:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
};

main();
