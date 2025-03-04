import {IsString} from "class-validator";

export class UserCreatedResponse {

    @IsString()
    message!: string;
}
