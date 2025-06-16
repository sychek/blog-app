import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { Comments } from "@/components/Comments";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/utils/auth";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PostPage(props: Props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect("/login");
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { firstName: true, email: true } },
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { firstName: true } },
        },
      },
    },
  });

  if (!post) return notFound();

  const isAuthor = session?.user?.id === post.authorId;

  return (
    <main className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">
        {post.title}
        {isAuthor && (
          <Link
            href={`/posts/${post.id}/edit`}
            className="ml-2 text-sm inline-block text-blue-600 hover:underline"
          >
            ✏️ Edit
          </Link>
        )}
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        By {post.author?.firstName ?? "Unknown author"} ·{" "}
        {format(new Date(post.createdAt), "PPP p")}
      </p>
      <p className="text-lg text-gray-700 mb-4">
        {post.description}
      </p>
      <article className="prose max-w-none whitespace-pre-line">
        {post.body}
      </article>

      <p className="text-gray-500 text-sm my-6">
        Last updated: {format(new Date(post.updatedAt), "PPP p")}
      </p>

      <section className="mt-8">
        <Comments postId={post.id} />
      </section>
    </main>
  );
}

