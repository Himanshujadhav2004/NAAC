"use client"

import { Suspense } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import CollegeProfile from "@/components/collegeprofile"
import ProjectStructure from "@/components/projectstructure"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useRouter, useSearchParams } from "next/navigation"
import ResetPasswordPage from "@/components/resetpassword"

// Create a separate component for the content that uses useSearchParams
function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const section = searchParams.get('section')

  const handleLogout = () => {
    // Clear any stored authentication data (localStorage, sessionStorage, etc.)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.clear()
    
    // Redirect to login page
    router.push('/login')
  }

  const renderContent = () => {
    switch (section) {
      case 'college-profile':
        return (
          <CollegeProfile></CollegeProfile>
        )
      case 'reset-password':
        return (<ResetPasswordPage></ResetPasswordPage>
        )
      default:
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
            </div>
            <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
          </div>
        )
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  NAAC Portal
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {section === 'college-profile' ? 'College Profile' : 
                   section === 'reset-password' ? 'Reset Password' : 
                   'Data Fetching'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>
        </header>
        {renderContent()}
      </SidebarInset>
    </SidebarProvider>
  )
}

// Loading fallback component
function DashboardLoading() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  NAAC Portal
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Loading...</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl animate-pulse" />
            <div className="bg-muted/50 aspect-video rounded-xl animate-pulse" />
            <div className="bg-muted/50 aspect-video rounded-xl animate-pulse" />
          </div>
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min animate-pulse" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// Main page component wrapped with Suspense
export default function Page() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}