'use client';

import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { Gender } from "@/generated/prisma/client";

const ProfilePage = () => {
  const { data: user } = trpc.profile.getProfile.useQuery();

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    age: user?.age?.toString() || "",
    gender: user?.gender || "",
    address: user?.address || "",
    website: user?.website,
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        age: user.age?.toString() || "",
        gender: user.gender || "",
        address: user.address || "",
        website: user.website,
      });
    }
  }, [user]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userDetailsError, setUserDetailsError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const updateUserDetails = trpc.profile.updateUserDetails.useMutation();
  const updatePassword = trpc.profile.updatePassword.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const parseError = (error: any) => {
    try {
      const message = JSON.parse(error.message);
      if (Array.isArray(message)) {
        return message.map((err: { message: string }) => err.message).join(", ");
      }
    } catch (e) {
      console.error(e);
      return error.message;
    }
  };

  const handleUserDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUserDetailsError(null);
      await updateUserDetails.mutateAsync({
        ...form,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender as Gender,
        website: form.website || undefined,
      });
      alert("User details updated!");
    } catch (error: any) {
      setUserDetailsError(parseError(error));
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setPasswordError(null);
      setPasswordSuccess(null);
      await updatePassword.mutateAsync({ currentPassword, newPassword });
      setPasswordSuccess("Password updated successfully!");
    } catch (error: any) {
      setPasswordError(parseError(error));
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold">User Details</h2>
        <form onSubmit={handleUserDetailsSubmit} className="space-y-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={form.age}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="url"
            name="website"
            placeholder="Website"
            value={form.website || ''}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="username"
            value={user.username}
            readOnly
            disabled
            className="w-full p-2 border rounded"
          />
          <input
            type="email"
            name="email"
            value={user.email}
            readOnly
            disabled
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Update Details
          </button>
          {userDetailsError && <p className="text-red-500">{userDetailsError}</p>}
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <input
            type="password"
            name="currentPassword"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Change Password
          </button>
          {passwordError && <p className="text-red-500">{passwordError}</p>}
          {passwordSuccess && <p className="text-green-500">{passwordSuccess}</p>}
        </form>
      </section>
    </main>
  );
}

export default ProfilePage;
