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
import {UserCreatedResponse} from "../models/response/user-created.response";
import {UserDTO, userToDTO} from "../models/dto/user.dto";
import {generateToken} from "../utils/jwt";
import {Role} from "../models/enums/role.enum";

@JsonController("/users")
@UseAfter(ErrorHandlerMiddleware)
export class UserController {
    private userService = new UserService();

    @Post("/register")
    @HttpCode(201)
    async register(@Body() userData: Partial<User>): Promise<UserCreatedResponse> {
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
    async updateUser(@Param("email") email: string, @Body() updateData: Partial<User>) {
        return this.userService.updateUser(email, updateData);
    }

    @Delete("/:email")
    async deleteUser(@Param("email") email: string) {
        return this.userService.deleteUser(email);
    }
}