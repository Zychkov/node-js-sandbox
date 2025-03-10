import {
    Authorized,
    Body,
    CurrentUser,
    Delete,
    Get,
    HttpCode,
    InternalServerError,
    JsonController,
    NotFoundError,
    Param,
    Post,
    Put, QueryParam,
    UnauthorizedError,
    UseAfter
} from "routing-controllers";
import {UserService} from "../services/user.service";
import {User} from "../models/user.model";
import {UserAlreadyExistsError} from "../errors/user-already-exists.error";
import {ErrorHandlerMiddleware} from "../middlewares/error-handler.middleware";
import logger from "../utils/logger";
import {validateDTO} from "../utils/validator";
import {UserDTO, userToDTO} from "../models/dto/user.dto";
import {generateToken} from "../utils/jwt";
import {Role} from "../models/enums/role.enum";
import {OpenAPI, ResponseSchema} from "routing-controllers-openapi";
import {RegisterUserDTO} from "../models/dto/register-user.dto";
import {UserCreatedResponse} from "../models/response/user-created.response";
import bcrypt from "bcrypt";

@JsonController("/users")
@UseAfter(ErrorHandlerMiddleware)
export class UserController {
    private userService = new UserService();

    @Post("/register")
    @HttpCode(201)
    @ResponseSchema(UserCreatedResponse)
    @OpenAPI({
        summary: "Register a new user",
        responses: {
            '409': {
                content: {
                    "application/json": {
                        schema: {$ref: "#/components/schemas/ErrorResponse"},
                        example: {
                            name: "UserAlreadyExistsError",
                            message: "User with email email@example.com already exists.",
                            statusCode: 409
                        }
                    }
                }
            }
        }
    })
    async register(@Body() userData: RegisterUserDTO): Promise<UserCreatedResponse> {
        const userInstance = await validateDTO(User, userData);

        let existingUser = await this.userService.getUserByEmail(userInstance.email);
        if (existingUser) {
            throw new UserAlreadyExistsError(`User with email ${userInstance.email} already exists.`);
        }

        existingUser = await this.userService.getUserByName(userInstance.username);
        if (existingUser) {
            throw new UserAlreadyExistsError(`User with name ${userInstance.username} already exists.`);
        }

        try {
            const user = await this.userService.register(userData);
            logger.info(`User with email ${user.email} successfully created.`)

            return {message: `User with email ${user.email} successfully created.`};
        } catch (error: any) {
            throw new InternalServerError("Failed to create a user: " + error.message)
        }
    }

    @Post("/login")
    @OpenAPI({
        summary: "User login to the systems",
        requestBody: {
            content: {
                "application/json": {
                    example: {
                        "email": "John_doe@example.com",
                        "password": "securepassword"
                    }
                }
            }
        },
        responses: {
            '200': {
                content: {
                    "application/json": {
                        example: {
                            token: "string token value"
                        }
                    }
                }
            }
        }
    })
    async login(@Body() loginData: { email: string; password: string }) {
        const user = await this.userService.getUserByEmail(loginData.email);

        if (!user || !(await bcrypt.compare(loginData.password, user.password))) {
            throw new UnauthorizedError("Invalid email or password.");
        }

        const token = generateToken(user);
        return {token};
    }

    @Get("/")
    @Authorized()
    @OpenAPI({
        summary: "Get a list of all users"
    })
    @ResponseSchema(UserDTO, {isArray: true})
    async getAllUsers(
        @QueryParam("pageSize", {required: false}) pageSize: number = 10,
        @QueryParam("pageNumber", {required: false}) pageNumber: number = 1,
        @QueryParam("includeAdmin", {required: false}) includeAdmin: boolean = true
    ): Promise<UserDTO[]> {
        const skip = (pageNumber - 1) * pageSize;
        const users = await this.userService.getUsersWithFilterAndPagination(pageSize, skip, includeAdmin);

        return users.map(user => userToDTO(user));
    }

    @Get("/me")
    @Authorized(Role.ADMIN)
    @ResponseSchema(UserDTO)
    async getCurrentUser(@CurrentUser() id: string) {
        const user = await this.userService.getUserById(id);

        if (user) {
            return userToDTO(user)
        } else {
            throw new InternalServerError("Something wrong");
        }
    }

    @Get("/:identifier")
    @Authorized()
    @ResponseSchema(UserDTO)
    async getUser(
        @Param("identifier") identifier: string,
        @QueryParam("auth") authType: string = 'id'
    ): Promise<UserDTO> {
        let user;

        switch (authType.toLowerCase()) {
            case "email":
                user = await this.userService.getUserByEmail(identifier);
                break;
            case "name":
                user = await this.userService.getUserByName(identifier);
                break;
            case "id":
            default:
                user = await this.userService.getUserById(identifier);
                break;
        }

        logger.debug(`Requested user with ${authType}: ${identifier}, found user with id: ${user?._id}`);

        if (!user) {
            throw new NotFoundError(`User with ${authType} ${identifier} not found.`);
        }

        return userToDTO(user);
    }

    @Put("/:email")
    @Authorized()
    async updateUser(@Param("email") email: string, @Body() updateData: Partial<User>) {
        //TODO
        return this.userService.updateUser(email, updateData);
    }

    @Delete("/:email")
    @Authorized()
    async deleteUser(@Param("email") email: string) {
        //TODO
        return this.userService.deleteUser(email);
    }

    @Post("/friends")
    @Authorized()
    @OpenAPI({summary: "Add the friend", description: "Allows a user to add a friend by ID"})
    async addFriend(@CurrentUser() userId: string, @Body() friendData: { friendId: string }): Promise<UserDTO> {
        const friend = await this.userService.getUserById(friendData.friendId);

        if (!friend) {
            throw new NotFoundError(`Friend with id ${friendData.friendId} not found.`)
        }

        const updatedUser = await this.userService.addFriend(userId, friendData.friendId);
        return userToDTO(updatedUser);
    }

    @Delete("/friends/:friendId")
    @Authorized()
    async removeFriend(@CurrentUser() userId: string, @Param("friendId") friendId: string): Promise<UserDTO> {
        const friend = await this.userService.getUserById(friendId);

        if (!friend) {
            throw new NotFoundError(`Friend with id ${friendId} not found.`);
        }

        const updatedUser = await this.userService.removeFriend(userId, friendId);
        return userToDTO(updatedUser);
    }
}
