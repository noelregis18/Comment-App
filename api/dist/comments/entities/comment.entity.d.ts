import { User } from '../../users/entities/user.entity';
export declare class Comment {
    id: string;
    content: string;
    author: User;
    parent: Comment | null;
    replies: Comment[];
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    canBeEdited(): boolean;
    canBeRestored(): boolean;
}
