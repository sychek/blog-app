import Link from "next/link";
import { format } from "date-fns";
import { Post } from "@/generated/prisma/client";

type PostListProps = {
  posts: Post[],
  page: number,
  totalPages: number
  author?: { firstName?: string }
}

type PostListItemProps = {
  post: Post & {
    author?: { firstName: string }
  },
  author?: { firstName: string }
}

export default function PostList({ posts, page, totalPages }: PostListProps) {
  return (
    <div>
      <ul className="space-y-4">
        {posts?.map((post) => (
          <PostListItem key={post.id} post={post} />
        ))}
      </ul>

      <div className="mt-8 flex justify-between text-sm">
        <a
          href={`/?page=${page - 1}`}
          className={`px-4 py-2 border border-gray-200 rounded ${page <= 1 ? "opacity-50 pointer-events-none" : ""}`}
        >
          Previous
        </a>
        <span>
          Page {page} of {totalPages}
        </span>
        <a
          href={`/?page=${page + 1}`}
          className={`px-4 py-2 border border-gray-200 rounded ${page >= totalPages ? "opacity-50 pointer-events-none" : ""}`}
        >
          Next
        </a>
      </div>
    </div>
  )
}

const PostListItem = ({ post, author }: PostListItemProps) => {
  const displayAuthor = post.author ?? author;

  return (
    <li className="border p-4 rounded shadow">
      <Link
        href={`/posts/${post.id}`}
        className="text-xl font-semibold hover:underline"
      >
        {post.title}
      </Link>
      <p className="">
        {post.description}
      </p>
      <p className="text-gray-600 text-sm">
        By{" "}
        {displayAuthor ? (
          <Link
            href={`/authors/${post.authorId}`}
            className="text-blue-600 hover:underline"
          >
            {displayAuthor.firstName}
          </Link>
        ) : (
          "Unknown"
        )}{" "}
        · {format(new Date(post.createdAt), "PPP")}
      </p>
    </li>
  );
}

