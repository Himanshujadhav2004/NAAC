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
import { useState } from "react"


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [collegeId ,setcollegeId]=useState('');
  const[role,setrole]=useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleroleChange = (value: string) => {
    setrole(value)
  }
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  if (password !== confirmPassword) {
    setError("Passwords do not match");
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

    setSuccess(response.data.message || "User registered successfully!");
console.log("Signup response", response.data.qrCodeUrl);
    // ✅ If QR code is in response, open it in new tab
    if (response.data.qrCodeUrl) {
  const newTab = window.open("", "_blank"); // open blank tab right away
  if (newTab) {
    newTab.document.write(`
      <html>
        <head><title>QR Code</title></head>
        <body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh; flex-direction:column;">
          <img src="${response.data.qrCodeUrl}" alt="QR Code" style="max-width:100%;height:auto;" />
          <h3>Scan this QR code with your authenticator app</h3>
        </body>
      </html>
    `);
    newTab.document.close();
  }
}

  } catch (err: any) {
    console.error("Signup error", err);
    setError("Registration failed. Check CORS or API issue.");
  }
};


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>
            Enter your email below to create a new account.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
               <div className="grid gap-3">
                <Label htmlFor="collegeId">collegeId</Label>
                <Input
                  id="collegeId"
                  type="email"
                  placeholder="college@example.com"
                  required
                  value={collegeId}
                  onChange={(e) => setcollegeId(e.target.value)}
                />
              </div>

                 <div className="grid gap-3">
            <Label className="text-sm font-medium w-40">
              Select Role
            </Label>
            <Select 
              value={role}
              onValueChange={handleroleChange}
            >
              <SelectTrigger className="w-80 text-sm">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                <SelectItem value="Co-ordinator">Co-ordinator</SelectItem>
              </SelectContent>
            </Select>
          </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-center text-sm">{success}</p>}
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Sign Up
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
        </CardContent>
      </Card>
    </div>
  )
}
