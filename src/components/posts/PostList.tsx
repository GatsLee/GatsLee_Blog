import Link from "next/link";
import { Folder, ChevronRight } from "lucide-react";

interface PostItem {
  id: number;
  title: string;
  slug: string;
  category: string;
  content: string;
  createdAt: string;
}

export default function PostList({
  posts,
  basePath,
  directoryPath,
}: {
  posts: PostItem[];
  basePath: string;
  directoryPath: string;
}) {
  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl text-[#d4d4dc] font-bold flex items-center tracking-tight">
          <Folder className="mr-2" size={20} />
          {directoryPath}
        </h2>
        <span className="text-xs font-mono text-[#8888a0]">
          {posts.length} FILES FOUND
        </span>
      </div>

      <div className="grid gap-px bg-[#2e2e4a] border border-[#2e2e4a] rounded-lg overflow-hidden">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`${basePath}/${post.slug}`}
            className="group bg-[#1a1a2e] p-6 cursor-pointer hover:bg-[#22223a] transition-all duration-200 relative overflow-hidden block"
          >
            <div className="absolute top-0 left-0 w-1 h-0 bg-[#d4a054] group-hover:h-full transition-all duration-300" />
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-[#b0b0bc] group-hover:text-[#d4d4dc] transition-colors font-mono">
                {post.title}
              </h3>
              <span className="text-xs text-[#5a5a72] font-mono group-hover:text-[#8888a0]">
                {new Date(post.createdAt).toISOString().split("T")[0]}
              </span>
            </div>
            <p className="text-[#8888a0] text-sm line-clamp-2 font-light leading-relaxed mb-4">
              {post.content}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-[#8888a0] border border-[#2e2e4a] rounded px-2 py-1 flex items-center gap-1">
                READ_FILE <ChevronRight size={10} />
              </span>
            </div>
          </Link>
        ))}
        {posts.length === 0 && (
          <div className="bg-[#1a1a2e] p-12 text-center text-[#5a5a72] font-mono">
            DIRECTORY IS EMPTY
          </div>
        )}
      </div>
    </div>
  );
}
