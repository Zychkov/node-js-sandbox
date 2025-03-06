import {Expose, plainToInstance, Transform} from "class-transformer";
import {ObjectId} from "mongodb";
import {User} from "../user.model";
import {UserStatus} from "../enums/user-status.enum";
import {Role} from "../enums/role.enum";
import {SchemaObject} from "openapi3-ts";

export class UserDTO {
    @Expose({name: "id"})
    @Transform(({obj}) => obj._id ? obj._id.toString() : null)
    _id?: string;

    @Expose()
    username!: string;

    @Expose()
    email!: string;

    @Expose()
    status?: UserStatus;

    @Expose()
    bio?: string;

    @Expose()
    avatar?: string;

    @Expose()
    role?: Role;

    @Expose()
    @Transform(({value}) => value ? value.map((id: ObjectId) => id.toString()) : [])
    friends!: ObjectId[];
}

export function userToDTO(user: User): UserDTO {
    return plainToInstance(UserDTO, user, {excludeExtraneousValues: true}) as UserDTO;
}

export const userDTOSchema: SchemaObject = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        email: { type: 'string', format: 'email' },
        status: { type: 'string', enum: Object.values(UserStatus) },
        bio: { type: 'string' },
        avatar: { type: 'string' },
        role: { type: 'string', enum: Object.values(Role) },
        friends: { type: 'array', items: { type: 'string' } }
    },
    required: ['username', 'email']
};
