import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    token: string;

    @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
    user: User;

    @Column()
    expiresAt: Date;

    @Column({ default: false })
    isRevoked: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
