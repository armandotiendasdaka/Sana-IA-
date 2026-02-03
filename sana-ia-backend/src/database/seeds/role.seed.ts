import { DataSource } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

export async function seedRoles(dataSource: DataSource): Promise<void> {
    const roleRepository = dataSource.getRepository(Role);

    const defaultRoles = [
        { name: 'admin' },
        { name: 'doctor' },
        { name: 'patient' },
    ];

    for (const roleData of defaultRoles) {
        const existingRole = await roleRepository.findOne({
            where: { name: roleData.name },
        });

        if (!existingRole) {
            const role = roleRepository.create(roleData);
            await roleRepository.save(role);
            console.log(`✓ Role "${roleData.name}" created`);
        } else {
            console.log(`- Role "${roleData.name}" already exists`);
        }
    }
}
