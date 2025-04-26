import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { Comment } from '../comments/entities/comment.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async createCommentReplyNotification(recipient: User, comment: Comment): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      type: NotificationType.COMMENT_REPLY,
      recipient,
      comment,
    });

    return this.notificationsRepository.save(notification);
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { recipient: { id: userId } },
      relations: ['comment', 'comment.author'],
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string): Promise<Notification | undefined> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });

    if (notification) {
      notification.isRead = true;
      return this.notificationsRepository.save(notification);
    }

    return undefined;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { recipient: { id: userId } },
      { isRead: true },
    );
  }
} 