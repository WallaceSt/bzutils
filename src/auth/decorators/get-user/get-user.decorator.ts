import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { IAuthPayload } from 'src/auth/interfaces/auth-payload/auth-payload.interface';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IAuthPayload => {
    const request: Request = ctx.switchToHttp().getRequest();
    return request.user as IAuthPayload;
  },
);
