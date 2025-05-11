'use client';

import { format } from "date-fns";
import { trpc } from "@/lib/trpc";
import { CommentForm } from "./CommentForm";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Props = {
  postId: string;
};

export const Comments = ({ postId }: Props) => {
  const { data: session } = useSession();
  const { data: comments, isLoading, isError, error } = trpc.comment.getCommentsByPostId.useQuery({ postId });
  const utils = trpc.useUtils();

  const deleteCommentMutation = trpc.comment.deleteComment.useMutation({
    onSuccess: async () => {
      await utils.comment.getCommentsByPostId.invalidate({ postId });
    },
    onError: (error) => {
      alert(error.message || "Failed to delete comment");
    },
  });

  const deleteComment = ({ id }: { id: string }) => {
    deleteCommentMutation.mutate({ id });
  }

  if (isLoading) {
    return <p>Loading comments...</p>;
  }

  if (isError) {
    return <p className="text-red-500">{error.message || "Failed to load comments"}</p>;
  }

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Comments</h2>

      {comments?.length === 0 ? (
        <p>No comments yet. Be the first to comment!</p>
      ) : (
        <ul className="space-y-4">
          {comments?.map((comment) => (
            <li key={comment.id} className="border p-4 rounded shadow">
              By <Link
                href={`/authors/${comment.authorId}`}
                className="font-semibold hover:underline"
              >
                {comment.name}
              </Link>
              <p>{comment.body}</p>
              <p className="text-xs text-gray-500">
                {format(new Date(comment.createdAt), "PPP p")}
              </p>

              {session?.user?.id === comment.authorId && (
                <button
                  onClick={() => deleteComment(comment)}
                  className="mt-2 text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <CommentForm postId={postId} />
    </section>
  );
};

