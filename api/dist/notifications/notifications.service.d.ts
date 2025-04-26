import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { Comment } from '../comments/entities/comment.entity';
export declare class NotificationsService {
    private notificationsRepository;
    constructor(notificationsRepository: Repository<Notification>);
    createCommentReplyNotification(recipient: User, comment: Comment): Promise<Notification>;
    getUserNotifications(userId: string): Promise<Notification[]>;
    markAsRead(id: string): Promise<Notification | undefined>;
    markAllAsRead(userId: string): Promise<void>;
}
