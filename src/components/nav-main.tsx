"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

const OPEN_MENUS_KEY = "sidebar-open-menus"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const [mounted, setMounted] = useState(false)
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const pathname = usePathname()

  // Load open menus from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(OPEN_MENUS_KEY)
    if (saved) {
      setOpenMenus(JSON.parse(saved))
    } else {
      // Default: buka menu yang berisi current path
      const activeMenus = items
        .filter(item => item.items?.some(sub => pathname.startsWith(sub.url)))
        .map(item => item.title)
      setOpenMenus(activeMenus)
    }
  }, [])

  // Save open menus to localStorage - hanya 1 menu yang bisa terbuka
  const handleOpenChange = (title: string, isOpen: boolean) => {
    const newOpenMenus = isOpen ? [title] : []
    setOpenMenus(newOpenMenus)
    localStorage.setItem(OPEN_MENUS_KEY, JSON.stringify(newOpenMenus))
  }

  // Check if a path is active
  const isActivePath = (url: string) => {
    if (url === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(url)
  }

  if (!mounted) {
    return null
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          item.items ? (
            <Collapsible
              key={item.title}
              asChild
              open={openMenus.includes(item.title)}
              onOpenChange={(isOpen) => handleOpenChange(item.title, isOpen)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton 
                          asChild
                          className={isActivePath(subItem.url) ? "bg-slate-100 dark:bg-slate-800 font-medium" : ""}
                        >
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                tooltip={item.title}
                className={isActivePath(item.url) ? "bg-slate-100 dark:bg-slate-800 font-medium" : ""}
              >
                <a href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
