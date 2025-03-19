"use client"

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

// Mapping untuk nama-nama rute
const routeMapping: Record<string, string> = {
  "dashboard": "Dashboard",
  "users": "Users",
  "roles": "Role Management",
};

export function DynamicBreadcrumb() {
  // Menggunakan hook usePathname untuk mendapatkan path saat ini
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);
  
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const segmentPath = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSegments.length - 1;
    
    // Mendapatkan nama yang sesuai dari mapping atau menggunakan segment dengan huruf kapital pertama
    const displayName = routeMapping[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    return (
      <React.Fragment key={segment}>
        <BreadcrumbItem>
          {isLast ? (
            <BreadcrumbPage>{displayName}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href={segmentPath}>{displayName}</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {!isLast && <BreadcrumbSeparator />}
      </React.Fragment>
    );
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.length === 0 ? (
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          breadcrumbItems
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
} 