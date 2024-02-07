export interface CommentDto {
    id: number;
    text: string;
    postId: number;
    isDeletable: boolean;
    timestamp: Date;
}
