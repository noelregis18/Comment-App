import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class CommentsService {
    private commentsRepository;
    private notificationsService;
    constructor(commentsRepository: Repository<Comment>, notificationsService: NotificationsService);
    create(createCommentDto: CreateCommentDto, user: User): Promise<Comment>;
    findAll(includeDeleted?: boolean): Promise<Comment[]>;
    findOne(id: string): Promise<Comment>;
    update(id: string, updateCommentDto: UpdateCommentDto, user: User): Promise<Comment>;
    softDelete(id: string, user: User): Promise<Comment>;
    restore(id: string, user: User): Promise<Comment>;
}
