import { NotificationsService } from './notifications.service';
import { User } from '../users/entities/user.entity';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findUserNotifications(user: User): Promise<import("./entities/notification.entity").Notification[]>;
    markAsRead(id: string): Promise<import("./entities/notification.entity").Notification | undefined>;
    markAllAsRead(user: User): Promise<void>;
}
