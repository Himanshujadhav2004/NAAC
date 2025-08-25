"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await axios.post(
        "https://rk09x7vo2l.execute-api.ap-south-1.amazonaws.com/dev/resetPassword",
        {
          userName: userName,
          oldPassword: oldPassword,
          newPassword: newPassword,
        }
      );

      const { message } = response.data;

      setSuccessMsg(message || "Password reset successfully!");
      
      // Clear form fields
      setUserName("");
      setOldPassword("");
      setNewPassword("");

      console.log("✅ Password reset successful:", message);
      
      // Optionally redirect to login page after a delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      
    } catch (error: unknown) {
  console.error("❌ Password reset failed:", error);

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const err = error as { response?: { data?: { message?: string } } };
    setErrorMsg(err.response?.data?.message || "Password reset failed. Please try again.");
  } else if (error instanceof Error) {
    setErrorMsg(error.message);
  } else {
    setErrorMsg("Password reset failed. Please try again.");
  }} finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>
            Enter your username, current password, and new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="oldPassword">Current Password</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  placeholder="Enter your current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              {errorMsg && (
                <p className="text-sm text-red-500 text-center">{errorMsg}</p>
              )}
              {successMsg && (
                <p className="text-sm text-green-500 text-center">{successMsg}</p>
              )}
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Resetting Password..." : "Reset Password"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Remember your password?{" "}
              <Link href="/login" passHref>
                <span className="underline underline-offset-4">Login</span>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 