import { Role } from "src/roles/entities/role.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @ManyToOne(() => Role, (role) => role.users)
    role: Role;

    @Column({ unique: true })
    email: string;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 50 })
    password: string;

    @Column()
    birthDate: Date;

    @Column({ default: true })
    isActive: boolean;

    @Column()
    disclaimerAccepted: boolean;

    @Column({ nullable: true })
    disclaimerAcceptedAt: Date;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    updatedAt: Date;
}
