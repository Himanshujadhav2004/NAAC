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
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { jwtDecode as jwt_decode } from 'jwt-decode';
import {collegeaishecodedata as AISHE_DATA} from '../app/data/collegeaishecodedata'

// Sample AISHE data - replace this with your actual data


type AisheData = {
  AisheCode: string;
  Name: string;
  State: string;
  District: string;
};

// ✅ Fixed: Updated type definition to match actual token structure
type DecodedToken = {
  sub?: string;
  email: string;
  aisheId: string;  // Changed from 'collegeId' to 'aisheId'
  role?: string;
  sessionId?: string;
  exp: number;
  iat: number;
};

// Password validation functions
const validatePassword = (password: string) => {
  const validations = {
    length: password.length >= 8 && password.length <= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /\d/.test(password),
    symbol: /[@#%\-_]/.test(password)
  };

  return {
    isValid: Object.values(validations).every(Boolean),
    validations
  };
};

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
  const [successotp, setSuccessotp] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Form, 2: QR Code, 3: OTP
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    validations: {
      length: false,
      uppercase: false,
      lowercase: false,
      digit: false,
      symbol: false
    }
  });

  // New states for AISHE autocomplete
  const [aisheInput, setAisheInput] = useState('');
  const [showAisheSuggestions, setShowAisheSuggestions] = useState(false);
  const [selectedAishe, setSelectedAishe] = useState<AisheData | null>(null);

  // Filter AISHE data based on input
  const filteredAisheData = useMemo(() => {
    if (!aisheInput.trim()) return [];
    
    const searchTerm = aisheInput.toLowerCase();
    // Search by numeric part of AisheCode (without C-) and other fields
    return Object.values(AISHE_DATA).filter(item => {
      const numericCode = item.AisheCode.replace(/^C-/, '');
      return numericCode.toLowerCase().includes(searchTerm) ||
             item.Name.toLowerCase().includes(searchTerm) ||
             item.District.toLowerCase().includes(searchTerm);
    }).slice(0, 10); // Limit to 10 results for performance
  }, [aisheInput]);

  const handleRoleChange = (value: string) => {
    setRole(value);
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordValidation(validatePassword(newPassword));
  };

  // Handle AISHE input change
  const handleAisheInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only allow numeric characters
    const numericOnly = inputValue.replace(/[^0-9]/g, '');
    
    setAisheInput(numericOnly);
    setShowAisheSuggestions(numericOnly.length > 0);
    setSelectedAishe(null);
    setCollegeId(numericOnly);
  };

  // Handle AISHE selection
  const handleAisheSelection = (item: AisheData) => {
    setSelectedAishe(item);
    // Extract only the numeric part for input display
    const numericPart = item.AisheCode.replace(/^C-/, '');
    setAisheInput(numericPart);
    setShowAisheSuggestions(false);
    setCollegeId(numericPart);
  };

  // Step 1: Initial signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate password requirements
    if (!passwordValidation.isValid) {
      setError("Password does not meet the requirements");
      setLoading(false);
      return;
    }
    console.log(`${process.env.API}`)
    try {
      const completecollegeID = `C-${collegeId}`;
      const response = await axios.post(
        `https://${process.env.API}.execute-api.ap-south-1.amazonaws.com/dev/register`,
        {
          email: email,
          password: password,
          aisheId: completecollegeID,
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
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Move to OTP verification
  const handleQrScanned = () => {
    setStep(3);
  };

  // ✅ Fixed: Step 3: Verify OTP and complete signup
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First login to get temp token
      const loginResponse = await axios.post(
        `https://${process.env.API}.execute-api.ap-south-1.amazonaws.com/dev/login/step1`,
        {
          email: email,
          password,
        }
      );

      const tempToken = loginResponse.data.tempToken;

      // Then verify OTP
      const otpResponse = await axios.post(
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

      const { token } = otpResponse.data;

      // ✅ Decode token
      const decoded: DecodedToken = jwt_decode(token);
      console.log("🔍 Decoded token:", decoded);

      // ✅ Fixed: Save token and user info using correct property names
      localStorage.setItem("token", token);
      localStorage.setItem("userName", decoded.email || email);
      localStorage.setItem("collegeId", decoded.aisheId || `C-${collegeId}`); // Use aisheId instead of collegeId
      localStorage.setItem("role", decoded.role || role);
      
      const getcollegeID = localStorage.getItem("collegeId");
      console.log("Retrieved collegeId from localStorage:", getcollegeID);

      setSuccessotp("Account verified successfully! Redirecting to dashboard...");

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
      }
    } finally {
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
                    placeholder="example@gmail.com"
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
                    placeholder="Enter password"
                    required
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  
                  {password && (
                    <p className="text-xs text-gray-500">
                      Password must contain: 8-12 characters, one uppercase letter, one lowercase letter, one digit, one symbol (@, #, %, -, _)
                    </p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  
                  <span className="min-h-[20px] -mb-4"> {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-600 text-sm">Passwords do not match</p>
                  )}
                  </span>
                </div>
                
                {/* Updated AISHE ID field with autocomplete */}
                <div className="grid gap-3 relative">
                  <Label htmlFor="aisheId">AISHE ID</Label>
                  <Input
                    id="aisheId"
                    type="text"
                    placeholder="Enter AISHE numeric code (e.g., 6574)"
                    required
                    value={aisheInput}
                    onChange={handleAisheInputChange}
                    onFocus={() => aisheInput.length > 0 && setShowAisheSuggestions(true)}
                    onBlur={() => {
                      // Delay hiding to allow selection
                      setTimeout(() => setShowAisheSuggestions(false), 200);
                    }}
                    autoComplete="off"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                  
                  {/* Selected AISHE details */}
                  {selectedAishe && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm font-medium text-green-800">Selected Institution:</p>
                      <p className="text-sm font-medium text-green-700">{selectedAishe.AisheCode}</p>
                      <p className="text-sm text-green-700">{selectedAishe.Name}</p>
                      <p className="text-xs text-green-600">{selectedAishe.District}, {selectedAishe.State}</p>
                    </div>
                  )}

                  {/* Suggestions dropdown */}
                  {showAisheSuggestions && filteredAisheData.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredAisheData.map((item) => (
                        <div
                          key={item.AisheCode}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleAisheSelection(item)}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-blue-600">{item.AisheCode}</span>
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.District}</span>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">{item.Name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No results message */}
                  {showAisheSuggestions && aisheInput.length > 0 && filteredAisheData.length === 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-gray-500">
                      <p className="text-sm">No AISHE codes found matching {aisheInput}</p>
                    </div>
                  )}
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
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || !passwordValidation.isValid || password !== confirmPassword || !collegeId}
                  >
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
                    1.Open your authenticator app Google Authenticator, Authy, etc.
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                   2.Scan the QR code above
                  </p>
                  <p className="text-sm text-gray-600">
                   3.Click Continue once you added the account
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
                {successotp && <p className="text-green-600 text-center text-sm">{successotp}</p>}
                
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
