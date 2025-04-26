"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const comment_entity_1 = require("./entities/comment.entity");
const notifications_service_1 = require("../notifications/notifications.service");
let CommentsService = class CommentsService {
    commentsRepository;
    notificationsService;
    constructor(commentsRepository, notificationsService) {
        this.commentsRepository = commentsRepository;
        this.notificationsService = notificationsService;
    }
    async create(createCommentDto, user) {
        const comment = this.commentsRepository.create({
            content: createCommentDto.content,
            author: user,
        });
        if (createCommentDto.parentId) {
            const parentComment = await this.commentsRepository.findOne({
                where: { id: createCommentDto.parentId },
                relations: ['author'],
            });
            if (!parentComment) {
                throw new common_1.NotFoundException(`Parent comment with ID ${createCommentDto.parentId} not found`);
            }
            comment.parent = parentComment;
            const savedComment = await this.commentsRepository.save(comment);
            if (parentComment.author.id !== user.id) {
                await this.notificationsService.createCommentReplyNotification(parentComment.author, savedComment);
            }
            return savedComment;
        }
        return this.commentsRepository.save(comment);
    }
    async findAll(includeDeleted = false) {
        const query = this.commentsRepository.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.author', 'author')
            .leftJoinAndSelect('comment.replies', 'replies')
            .leftJoinAndSelect('replies.author', 'replyAuthor')
            .where('comment.parent IS NULL');
        if (!includeDeleted) {
            query.andWhere('comment.isDeleted = :isDeleted', { isDeleted: false });
            query.andWhere('replies.isDeleted = :isDeleted', { isDeleted: false });
        }
        return query.getMany();
    }
    async findOne(id) {
        const comment = await this.commentsRepository.findOne({
            where: { id },
            relations: ['author', 'parent', 'replies', 'replies.author'],
        });
        if (!comment) {
            throw new common_1.NotFoundException(`Comment with ID ${id} not found`);
        }
        return comment;
    }
    async update(id, updateCommentDto, user) {
        const comment = await this.findOne(id);
        if (comment.author.id !== user.id) {
            throw new common_1.ForbiddenException('You can only edit your own comments');
        }
        if (!comment.canBeEdited()) {
            throw new common_1.ForbiddenException('Comments can only be edited within 15 minutes of posting');
        }
        comment.content = updateCommentDto.content;
        return this.commentsRepository.save(comment);
    }
    async softDelete(id, user) {
        const comment = await this.findOne(id);
        if (comment.author.id !== user.id) {
            throw new common_1.ForbiddenException('You can only delete your own comments');
        }
        comment.isDeleted = true;
        comment.deletedAt = new Date();
        return this.commentsRepository.save(comment);
    }
    async restore(id, user) {
        const comment = await this.findOne(id);
        if (comment.author.id !== user.id) {
            throw new common_1.ForbiddenException('You can only restore your own comments');
        }
        if (!comment.canBeRestored()) {
            throw new common_1.ForbiddenException('Comments can only be restored within 15 minutes of deletion');
        }
        comment.isDeleted = false;
        comment.deletedAt = null;
        return this.commentsRepository.save(comment);
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], CommentsService);
//# sourceMappingURL=comments.service.js.map