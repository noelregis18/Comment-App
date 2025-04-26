import { Comment } from '../../comments/entities/comment.entity';
import { Notification } from '../../notifications/entities/notification.entity';
export declare class User {
    id: string;
    username: string;
    email: string;
    password: string;
    comments: Comment[];
    notifications: Notification[];
    createdAt: Date;
    updatedAt: Date;
}
