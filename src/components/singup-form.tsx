"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link';
import axios from 'axios'
import { AxiosError } from "axios"
import { useState } from "react"
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [role, setRole] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Form, 2: QR Code, 3: OTP
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [tempToken, setTempToken] = useState('');

  const handleRoleChange = (value: string) => {
    setRole(value);
  }

  // Step 1: Initial signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'https://2m9lwu9f0d.execute-api.ap-south-1.amazonaws.com/dev/register',
        {
          userName: email,
          password: password,
          collegeId: collegeId,
          role: role
        }
      );

      setSuccess("Registration successful! Please scan the QR code below.");
      console.log("Signup response", response.data);
      
      if (response.data.qrCodeUrl) {
        setQrCodeUrl(response.data.qrCodeUrl);
        setStep(2); // Move to QR code step
      }

    } catch (err: unknown) {
  console.error("Signup error", err);

  if (err instanceof AxiosError) {
    setError(err.response?.data?.message || "Registration failed. Please try again.");
  } else if (err instanceof Error) {
    setError(err.message);
  } else {
    setError("Registration failed. Please try again.");
  }} finally {
      setLoading(false);
    }
  };

  // Step 2: Move to OTP verification
  const handleQrScanned = () => {
    setStep(3);
  };

  // Step 3: Verify OTP and complete signup
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First login to get temp token
      const loginResponse = await axios.post(
        "https://2m9lwu9f0d.execute-api.ap-south-1.amazonaws.com/dev/login/step1",
        {
          collegeId,
          userName: email,
          password,
        }
      );

      const tempToken = loginResponse.data.tempToken;

      // Then verify OTP
      const otpResponse = await axios.post(
        "https://2m9lwu9f0d.execute-api.ap-south-1.amazonaws.com/dev/login/step2",
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

      const { token } = otpResponse.data;

      // Save token and user info
      localStorage.setItem("token", token);
      localStorage.setItem("userName", email);
      localStorage.setItem("collegeId", collegeId);

     
      setSuccess("Account verified successfully! Redirecting to dashboard...");
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (error: unknown) {
  console.error("❌ OTP verification failed:", error);

  if (error instanceof AxiosError) {
    setError(error.response?.data?.message || "Invalid OTP. Please try again.");
  } else if (error instanceof Error) {
    setError(error.message);
  } else {
    setError("Invalid OTP. Please try again.");
  }}
   finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Create Your Account";
      case 2: return "Scan QR Code";
      case 3: return "Verify OTP";
      default: return "Create Your Account";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return "Enter your details below to create a new account.";
      case 2: return "Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.)";
      case 3: return "Enter the 6-digit code from your authenticator app";
      default: return "Enter your details below to create a new account.";
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{getStepTitle()}</CardTitle>
          <CardDescription>
            {getStepDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="enter password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="confirm password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="collegeId">AISHE ID</Label>
                  <Input
                    id="collegeId"
                    type="text"
                    placeholder="enter AISHE ID"
                    required
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <Label className="text-sm font-medium">
                    Select Role
                  </Label>
                  <Select 
                    value={role}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Principal">Principal</SelectItem>
                      <SelectItem value="IQAC Co-ordinator">IQAC Co-ordinator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                {success && <p className="text-green-600 text-center text-sm">{success}</p>}
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating Account..." : "Sign Up"}
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                Have an account?{" "}
                <Link href="/login" passHref>
                  <span className="underline underline-offset-4">Login</span>
                </Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-4">
                {qrCodeUrl && (
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code for 2FA Setup" 
                      className="max-w-full h-auto"
                      style={{ maxWidth: '250px', maxHeight: '250px' }}
                    />
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    1. Open your authenticator app Google Authenticator, Authy, etc.
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    2. Scan the QR code above
                  </p>
                  <p className="text-sm text-gray-600">
                    3. Click Continue once you've added the account
                  </p>
                </div>
              </div>
              {success && <p className="text-green-600 text-center text-sm">{success}</p>}
              <Button onClick={handleQrScanned} className="w-full">
                Continue to OTP Verification
              </Button>
            </div>
          )}

          {step === 3 && (
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

                {error && <p className="text-red-600 text-center text-sm">{error}</p>}
                {success && <p className="text-green-600 text-center text-sm">{success}</p>}
                
                <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                  {loading ? "Verifying..." : "Complete Signup"}
                </Button>
                
                <div className="flex justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-blue-600 hover:underline"
                  >
                    ← Back to QR Code
                  </button>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}