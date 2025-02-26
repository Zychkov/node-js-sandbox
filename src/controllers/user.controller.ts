import {
    JsonController,
    Body,
    Post,
    Get,
    Put,
    Delete,
    Param,
    HttpCode,
    UseAfter, InternalServerError, NotFoundError
} from "routing-controllers";
import {UserService} from "../services/user.service";
import {User} from "../models/user.model";
import {UserAlreadyExistsError} from "../errors/user-already-exists.error";
import {ErrorHandlerMiddleware} from "../middlewares/error-handler.middleware";
import logger from "../utils/logger";
import {validateDTO} from "../utils/validator";
import {UserCreatedResponse} from "../models/response/user-created.response";
import {UserDTO, userToDTO} from "../models/dto/user.dto";

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

    @Get("/")
    async getAllUsers() {
        return this.userService.getAllUsers();
    }

    @Get("/:email")
    async getUser(@Param("email") email: string):Promise<UserDTO> {
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