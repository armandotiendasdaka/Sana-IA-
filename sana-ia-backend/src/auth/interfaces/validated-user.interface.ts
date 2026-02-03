import { Role } from '../../roles/entities/role.entity';

export interface ValidatedUser {
    id: number;
    email: string;
    name: string;
    isActive: boolean;
    disclaimerAccepted: boolean;
    role?: Role;
    createdAt: Date;
    updatedAt: Date;
}
