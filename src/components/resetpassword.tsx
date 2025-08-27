"use client"

import { useState } from "react"
import axios, { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

// ✅ Password validation helper
const validatePassword = (password: string) => {
  const validations = {
    length: password.length >= 8 && password.length <= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /\d/.test(password),
    symbol: /[@#%\-_]/.test(password),
  }

  return {
    isValid: Object.values(validations).every(Boolean),
    validations,
  }
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [tempToken, setTempToken] = useState("")

  // ✅ Calculate validation in real-time instead of storing in state
  const passwordValidation = validatePassword(newPassword)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // ✅ Handle password typing - simplified
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewPassword(value)
    // No need to set passwordValidation in state anymore
  }

  // Step 1: Verify old password
  const handleVerifyOldPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const token = localStorage.getItem("token")

      const res = await axios.post(
        "https://u7596ejp7c.execute-api.ap-south-1.amazonaws.com/dev/reset-password/step1",
        { oldPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setTempToken(res.data.tempToken)
      setSuccess("Old password verified. Please enter the OTP.")
      setStep(2)
    } catch (err) {
      if (err instanceof AxiosError) setError(err.response?.data?.message || "Verification failed.")
      else if (err instanceof Error) setError(err.message)
      else setError("Verification failed.")
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const res = await axios.post(
        "https://u7596ejp7c.execute-api.ap-south-1.amazonaws.com/dev/reset-password/step2",
        { totpToken: otp },
        { headers: { Authorization: `Bearer ${tempToken}` } }
      )

      setTempToken(res.data.tempToken)
      setSuccess("OTP verified. Please set your new password.")
      setStep(3)
    } catch (err) {
      if (err instanceof AxiosError) setError(err.response?.data?.message || "OTP verification failed.")
      else if (err instanceof Error) setError(err.message)
      else setError("OTP verification failed.")
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Set new password
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (!passwordValidation.isValid) {
      setError("Password does not meet requirements.")
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    try {
      await axios.post(
        "https://u7596ejp7c.execute-api.ap-south-1.amazonaws.com/dev/reset-password/step3",
        { newPassword },
        { headers: { Authorization: `Bearer ${tempToken}` } }
      )

      setSuccess("Password reset successfully! Redirecting to login...")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err) {
      if (err instanceof AxiosError) setError(err.response?.data?.message || "Password reset failed.")
      else if (err instanceof Error) setError(err.message)
      else setError("Password reset failed.")
    } finally {
      setLoading(false)
    }
  }

  // ✅ Debug: Add console.log to see what's happening
  console.log('Debug Info:', {
    newPassword,
    confirmPassword,
    passwordValidation,
    passwordsMatch: newPassword === confirmPassword,
    buttonShouldBeDisabled: loading ||
      !newPassword ||
      !confirmPassword ||
      !passwordValidation.isValid ||
      newPassword !== confirmPassword
  })

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Verify Old Password"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "Set New Password"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Enter your old password to continue."}
            {step === 2 && "Enter the 6-digit OTP from your authenticator app."}
            {step === 3 && "Enter and confirm your new password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={handleVerifyOldPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Old Password</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Next"}
              </Button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
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
              {error && <p className="text-red-600 text-sm text-center">{error}</p>}
              {success && <p className="text-green-600 text-sm text-center">{success}</p>}
              <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                {loading ? "Verifying..." : "Next"}
              </Button>
            </form>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                />
              </div>

              {/* ✅ Enhanced password validation display */}
              {newPassword && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">Password requirements:</p>
                  <div className="space-y-1">
                    <div className={`text-xs flex items-center gap-2 ${passwordValidation.validations.length ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{passwordValidation.validations.length ? '✓' : '✗'}</span>
                      8-12 characters
                    </div>
                    <div className={`text-xs flex items-center gap-2 ${passwordValidation.validations.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{passwordValidation.validations.uppercase ? '✓' : '✗'}</span>
                      One uppercase letter
                    </div>
                    <div className={`text-xs flex items-center gap-2 ${passwordValidation.validations.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{passwordValidation.validations.lowercase ? '✓' : '✗'}</span>
                      One lowercase letter
                    </div>
                    <div className={`text-xs flex items-center gap-2 ${passwordValidation.validations.digit ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{passwordValidation.validations.digit ? '✓' : '✗'}</span>
                      One digit
                    </div>
                    <div className={`text-xs flex items-center gap-2 ${passwordValidation.validations.symbol ? 'text-green-600' : 'text-red-600'}`}>
                      <span>{passwordValidation.validations.symbol ? '✓' : '✗'}</span>
                      One symbol (@, #, %, -, _)
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-600 text-sm">Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-green-600 text-sm">✓ Passwords match</p>
                )}
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}
              
              <Button
                type="submit"
                className="w-full"
                disabled={
                  loading ||
                  !newPassword.trim() || // must type something (trim to handle spaces)
                  !confirmPassword.trim() || // must type something (trim to handle spaces)
                  !passwordValidation.isValid || // must satisfy rules
                  newPassword !== confirmPassword // must match
                }
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}