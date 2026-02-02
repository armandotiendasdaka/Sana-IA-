import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Role {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @OneToMany(() => User, (user) => user.role)
    users: User[]
    
    @Column({ length: 100 })
    name: string;

    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'datetime', nullable: true })
    updatedAt: Date;

}
