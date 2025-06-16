'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { signIn, getSession } from 'next-auth/react';
import Link from 'next/link';

const RegisterPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const registerMutation = trpc.user.register.useMutation({
    onSuccess: () => {
      setError('');
      const login = async () => {
        const result = await signIn('credentials', {
          redirect: false,
          username: form.username,
          password: form.password,
        });

        if (result?.error) {
          setError(result.error);
          return;
        }

        const session = await getSession();

        if (session?.user) {
          router.push('/');
        } else {
          router.push('/login');
        }
      }

      login();

    },
    onError: (error) => {
      setError(error.message || 'Registration failed');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password, confirmPassword, username } = form;

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      registerMutation.mutate({ email, password, username });
    } catch (err) {
      setError('Something went wrong');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="username"
          value={form.username}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Register
        </button>
        <div className="flex justify-between text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">
            Already have an account?
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;

