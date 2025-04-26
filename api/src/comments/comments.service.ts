import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * Comments Service
 * 
 * Handles all business logic related to creating, retrieving, updating,
 * and managing comment lifecycle. Implements features like:
 * - Comment creation with notification support for replies
 * - Hierarchical comment structure with parent-child relationships
 * - Soft deletion with time-limited restoration
 * - Comment moderation and access control
 */
@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Creates a new comment or reply
   * 
   * If parentId is provided, sets up a parent-child relationship
   * and triggers notifications for the parent comment author
   * 
   * @param createCommentDto DTO containing content and optional parentId
   * @param user The authenticated user creating the comment
   * @returns The newly created comment entity
   */
  async create(createCommentDto: CreateCommentDto, user: User): Promise<Comment> {
    const comment = this.commentsRepository.create({
      content: createCommentDto.content,
      author: user,
    });

    // If this is a reply, set the parent and create notification
    if (createCommentDto.parentId) {
      const parentComment = await this.commentsRepository.findOne({
        where: { id: createCommentDto.parentId },
        relations: ['author'],
      });

      if (!parentComment) {
        throw new NotFoundException(`Parent comment with ID ${createCommentDto.parentId} not found`);
      }

      comment.parent = parentComment;
      
      // Save the comment first
      const savedComment = await this.commentsRepository.save(comment);
      
      // Create notification for the parent comment's author (if it's a different user)
      if (parentComment.author.id !== user.id) {
        await this.notificationsService.createCommentReplyNotification(
          parentComment.author,
          savedComment,
        );
      }
      
      return savedComment;
    }

    return this.commentsRepository.save(comment);
  }

  /**
   * Retrieves all root-level comments with their replies
   * 
   * Uses a query builder to fetch only top-level comments (without parents)
   * and their immediate replies in a single query, optimizing performance
   * 
   * @param includeDeleted When true, includes soft-deleted comments in results
   * @returns Array of comment entities with their nested replies
   */
  async findAll(includeDeleted = false): Promise<Comment[]> {
    // Fetch only root comments (comments without a parent)
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

  /**
   * Retrieves a single comment by ID with all related entities
   * 
   * Loads the comment with its author, parent, replies and reply authors
   * 
   * @param id UUID of the comment to retrieve
   * @returns The found comment entity with all relations
   * @throws NotFoundException if comment doesn't exist
   */
  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['author', 'parent', 'replies', 'replies.author'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  /**
   * Updates a comment's content
   * 
   * Enforces business rules:
   * - Only the author can edit their comment
   * - Comments can only be edited within 15 minutes of creation
   * 
   * @param id UUID of the comment to update
   * @param updateCommentDto DTO containing the updated content
   * @param user The authenticated user attempting the update
   * @returns The updated comment entity
   * @throws ForbiddenException if user is not the author or edit window has passed
   */
  async update(id: string, updateCommentDto: UpdateCommentDto, user: User): Promise<Comment> {
    const comment = await this.findOne(id);

    // Check if user is the author
    if (comment.author.id !== user.id) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    // Check if comment can be edited (within 15 minutes of posting)
    if (!comment.canBeEdited()) {
      throw new ForbiddenException('Comments can only be edited within 15 minutes of posting');
    }

    // Update the content
    comment.content = updateCommentDto.content;
    
    return this.commentsRepository.save(comment);
  }

  /**
   * Soft deletes a comment
   * 
   * Instead of removing from database, marks as deleted and sets deletion timestamp
   * This preserves the comment's data while hiding it from normal view
   * 
   * @param id UUID of the comment to soft delete
   * @param user The authenticated user attempting the deletion
   * @returns The soft-deleted comment entity
   * @throws ForbiddenException if user is not the author
   */
  async softDelete(id: string, user: User): Promise<Comment> {
    const comment = await this.findOne(id);

    // Check if user is the author
    if (comment.author.id !== user.id) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Soft delete the comment
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    
    return this.commentsRepository.save(comment);
  }

  /**
   * Restores a previously soft-deleted comment
   * 
   * Enforces business rules:
   * - Only the author can restore their comment
   * - Comments can only be restored within 15 minutes of deletion
   * 
   * @param id UUID of the comment to restore
   * @param user The authenticated user attempting the restoration
   * @returns The restored comment entity
   * @throws ForbiddenException if user is not the author or restoration window has passed
   */
  async restore(id: string, user: User): Promise<Comment> {
    const comment = await this.findOne(id);

    // Check if user is the author
    if (comment.author.id !== user.id) {
      throw new ForbiddenException('You can only restore your own comments');
    }

    // Check if comment can be restored (within 15 minutes of deletion)
    if (!comment.canBeRestored()) {
      throw new ForbiddenException('Comments can only be restored within 15 minutes of deletion');
    }

    // Restore the comment
    comment.isDeleted = false;
    comment.deletedAt = null;
    
    return this.commentsRepository.save(comment);
  }
} 