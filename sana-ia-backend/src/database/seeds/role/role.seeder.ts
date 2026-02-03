import { DataSource } from 'typeorm';
import { Role } from '../../../roles/entities/role.entity';
import { RoleEnum } from '../../../auth/enums/role.enum';

export class RoleSeeder {
    constructor(private dataSource: DataSource) { }

    async run() {
        const roleRepository = this.dataSource.getRepository(Role);
        const rolesData = [{ name: RoleEnum.ADMIN }, { name: RoleEnum.USER }];

        for (const roleData of rolesData) {
            const exists = await roleRepository.findOneBy({ name: roleData.name });
            if (!exists) {
                await roleRepository.save(roleRepository.create(roleData));
                console.log(`Role ${roleData.name} created`);
            }
        }
    }
}
