"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { logoutAction } from "../actions/auth";
import { useAuth } from "../providers/auth-provider";

export default function DashboardPage() {
  const router = useRouter();
  const { authState, logout } = useAuth();
  const { user, isAuthenticated, isLoading } = authState;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleClientLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex space-x-4">
            <button
              onClick={handleClientLogout}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Logout (Client)
            </button>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Logout (Server)
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-6">
          <h2 className="mb-4 text-xl font-semibold">User Information</h2>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Name:</span>{" "}
              {user.fullName || "N/A"}
            </p>
            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-medium">Role:</span>{" "}
              {user.isAdmin ? "Admin" : "User"}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-gray-50 p-6">
          <h2 className="mb-4 text-xl font-semibold">
            Welcome to your Dashboard
          </h2>
          <p className="text-gray-600">
            You are now logged in. This is a protected page that only
            authenticated users can access.
          </p>
        </div>
      </div>
    </div>
  );
}
