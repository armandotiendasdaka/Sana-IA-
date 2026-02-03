import dataSource from '../data-source';
import { seedRoles } from './role.seed';

async function runSeeds() {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Initialize the data source
        await dataSource.initialize();
        console.log('✓ Database connection established\n');

        // Run seeders
        console.log('📦 Seeding Roles...');
        await seedRoles(dataSource);
        console.log('');

        // Add more seeders here as needed
        // await seedUsers(dataSource);
        // await seedSpecialists(dataSource);

        console.log('✅ Database seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    } finally {
        await dataSource.destroy();
        console.log('🔌 Database connection closed');
    }
}

runSeeds();
