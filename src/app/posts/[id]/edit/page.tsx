'use client';

import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { useState, useEffect, use } from 'react';

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

const EditPostPage = (props: EditPostPageProps) => {
  const params = use(props.params);
  const postId = params.id;
  const router = useRouter();
  const { data: post, isLoading } = trpc.post.getPostById.useQuery({ id: postId });
  const updatePost = trpc.post.updatePost.useMutation();

  const [form, setForm] = useState({ title: '', body: '', description: '' });

  useEffect(() => {
    if (post) {
      setForm({ title: post.title, body: post.body, description: post.description || '' });
    }
  }, [post]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePost.mutateAsync({ id: postId, ...form });
      router.push(`/posts/${postId}`);
    } catch (err) {
      console.error(err);
      alert('Failed to update post');
    }
  };

  if (isLoading) return <p>Loading post...</p>;
  if (!post) return <p>Post not found</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 space-y-4">
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Title"
        className="w-full border p-2"
      />
      <input
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full border p-2"
      />
      <textarea
        name="body"
        value={form.body}
        onChange={handleChange}
        placeholder="Body"
        className="w-full border p-2 h-40"
      />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Update</button>
    </form>
  );
}

export default EditPostPage;
