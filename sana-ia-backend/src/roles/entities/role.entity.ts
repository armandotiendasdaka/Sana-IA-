import { User } from "../../users/entities/user.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Role {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @OneToMany(() => User, (user) => user.role)
    users: User[]

    @Column({ length: 100 })
    name: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    updatedAt: Date;

}
