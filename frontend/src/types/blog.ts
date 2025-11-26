export interface Post {
  author: string;
  postId: number;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  commentCount: number;
}

export interface Profile {
  author: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  joinedAt: number;
}

export interface Comment {
  commenter: string;
  postAuthor: string;
  postId: number;
  commentId: number;
  content: string;
  createdAt: number;
}

export interface BlogAccount {
  author: string;
  postCount: number;
}
