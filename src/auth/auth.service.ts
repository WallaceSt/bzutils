import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { IAuthPayload } from './interfaces/auth-payload/auth-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Signs an user in by its username and password
   *
   * @param username username of the user
   * @param password password of the user
   * @returns An access token thats going to be used for authorization
   */
  async signIn(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    // Select user
    const user =
      await this.userService.findByUsernameAndSelectPassword(username);

    // Verify password
    const passwordMatches = await bcrypt.compare(
      password,
      user?.password || '',
    );

    if (!passwordMatches) {
      throw new UnauthorizedException();
    }

    // Create payload
    const payload: IAuthPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    // Return access token
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
