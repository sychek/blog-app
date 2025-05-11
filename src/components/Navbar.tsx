"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

const Navbar = () => {
  const { data: session, status } = useSession();

  const handleLogout = () => {
    signOut();
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
      <Link href="/">
        <span className="text-xl font-bold">
          MyBlog
        </span>
      </Link>
      <div className="space-x-4">
        {status === "authenticated" ? (
          <>
            <span>
              Welcome,{" "}
              {session.user.firstName}
            </span>
            <Link href="/posts">
              <span className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded">
                My posts
              </span>
            </Link>
            <Link href="/profile">
              <span className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded">
                Profile
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
            >
              Logout
            </button>
          </>
        )
          : (
            <>
              <Link href="/login">
                <span className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
                  Login
                </span>
              </Link>
            </>
          )}
      </div>
    </nav>
  );
};
export default Navbar;
