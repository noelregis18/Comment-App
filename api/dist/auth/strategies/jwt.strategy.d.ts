import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly usersService;
    constructor(configService: ConfigService, usersService: UsersService);
    validate(payload: any): Promise<{
        id: string;
        username: string;
        email: string;
        comments: import("../../comments/entities/comment.entity").Comment[];
        notifications: import("../../notifications/entities/notification.entity").Notification[];
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
export {};
