"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// 🔹 Password validation function (same as signup)
const validatePassword = (password: string) => {
  const validations = {
    length: password.length >= 8 && password.length <= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /\d/.test(password),
    symbol: /[@#%\-_]/.test(password),
  };

  return {
    isValid: Object.values(validations).every(Boolean),
    validations,
  };
};

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1=email, 2=OTP, 3=new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    validations: {
      length: false,
      uppercase: false,
      lowercase: false,
      digit: false,
      symbol: false,
    },
  });

  // Reset messages when step changes
  useEffect(() => {
    setErrorMsg("");
    setSuccessMsg("");
  }, [step]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPass = e.target.value;
    setNewPassword(newPass);
    setPasswordValidation(validatePassword(newPass));
  };

  // Step 1: Send email → get tempToken
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await axios.post(
        `https://${process.env.API}.execute-api.ap-south-1.amazonaws.com/dev/forgot-password/step1`,
        { email }
      );
      setTempToken(res.data.tempToken);
      setSuccessMsg(res.data.message || "OTP sent to your email.");
      setStep(2);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        setErrorMsg(error.response?.data?.message || "Failed to send OTP.");
      } else if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("Failed to send OTP.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await axios.post(
        `https://${process.env.API}.execute-api.ap-south-1.amazonaws.com/dev/forgot-password/step2`,
        { totpToken: otp },
        { headers: { Authorization: `Bearer ${tempToken}` } }
      );
      setTempToken(res.data.tempToken);
      setSuccessMsg(res.data.message || "OTP verified. Please set new password.");
      setStep(3);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        setErrorMsg(error.response?.data?.message || "Invalid OTP.");
      } else if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("Invalid OTP.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    if (!passwordValidation.isValid) {
      setLoading(false);
      setErrorMsg("Password does not meet the requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLoading(false);
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post(
        `https://${process.env.API}.execute-api.ap-south-1.amazonaws.com/dev/forgot-password/step3`,
        { newPassword },
        { headers: { Authorization: `Bearer ${tempToken}` } }
      );
      setSuccessMsg(res.data.message || "Password updated successfully!");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        setErrorMsg(error.response?.data?.message || "Failed to reset password.");
      } else if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg("Failed to reset password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            {step === 1 && "Enter your email to receive OTP."}
            {step === 2 && "Enter the 6-digit OTP sent to your email."}
            {step === 3 && "Set your new password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleStep1}>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {errorMsg && <p className="text-sm mt-2 text-center text-red-500">{errorMsg}</p>}
              {successMsg && <p className="text-sm mt-2 text-center text-green-500">{successMsg}</p>}
              <Button type="submit" className="mt-4 w-full" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </Button>
              <div className="mt-4 text-center text-sm">
                Remember your password?{" "}
                <Link href="/login" passHref>
                  <span className="underline underline-offset-4">Login</span>
                </Link>
              </div>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleStep2}>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {errorMsg && <p className="text-sm mt-2 text-center text-red-500">{errorMsg}</p>}
              {successMsg && <p className="text-sm mt-2 text-center text-green-500">{successMsg}</p>}
              <Button type="submit" className="mt-4 w-full" disabled={loading}>
                {loading ? "Verifying OTP..." : "Verify OTP"}
              </Button>
              <div className="flex justify-between text-sm">
                <button type="button" onClick={() => setStep(1)} className="text-blue-600 mt-2 cursor-pointer">
                  ← Back
                </button>
              </div>
            </form>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <form onSubmit={handleStep3}>
              <div className="grid gap-3">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={handlePasswordChange}
                  required
                />
                {newPassword && (
                  <p className="text-xs text-gray-500">
                    Password must contain: 8-12 characters, one uppercase letter, one lowercase letter, one digit, one symbol (@, #, %, -, _)
                  </p>
                )}

                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-600 text-sm">Passwords do not match</p>
                )}
              </div>
              {errorMsg && <p className="text-sm mt-2 text-center text-red-500">{errorMsg}</p>}
              {successMsg && <p className="text-sm mt-2 text-center text-green-500">{successMsg}</p>}
              <Button
                type="submit"
                className="mt-4 w-full"
                disabled={loading || !passwordValidation.isValid || newPassword !== confirmPassword}
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
              <div className="flex justify-between text-sm">
                <button type="button" onClick={() => setStep(2)} className="text-blue-600 mt-2 cursor-pointer">
                  ← Back
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
