'use client';

import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';
import { Post } from "@/generated/prisma/client";

export default function CreatePostPage() {
  const router = useRouter();
  const createPost = trpc.post.createPost.useMutation();
  const [form, setForm] = useState({
    title: '',
    description: '',
    body: '',
  } as Post);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPost.mutateAsync(form);
      router.push('/');
    } catch (err) {
      console.error(err);
      alert('Failed to create post');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 space-y-4">
      <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="w-full border p-2" />
      <input name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full border p-2" />
      <textarea name="body" value={form.body} onChange={handleChange} placeholder="Body" className="w-full border p-2 h-40" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Publish</button>
    </form>
  );
}

