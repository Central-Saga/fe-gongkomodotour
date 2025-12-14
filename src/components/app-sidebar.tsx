"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Command,
  GalleryVerticalEnd,
  Users,
  Shield,
  SquareUserRound,
  Compass,
  Home,
  Image as ImageIcon,
  Film
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
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: false,
    },
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
      title: "Transactions",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Bookings",
          url: "/dashboard/bookings",
        },
        {
          title: "Transactions",
          url: "/dashboard/transactions",
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
    // {
    //   name: "Customers",
    //   url: "/dashboard/customers",
    //   icon: SquareUserRound,
    // },
    {
      name: "Carousel",
      url: "/dashboard/carousel",
      icon: Film,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<{
    name: string;
    email: string;
    roles?: string[];
  } | null>(null);

  React.useEffect(() => {
    // Ambil data user dari localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Filter adminAccess berdasarkan role
  // Struktur role baru:
  // - Admin (dulu Super Admin) → bisa melihat semua menu termasuk Users dan Roles
  // - Admin (dulu Admin) → tidak bisa melihat Users dan Roles, hanya Customers dan Carousel
  // - Pelanggan → tidak bisa akses dashboard
  const filteredAdminAccess = React.useMemo(() => {
    if (!user?.roles || !Array.isArray(user.roles)) {
      // Jika tidak ada roles, tampilkan semua (fallback untuk safety)
      return data.adminAccess;
    }
    
    // Cek apakah user adalah Super Admin
    const isAdmin = user.roles.includes('Super Admin');

    if (isAdmin) {
      // Super Admin bisa melihat semua menu termasuk Users dan Roles
      return data.adminAccess;
    } else {
      // User hanya bisa melihat Customers dan Carousel, tidak bisa Users dan Roles
      return data.adminAccess.filter(item => 
        item.name !== "Users" && item.name !== "Roles"
      );
    }
  }, [user?.roles]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center justify-center shrink-0">
        <Image src={logo} alt="Gong Komodo Tour Logo" width={250} height={250} />
      </SidebarHeader>
      <SidebarContent className="flex-1 min-h-0">
        <NavMain items={data.navMain} />
        {filteredAdminAccess.length > 0 && (
          <NavAdmin adminAccess={filteredAdminAccess} />
        )}
      </SidebarContent>
      <SidebarFooter className="mt-auto shrink-0">
        {user && <NavUser user={{ ...user, avatar: '' }} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
