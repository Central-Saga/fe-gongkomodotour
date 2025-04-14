"use client";

import { useState, useEffect } from "react";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, NavigationMenuTrigger, NavigationMenuContent } from '@/components/ui/navigation-menu';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { GoPerson } from "react-icons/go";
import { LogOut, User, Settings } from "lucide-react";
import Image from 'next/image';
import logo from '../../public/img/logo.png';
import CountryFlag from 'react-country-flag';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface UserData {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export default function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Cek apakah user sudah login
    const token = document.cookie.split('access_token=')[1]?.split(';')[0];
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(user));
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Panggil API logout
      await apiRequest('POST', '/api/logout', {}, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${document.cookie.split('access_token=')[1]?.split(';')[0]}`
        }
      });

      // Hapus token dari cookies
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'token_type=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      
      // Hapus data user dari localStorage
      localStorage.removeItem('user');
      
      // Update state
      setIsLoggedIn(false);
      setUserData(null);
      
      // Redirect ke halaman login
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDashboard = () => {
    if (userData?.roles.includes('Super Admin') || userData?.roles.includes('Admin')) {
      router.push('/dashboard');
    }
  };

  return (
    <header className="bg-[#ffffff] border-b shadow-sm">
      <div className="container mx-auto flex justify-between items-center p-2.5">
        {/* Logo */}
        <div className="flex items-center">
          <Image src={logo} alt="Gong Komodo Tour Logo" className="w-32 h-auto" />
        </div>
        {/* Navigation menu */}
        <div className="flex items-center space-x-8">
          <NavigationMenu>
            <NavigationMenuList className="flex space-x-5">
              <NavigationMenuItem>
                <NavigationMenuLink href="/" className="text-sm hover:text-gold transition-colors duration-200">
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger
                    asChild
                    className="cursor-pointer flex items-center"
                    onClick={() => setIsOpen(!isOpen)}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <span
                      className={`text-sm hover:text-gold transition-colors duration-200 ${
                        isOpen || isHovered ? 'text-gold' : 'text-black'
                      }`}
                    >
                      Packages
                    </span>
                  </PopoverTrigger>
                  <PopoverContent 
                    align="start" 
                    className="w-48 p-2 bg-white shadow-md absolute left-0 top-full transform -translate-x-2 flex flex-col"
                  >
                    <a href="/paket/open-trip" className="px-4 py-2 text-sm hover:text-gold transition-colors duration-200 whitespace-nowrap">
                      Open Trip
                    </a>
                    <a href="/paket/private-trip" className="px-4 py-2 text-sm hover:text-gold transition-colors duration-200 whitespace-nowrap">
                      Private Trip
                    </a>
                  </PopoverContent>
                </Popover>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/gallery" className="text-sm hover:text-gold transition-colors duration-200">
                  Gallery
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/blog" className="text-sm hover:text-gold transition-colors duration-200">
                  Blog
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/about-us" className="text-sm hover:text-gold transition-colors duration-200">
                  About Us
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="flex items-center space-x-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm hover:text-gold data-[state=open]:text-gold transition-colors duration-200">
                    <CountryFlag countryCode="GB" svg style={{ width: '20px', height: '15px' }} />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="w-32 p-2 bg-white shadow-md">
                    <NavigationMenuLink href="#" className="px-4 py-2 text-sm hover:text-gold transition-colors duration-200 flex items-center gap-2">
                      <CountryFlag countryCode="GB" svg style={{ width: '16px', height: '12px' }} />
                      English
                    </NavigationMenuLink>
                    <NavigationMenuLink href="#" className="px-4 py-2 text-sm hover:text-gold transition-colors duration-200 flex items-center gap-2">
                      <CountryFlag countryCode="ID" svg style={{ width: '16px', height: '12px' }} />
                      Indonesia
                    </NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  {isLoggedIn && userData ? (
                    <button className="flex items-center space-x-2 hover:text-gold transition-colors duration-200">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[#CFB53B] text-white">
                          {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  ) : (
                    <button className="hover:text-gold transition-colors duration-200">
                      <GoPerson className="w-8 h-8 rounded-full" />
                    </button>
                  )}
                </PopoverTrigger>
                <PopoverContent 
                  align="end" 
                  className="w-64 p-2 bg-white shadow-md flex flex-col"
                >
                  {isLoggedIn && userData ? (
                    <>
                      <div className="px-4 py-3">
                        <p className="text-base font-semibold text-gray-900">{userData.name}</p>
                        <p className="text-sm text-gray-500 truncate">{userData.email}</p>
                        {userData.roles.map((role, index) => (
                          <span key={index} className="inline-block px-2 py-1 mt-1 text-xs font-medium bg-[#CFB53B] text-white rounded-full">
                            {role}
                          </span>
                        ))}
                      </div>
                      <Separator className="my-2" />
                      {(userData.roles.includes('Super Admin') || userData.roles.includes('Admin')) && (
                        <button
                          onClick={handleDashboard}
                          className="flex items-center px-4 py-2 text-sm hover:text-gold transition-colors duration-200 gap-2"
                        >
                          <Settings size={16} />
                          Dashboard
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:text-red-700 transition-colors duration-200 gap-2"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <a href="/auth/login" className="flex items-center px-4 py-2 text-sm hover:text-gold transition-colors duration-200 gap-2">
                        <User size={16} />
                        Login
                      </a>
                      <a href="/auth/register" className="flex items-center px-4 py-2 text-sm hover:text-gold transition-colors duration-200 gap-2">
                        <User size={16} />
                        Register
                      </a>
                    </>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 