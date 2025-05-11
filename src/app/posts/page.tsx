import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import PostList from "@/components/Post";

type Props = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

export default async function MyPostsPage(props: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect("/login");
  }

  const searchParams = await props.searchParams;
  const page = parseInt(searchParams?.page || "1", 10);
  const limit = 5;
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: session?.user?.id },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.post.count({
      where: { authorId: session?.user?.id },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Posts</h1>
        <Link
          href="/posts/create"
          className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition"
        >
          <span className="text-lg">+</span> Create Post
        </Link>
      </div>

      <PostList posts={posts} page={page} totalPages={totalPages} author={session.user} />
    </main>
  );
}

