import {
  Table,
  Column,
  Model,
  HasMany,
  PrimaryKey,
  AutoIncrement,
} from 'sequelize-typescript';
import { User } from './User';
import { Ticket } from './Ticket';

@Table({ tableName: 'companies' })
export class Company extends Model {
  @AutoIncrement
  @PrimaryKey
  @Column
  declare id: number;

  @Column
  declare name: string;

  @HasMany(() => User)
  declare users: User[];
}