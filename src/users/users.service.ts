import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-users.dto';
import { UpdateUserDto } from './dto/update-users.dto';
import { User } from './entities/users.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly saltRounds = 10;

  /**
   * @param userRepository access to User database
   */
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Creates a new user if the informed username or email is not already in use
   *
   * @param createUserDto Data Transfer Object to create a new user
   * @returns the created User
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, username, password } = createUserDto;

    // Verify if username and email is already in use
    const userExists = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .andWhere('user.username = :username', { username })
      .getOne();

    if (userExists) {
      throw new ConflictException('Username or email is already in use.');
    }

    // Hashes password
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // Create the new user
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Returns the new user
    return await this.userRepository.save(newUser);
  }

  /**
   * Reads all users that exist in the database
   *
   * @returns A list of Users
   */
  async findAll(): Promise<User[]> {
    // Returns all the users
    return await this.userRepository.find();
  }

  /**
   * Looks for a User in the database using its private key
   *
   * @param id the id of the informed user
   * @returns the found user or an error
   */
  async findOne(id: number): Promise<User> {
    // Selects the user
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException();
    }

    // Returns the user
    return user;
  }

  /**
   * Updates a user changing its information
   *
   * @param id the Id if the informed user
   * @param updateUserDto Data Transfer Object to update user
   * @returns the updated user data
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    const { password, ...rest } = updateUserDto;

    // Selects the user
    const user = await this.findOne(id);

    // Creates updated data
    const updatedData = { ...rest };

    // Hashes password, if needed
    if (password) {
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);
      updatedData['password'] = hashedPassword;
    }

    // Saves and returns the updated user
    this.userRepository.merge(user, updatedData);
    return await this.userRepository.save(user);
  }

  /**
   * Deletes a user from the database
   *
   * @param id the id if the user to delete
   */
  async remove(id: number) {
    // Select user
    const user = await this.findOne(id);

    // Removes the user
    await this.userRepository.remove(user);

    // Return success message
    return {
      message: 'User deleted successfully',
    };
  }

  /**
   * Finds a user by its username and returns the user with his password
   *
   * @param username the username of an existing user
   * @returns the found user
   */
  async findByUsernameAndSelectPassword(username: string): Promise<User> {
    // Search user and select its password
    const user = await this.userRepository.findOne({
      where: { username },
      select: ['id', 'username', 'password', 'role'],
    });

    if (!user) throw new UnauthorizedException();

    // Returns the found user
    return user;
  }
}
