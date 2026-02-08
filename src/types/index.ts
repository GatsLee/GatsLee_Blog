export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  tags: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  postId: number;
  author: string;
  content: string;
  createdAt: string;
}

export interface GuestbookEntry {
  id: number;
  author: string;
  message: string;
  createdAt: string;
}
