import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
export declare enum NotificationType {
    COMMENT_REPLY = "comment_reply"
}
export declare class Notification {
    id: string;
    type: string;
    isRead: boolean;
    recipient: User;
    comment: Comment;
    createdAt: Date;
}
