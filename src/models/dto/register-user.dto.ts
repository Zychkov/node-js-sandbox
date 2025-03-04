import {IsEmail, IsString} from "class-validator";

export class RegisterUserDTO {

    @IsString()
    username!: string;

    @IsEmail()
    email!: string;

    @IsString()
    password!: string;
}
