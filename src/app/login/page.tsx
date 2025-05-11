'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      setError(result.error);
      return;
    }

    const session = await getSession();

    if (session?.user) {
      router.push('/');
    } else {
      setError('Login failed. No session returned.');
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold text-center">Login</h2>
      <input
        type="text"
        placeholder="Username"
        className="w-full border p-2 rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full border p-2 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      <button type="submit" className="bg-blue-600 text-white p-2 rounded w-full">
        Login
      </button>

      <div className="flex justify-between text-sm">
        <Link href="/register" className="text-blue-600 hover:underline">
          Create account
        </Link>
        <Link href="/login/forgot-password" className="text-blue-600 hover:underline">
          Forgot password?
        </Link>
      </div>
    </form>
  );
};

export default LoginPage;

