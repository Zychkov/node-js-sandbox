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
    Put,
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
    async login(@Body() loginData: { email: string; password: string }) {
        const user = await this.userService.getUserByEmail(loginData.email);

        if (!user || user.password !== loginData.password) {
            throw new UnauthorizedError("Invalid email or password.");
        }

        const token = generateToken(user);
        return {token};
    }

    @Get("/")
    @Authorized()
    async getAllUsers(): Promise<UserDTO[]> {
        return (await this.userService.getAllUsers()).map(user => userToDTO(user));
    }

    @Get("/me")
    @Authorized(Role.ADMIN)
    async getCurrentUser(@CurrentUser() id: string) {
        const user = await this.userService.getUserById(id);

        if (user) {
            return userToDTO(user)
        } else {
            throw new InternalServerError("Something wrong");
        }
    }

    @Get("/:email")
    @Authorized()
    async getUser(@Param("email") email: string): Promise<UserDTO> {
        const user = await this.userService.getUserByEmail(email);
        logger.debug(`Requested user with id: ${user?._id}`);

        if (!user) {
            throw new NotFoundError(`User with email ${email} not found.`);
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
