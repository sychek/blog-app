'use client';

import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

type Props = {
  postId: string
}

export const CommentForm = ({ postId }: Props) => {
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const utils = trpc.useUtils();
  const { status } = useSession();

  const createComment = trpc.comment.createComment.useMutation({
    onSuccess: () => {
      setComment("");
      setName("");
      utils.comment.getCommentsByPostId.invalidate({ postId });
    },
    onError: (error) => {
      alert(error.message || "Failed to add comment");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);

    createComment.mutate({ postId, body: comment, name });

    setLoading(false);
  };

  if (status !== "authenticated") return <div>Please <Link href='/login'>log in</Link> to leave a comment.</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <input
        type="text"
        placeholder="Name"
        className="w-full p-2 border rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        placeholder="Write a comment..."
        className="w-full p-2 border rounded"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Adding..." : "Add Comment"}
      </button>
    </form>
  );
};
