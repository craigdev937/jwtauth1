import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("users")
export class User extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;

    @Column("int", { default: 0 }) count: number;

    @Column("text") email: string;

    @Column("text") password: string;
};

