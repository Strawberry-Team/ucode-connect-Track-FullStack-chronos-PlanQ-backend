import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entity/user.entity';

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })  // Связь с пользователем, поле в таблице tokens будет 'user_id'
  user: User;

  @Column({ name: 'refresh_token', type: 'text' })
  refreshToken: string; // Поле соответствует 'refresh_token' в таблице

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date; // Поле соответствует 'created_at' в таблице
}
