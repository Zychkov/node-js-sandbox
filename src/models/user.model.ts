import {IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString} from 'class-validator';
import {Role} from "./enums/role.enum";
import {UserStatus} from "./enums/user-status.enum";
import {ObjectId} from "mongodb";
import {Exclude} from "class-transformer";

export class User {

    @Exclude()
    _id?: string;

    @IsString()
    @IsNotEmpty()
    username!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;

    @IsEnum(UserStatus)
    @IsOptional()
    status?: UserStatus;

    @IsString()
    @IsOptional()
    bio?: string;

    @IsString()
    @IsOptional()
    avatar?: string;

    @IsEnum(Role)
    @IsOptional()
    role?: Role;

    @IsArray()
    @IsOptional()
    friends!: ObjectId[];
}
