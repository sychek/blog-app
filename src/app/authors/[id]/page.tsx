import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PostList from "@/components/Post";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    page?: string;
  }>;
};

export default async function AuthorPage(props: Props) {
  const { params, searchParams } = props;
  const { id } = await params;
  const searchParamsData = await searchParams;
  const page = parseInt(searchParamsData?.page || "1", 10);
  const limit = 5; // Number of posts per page
  const skip = (page - 1) * limit;

  const [author, total] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        firstName: true,
        posts: {
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.post.count({
      where: { authorId: id },
    }),
  ]);

  if (!author) return notFound();

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Posts by {author.firstName}</h1>

      <PostList posts={author.posts} author={{ firstName: author.firstName || '' }} totalPages={totalPages} page={page} />
    </main>
  );
}

