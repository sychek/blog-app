'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetPassword = trpc.user.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess('Password reset successfully! You can now log in.');
      setTimeout(() => router.push('/login'), 2000);
    },
    onError: (err) => {
      setError(err.message || 'Failed to reset password.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid or missing token.');
      return;
    }

    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    resetPassword.mutate({ token, newPassword });
  };

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-center">Reset Password</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Reset Password
        </button>
      </form>
    </main>
  );
}

