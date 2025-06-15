"use client";

import NoProfile from "@/components/NoProfile";
import ProfileLoader from "@/components/ProfileLoader";
import deleteUser from "@/libs/actions/user/delete-user";
import getUser from "@/libs/actions/user/get-user";
import recordDeletedUser from "@/libs/actions/user/record-deleted-user";
import { String } from "@/utils/string";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TerminateUserAccountPage({ params }: any) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState("");
  const [deleted, setDeleted] = useState(false);
  // Mock user data
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const handleDeleteUser = async (ev: FormEvent<HTMLFormElement>) => {
    setIsDeleting(true);
    setError("");

    try {
      if (user) {
        const reason = new FormData(ev.currentTarget).get("reasons") as string;

        await deleteUser(user.id);

        await recordDeletedUser({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          reason,
        });

        setDeleted(true);
      }
    } catch {
      setError("Failed to delete user. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowConfirmDialog(false);
    }
  };

  const runUserAccountTermination = async () => {
    try {
      const _params = await params;
      const _user = await getUser(_params.id);
      setIsLoading(false);

      if (!_user) return;
      setUser(_user.data);
    } catch (err) {
      alert("Error: " + err);
    }
  };

  useEffect(() => {
    runUserAccountTermination();
  }, []);

  const ConfirmDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <form onSubmit={handleDeleteUser}>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete User Account
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <strong>
                {user!.first_name} {user!.last_name}
              </strong>
              ? This action cannot be undone and will permanently remove all
              user data.
            </p>
            <textarea
              name="reasons"
              id=""
              placeholder={
                "Please let us know why you want your account deleted. Your feedback is valuable and will help us improve our service. Thank you"
              }
              style={{
                resize: "none",
                width: "90%",
                height: "200px",
                margin: "20px 0",
                color: "black",
                border: "2px solid grey",
                borderRadius: "10px",
                padding: "8px",
                fontSize: "16px",
              }}
            ></textarea>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete User"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (deleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            User Deleted Successfully
          </h2>
          <p className="text-gray-600 mb-6">
            The user account has been permanently removed.
          </p>
          <button
            onClick={() => {
              setDeleted(false);
              setError("");
              setUser(null);
              router.replace("/");
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              alert("Are you sure you want to cancel?");
              router.replace("/");
            }}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 cursor-pointer"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Delete User</h1>
          <p className="mt-2 text-gray-600">
            Review user information before proceeding with deletion.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* User Information Card */}
        {(!isLoading &&
          (user ? (
            <>
              <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    User Information
                  </h2>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">
                        {String.getInitials(`${user.first_name} ${user.last_name}`)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Full Name
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Email Address
                      </label>
                      <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        User ID
                      </label>
                      <p className="mt-1 text-sm text-gray-900">{user.id}</p>
                    </div>
                    {/* <div>
                            <label className="block text-sm font-medium text-gray-500">Role</label>
                            <p className="mt-1 text-sm text-gray-900">{user.role}</p>
                        </div> */}
                  </div>
                </div>
              </div>

              {/* Warning Box */}
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Warning
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        This action will permanently delete the user account and
                        cannot be undone. This includes:
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>User profile and personal information</li>
                        <li>Account settings and preferences</li>
                        <li>Associated data and activity history</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => alert("Are you sure you want to cancel?")}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  className="px-6 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete User
                </button>
              </div>
            </>
          ) : (
            <NoProfile />
          ))) || <ProfileLoader />}

        {/* Confirmation Dialog */}
        {showConfirmDialog && user && <ConfirmDialog />}
      </div>
    </div>
  );
}
