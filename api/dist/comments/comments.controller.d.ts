import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from '../users/entities/user.entity';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    create(createCommentDto: CreateCommentDto, user: User): Promise<import("./entities/comment.entity").Comment>;
    findAll(): Promise<import("./entities/comment.entity").Comment[]>;
    findOne(id: string): Promise<import("./entities/comment.entity").Comment>;
    update(id: string, updateCommentDto: UpdateCommentDto, user: User): Promise<import("./entities/comment.entity").Comment>;
    softDelete(id: string, user: User): Promise<import("./entities/comment.entity").Comment>;
    restore(id: string, user: User): Promise<import("./entities/comment.entity").Comment>;
}
