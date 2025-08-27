"use client"

import * as React from "react"
import { User, Minus, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { SearchForm } from "@/components/search-form"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Sample data (no isActive flags here)
const data = {
  navMain: [
    {
      title: "College details",
      url: "#",
      items: [
        {
          title: "College Profile",
          url: "/dashboard?section=college-profile",
        },
        // {
        //   title: "Project Structure",
        //   url: "/dashboard?section=project-structure",
        // },
      ],
    },
    {
      title: "Manage SSR",
      url: "#",
      items: [
        {
          title: "SSR",
          url: "#",
        },
        // {
        //   title: "SSR 2",
        //   url: "#",
        // }
      ],
    },
        {
      title: "Setting",
      url: "#",
      items: [
        {
          title: "Reset Password",
         url: "/dashboard?section=reset-password",
        },
      ],
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userName, setUserName] = useState("user")
  const [activeUrl, setActiveUrl] = useState<string | null>(null) // track active item

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName")
    const collegeId = localStorage.getItem("collegeId");
    if (collegeId) {
      setUserName(collegeId)
    }
  }, [])

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <User />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">{userName}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <Collapsible
                key={item.title}
                defaultOpen={false} // keep all closed initially
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      {item.title}{" "}
                      <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                      <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {item.items?.length ? (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={activeUrl === subItem.url} // active only when clicked
                            >
                              <Link
                                href={subItem.url}
                                onClick={() => setActiveUrl(subItem.url)}
                              >
                                {subItem.title}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  ) : null}
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
