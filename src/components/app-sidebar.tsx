"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Command,
  GalleryVerticalEnd,
  Settings2,
  Users,
  Shield,
  SquareUserRound,
  Compass
} from "lucide-react"
import Image from 'next/image'
import logo from '../../public/img/logo.png';
import { NavMain } from "@/components/nav-main"
import { NavAdmin } from "@/components/nav-admin"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Trips",
      url: "/dashboard/trips",
      icon: Compass,
      isActive: true,
      items: [
        {
          title: "Trips",
          url: "/dashboard/trips",
        },
        {
          title: "Boats",
          url: "/dashboard/boats",
        },
        {
          title: "Hotels",
          url: "/dashboard/hotels",
        },
      ],
    },
    {
      title: "Content",
      url: "#",
      icon: GalleryVerticalEnd,
      items: [
        {
          title: "FAQ",
          url: "/dashboard/faqs",
        },
        {
          title: "Testimonials",
          url: "/dashboard/testimonials",
        },
        {
          title: "Gallery",
          url: "/dashboard/galleries",
        },
        {
          title: "Blog",
          url: "/dashboard/blogs",
        },
      ],
    },
    {
      title: "Transaction",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Hotels",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
    {
      title: "Gallery",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  adminAccess: [
    {
      name: "Users",
      url: "/dashboard/users",
      icon: Users,
    },
    {
      name: "Roles",
      url: "/dashboard/roles",
      icon: Shield,
    },
    {
      name: "Customers",
      url: "/dashboard/customers",
      icon: SquareUserRound,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<{
    name: string;
    email: string;
  } | null>(null);

  React.useEffect(() => {
    // Ambil data user dari localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center justify-center">
        <Image src={logo} alt="Gong Komodo Tour Logo" width={250} height={250} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavAdmin adminAccess={data.adminAccess} />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={{ ...user, avatar: '' }} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
