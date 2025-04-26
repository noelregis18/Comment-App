import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Comment Entity
 * 
 * Represents a comment in the discussion system with support for:
 * - Nested replies (hierarchical comment structure)
 * - Soft deletion with restoration capability
 * - Edit tracking with time restrictions
 * - User authorship
 */
@Entity('comments')
export class Comment {
  /**
   * Unique identifier for the comment using UUID format
   * Provides better security and distribution capabilities than sequential IDs
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The actual text content of the comment
   * Stored as text type to accommodate longer comments
   */
  @Column({ type: 'text' })
  content: string;

  /**
   * Relationship to the User who authored this comment
   * Many comments can belong to one user
   */
  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'author_id' })
  author: User;

  /**
   * Self-referencing relation for implementing nested comments (replies)
   * A comment can have a parent comment (if it's a reply)
   * When parent is deleted, all child comments are automatically deleted (CASCADE)
   */
  @ManyToOne(() => Comment, comment => comment.replies, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: Comment | null;

  /**
   * Collection of reply comments to this comment
   * Enables traversal of the comment tree from parent to children
   */
  @OneToMany(() => Comment, comment => comment.parent)
  replies: Comment[];

  /**
   * Soft deletion flag to preserve comment data while hiding from UI
   * When true, comment appears as "deleted" but data remains in database
   */
  @Column({ default: false })
  isDeleted: boolean;

  /**
   * Timestamp when the comment was soft-deleted
   * Used to determine if restoration is possible within time limit
   */
  @Column({ nullable: true, type: 'datetime' })
  deletedAt: Date | null;

  /**
   * Automatically tracks when the comment was created
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Automatically updates whenever the comment entity is modified
   */
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Determines if the comment can be edited by the user
   * Editing is allowed only within 15 minutes of posting and if not deleted
   * 
   * @returns boolean indicating if the comment can be edited
   */
  canBeEdited(): boolean {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    return !this.isDeleted && this.createdAt > fifteenMinutesAgo;
  }

  /**
   * Determines if a deleted comment can be restored
   * Restoration is allowed only within 15 minutes of deletion
   * 
   * @returns boolean indicating if the comment can be restored
   */
  canBeRestored(): boolean {
    if (!this.isDeleted || !this.deletedAt) return false;
    
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    return this.deletedAt > fifteenMinutesAgo;
  }
} 