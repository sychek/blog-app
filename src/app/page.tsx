import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import PostList from "@/components/Post";
import { authOptions } from "@/utils/auth";

type Props = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

export default async function HomePage(props: Props) {
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
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { firstName: true } } },
    }),
    prisma.post.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>

      <PostList posts={posts} page={page} totalPages={totalPages} />
    </main>
  );
}

