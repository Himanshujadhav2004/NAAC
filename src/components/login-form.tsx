"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AxiosError } from "axios";
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
import { jwtDecode as jwt_decode } from 'jwt-decode';
type VerifyOtpResponse = {
  token: string;
  collegeId: string;
};

type DecodedToken = {
  sub?: string;
  email: string;
  aisheId: string;  // Changed from 'collegeId' to 'aisheId'
  role?: string;
  sessionId?: string;
  exp: number;
  iat: number;
};


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [tempToken, setTempToken] = useState("");
const [successMsg, setSuccessMsg] = useState("");

  // Step 1: Login to request OTP
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await axios.post(
        `https://${process.env.API}.execute-api.ap-south-1.amazonaws.com/dev/login/step1`,
        {
          
          email: email,
          password,
        }
      );

      const { message, tempToken } = response.data;

      console.log("✅ Step1 success:", message);
      setTempToken(tempToken);
      setStep(2);
    } catch (error: unknown) {
  console.error("❌ Step1 failed:", error);

  if (error instanceof AxiosError) {
    setErrorMsg(error.response?.data?.message || "Login failed. Try again.");
  } else if (error instanceof Error) {
    setErrorMsg(error.message);
  } else {
    setErrorMsg("Login failed. Try again.");
  }
} finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
 // Step 2: Verify OTP
const handleVerifyOtp = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setErrorMsg("");

  try {
    const response = await axios.post<VerifyOtpResponse>(
      `https://${process.env.API}.execute-api.ap-south-1.amazonaws.com/dev/login/step2`,
      {
        totpToken: otp,
        forceNew: true,
      },
      {
        headers: {
          Authorization: `Bearer ${tempToken}`,
        },
      }
    );

    const { token } = response.data;

    console.log("📥 Received token:", response.data);

    // ✅ Decode token here
    const decoded: DecodedToken = jwt_decode(token);
    console.log("🔍 Decoded token:", decoded);

    // ✅ Fixed: Use 'aisheId' instead of 'collegeId'
    localStorage.setItem("token", token);
    localStorage.setItem("userName", decoded.email || email);
    localStorage.setItem("collegeId", decoded.aisheId || collegeId); // Changed from decoded.collegeId to decoded.aisheId
    localStorage.setItem("role", decoded.role || "");
    
    const getcollegeID = localStorage.getItem("collegeId");
    console.log("Retrieved collegeId from localStorage:", getcollegeID);

    console.log("✅ Login successful, token & decoded data stored.");
    setSuccessMsg("Login successful!");
    router.push("/dashboard");
  } catch (error: unknown) {
    console.error("❌ OTP verification failed:", error);

    if (error instanceof AxiosError) {
      setErrorMsg(error.response?.data?.message || "Invalid OTP. Please try again.");
    } else if (error instanceof Error) {
      setErrorMsg(error.message);
    } else {
      setErrorMsg("Invalid OTP. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            {step === 1
              ? "Enter your credentials to get OTP"
              : "Enter the 6-digit code from your authenticator app "}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="Enter username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {errorMsg && (
                  <p className="text-sm text-red-500 text-center">{errorMsg}</p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Processing..." : "Get OTP"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
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

                {errorMsg && (
                  <p className="text-sm text-red-500 text-center">{errorMsg}</p>
                )}
                {successMsg && (
                  <p className="text-sm text-green-500 text-center">{successMsg}</p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              </div>
            </form>
          )}

          {step === 1 && (
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" passHref>
                <span className="underline underline-offset-4">Sign Up</span>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
