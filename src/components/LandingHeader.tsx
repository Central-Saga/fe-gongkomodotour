"use client";

import { useState, useEffect } from "react";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, NavigationMenuTrigger, NavigationMenuContent } from '@/components/ui/navigation-menu';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { GoPerson } from "react-icons/go";
import { LogOut, User, Settings, Menu, X } from "lucide-react";
import Image from 'next/image';
import logo from '../../public/img/logo.png';
import CountryFlag from 'react-country-flag';
import { useRouter } from 'next/navigation';
import { apiRequest, clearCsrfToken } from '@/lib/api';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from '@/contexts/LanguageContext';

interface Customer {
  id: number;
  user_id: number;
  alamat: string;
  no_hp: string;
  nasionality: string;
  region: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  roles: string[];
  permissions: string[];
  customer?: Customer;
}

export default function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(user));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/logout', {}, {
        headers: { 'Accept': 'application/json' },
      });
      clearCsrfToken();
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUserData(null);
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

  const handleLanguageChange = (lang: 'en' | 'id') => {
    setLanguage(lang);
  };

  return (
    <header className="bg-[#ffffff] border-b shadow-sm">
      <div className="container mx-auto flex justify-between items-center p-2.5 sm:p-4">
        {/* Logo */}
        <div className="flex items-center">
          <Image 
            src={logo} 
            alt="Gong Komodo Tour Logo" 
            className="w-20 h-auto sm:w-24 md:w-28 lg:w-32" 
          />
        </div>
        
        {/* Desktop Navigation menu */}
        <div className="hidden lg:flex items-center space-x-4 md:space-x-6 lg:space-x-8">
          <NavigationMenu>
            <NavigationMenuList className="flex space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5">
              <NavigationMenuItem>
                <NavigationMenuLink href="/" className="text-xs sm:text-sm hover:text-gold transition-colors duration-200">
                  {t('home')}
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
                      className={`text-xs sm:text-sm hover:text-gold transition-colors duration-200 ${
                        isOpen || isHovered ? 'text-gold' : 'text-black'
                      }`}
                    >
                      {t('packages')}
                    </span>
                  </PopoverTrigger>
                  <PopoverContent 
                    align="start" 
                    className="w-40 sm:w-48 p-2 bg-white shadow-md absolute left-0 top-full transform -translate-x-2 flex flex-col"
                  >
                    <a href="/paket/open-trip" className="px-3 sm:px-4 py-2 text-xs sm:text-sm hover:text-gold transition-colors duration-200 whitespace-nowrap">
                      {t('openTrip')}
                    </a>
                    <a href="/paket/private-trip" className="px-3 sm:px-4 py-2 text-xs sm:text-sm hover:text-gold transition-colors duration-200 whitespace-nowrap">
                      {t('privateTrip')}
                    </a>
                  </PopoverContent>
                </Popover>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/gallery" className="text-xs sm:text-sm hover:text-gold transition-colors duration-200">
                  {t('gallery')}
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/blog" className="text-xs sm:text-sm hover:text-gold transition-colors duration-200">
                  {t('blog')}
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/about-us" className="text-xs sm:text-sm hover:text-gold transition-colors duration-200">
                  {t('aboutUs')}
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-xs sm:text-sm hover:text-gold data-[state=open]:text-gold transition-colors duration-200">
                    <CountryFlag countryCode={language === 'en' ? 'GB' : 'ID'} svg style={{ width: '16px', height: '12px' }} />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="w-28 sm:w-32 p-2 bg-white shadow-md">
                    <NavigationMenuLink
                      href="#"
                      onClick={() => handleLanguageChange('en')}
                      className="px-3 sm:px-4 py-2 text-xs sm:text-sm hover:text-gold transition-colors duration-200 flex items-center gap-2"
                    >
                      <CountryFlag countryCode="GB" svg style={{ width: '14px', height: '10px' }} />
                      {t('english')}
                    </NavigationMenuLink>
                    <NavigationMenuLink
                      href="#"
                      onClick={() => handleLanguageChange('id')}
                      className="px-3 sm:px-4 py-2 text-xs sm:text-sm hover:text-gold transition-colors duration-200 flex items-center gap-2"
                    >
                      <CountryFlag countryCode="ID" svg style={{ width: '14px', height: '10px' }} />
                      {t('indonesia')}
                    </NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  {isLoggedIn && userData ? (
                    <button className="flex items-center space-x-1 sm:space-x-2 hover:text-gold transition-colors duration-200">
                      <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                        <AvatarFallback className="bg-[#CFB53B] text-white text-xs sm:text-sm">
                          {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  ) : (
                    <button className="hover:text-gold transition-colors duration-200">
                      <GoPerson className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
                    </button>
                  )}
                </PopoverTrigger>
                <PopoverContent 
                  align="end" 
                  className="w-64 sm:w-72 p-2 bg-white shadow-md flex flex-col"
                >
                  {isLoggedIn && userData ? (
                    <>
                      <div className="px-3 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                            <AvatarFallback className="bg-[#CFB53B] text-white text-xs sm:text-sm">
                              {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{userData.name}</p>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">{userData.email}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {userData.roles.map((role, index) => (
                                <span key={index} className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium bg-[#CFB53B] text-white rounded-full">
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        {userData.customer && (
                          <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600">
                            <p className="flex items-center gap-1 sm:gap-2 truncate">
                              <span className="font-medium">Region:</span> 
                              <span className="truncate">{userData.customer.region}</span>
                            </p>
                            <p className="flex items-center gap-1 sm:gap-2 truncate">
                              <span className="font-medium">Phone:</span> 
                              <span className="truncate">{userData.customer.no_hp}</span>
                            </p>
                          </div>
                        )}
                      </div>
                      <Separator className="my-2" />
                      {(userData.roles.includes('Super Admin') || userData.roles.includes('Admin')) && (
                        <button
                          onClick={handleDashboard}
                          className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm hover:text-gold transition-colors duration-200 gap-2"
                        >
                          <Settings size={14} className="sm:w-4 sm:h-4" />
                          {t('dashboard')}
                        </button>
                      )}
                      {userData.customer && (
                        <a 
                          href="/profile" 
                          className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm hover:text-gold transition-colors duration-200 gap-2"
                        >
                          <User size={14} className="sm:w-4 sm:h-4" />
                          {t('myProfile')}
                        </a>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:text-red-700 transition-colors duration-200 gap-2"
                      >
                        <LogOut size={14} className="sm:w-4 sm:h-4" />
                        {t('logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <a href="/auth/login" className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm hover:text-gold transition-colors duration-200 gap-2">
                        <User size={14} className="sm:w-4 sm:h-4" />
                        {t('login')}
                      </a>
                      {/* <a href="/auth/register" className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm hover:text-gold transition-colors duration-200 gap-2">
                        <User size={14} className="sm:w-4 sm:h-4" />
                        {t('register')}
                      </a> */}
                    </>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        
        {/* Mobile Hamburger Menu */}
        <div className="lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="p-2 hover:text-gold transition-colors duration-200">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96 p-0 [&>button]:hidden">
              <h2 className="sr-only">Navigation Menu</h2>
              <div className="flex flex-col h-full">
                {/* Header dengan logo dan close button */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
                  <Image 
                    src={logo} 
                    alt="Gong Komodo Tour Logo" 
                    className="w-24 h-auto" 
                  />
                  <SheetClose asChild>
                    <button 
                      className="p-2 rounded-lg hover:bg-gray-100 hover:text-gold transition-colors duration-200"
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </SheetClose>
                </div>
                
                {/* Navigation Links */}
                <div className="flex-1 px-6 py-4">
                  <nav className="space-y-2">
                    <SheetClose asChild>
                      <a 
                        href="/" 
                        className="block px-4 py-3 text-base font-medium text-gray-900 hover:text-gold hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        {t('home')}
                      </a>
                    </SheetClose>
                    
                    {/* Packages Dropdown */}
                    <div className="space-y-1">
                      <div className="px-4 py-3 text-base font-medium text-gray-900">
                        {t('packages')}
                      </div>
                      <div className="pl-4 space-y-1">
                        <SheetClose asChild>
                          <a 
                            href="/paket/open-trip" 
                            className="block px-4 py-2 text-sm text-gray-600 hover:text-gold hover:bg-gray-50 rounded-lg transition-colors duration-200"
                          >
                            {t('openTrip')}
                          </a>
                        </SheetClose>
                        <SheetClose asChild>
                          <a 
                            href="/paket/private-trip" 
                            className="block px-4 py-2 text-sm text-gray-600 hover:text-gold hover:bg-gray-50 rounded-lg transition-colors duration-200"
                          >
                            {t('privateTrip')}
                          </a>
                        </SheetClose>
                      </div>
                    </div>
                    
                    <SheetClose asChild>
                      <a 
                        href="/gallery" 
                        className="block px-4 py-3 text-base font-medium text-gray-900 hover:text-gold hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        {t('gallery')}
                      </a>
                    </SheetClose>
                    
                    <SheetClose asChild>
                      <a 
                        href="/blog" 
                        className="block px-4 py-3 text-base font-medium text-gray-900 hover:text-gold hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        {t('blog')}
                      </a>
                    </SheetClose>
                    
                    <SheetClose asChild>
                      <a 
                        href="/about-us" 
                        className="block px-4 py-3 text-base font-medium text-gray-900 hover:text-gold hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        {t('aboutUs')}
                      </a>
                    </SheetClose>
                  </nav>
                </div>
                
                {/* Language Selector */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Language</span>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        handleLanguageChange('en');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors duration-200 ${
                        language === 'en' 
                          ? 'bg-gold text-white' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <CountryFlag countryCode="GB" svg style={{ width: '18px', height: '14px', marginRight: '12px' }} />
                      {t('english')}
                    </button>
                    <button
                      onClick={() => {
                        handleLanguageChange('id');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors duration-200 ${
                        language === 'id' 
                          ? 'bg-gold text-white' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <CountryFlag countryCode="ID" svg style={{ width: '18px', height: '14px', marginRight: '12px' }} />
                      {t('indonesia')}
                    </button>
                  </div>
                </div>
                
                {/* User Menu */}
                <div className="px-6 py-4 border-t border-gray-200">
                  {isLoggedIn && userData ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-[#CFB53B] text-white">
                            {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{userData.name}</p>
                          <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {(userData.roles.includes('Super Admin') || userData.roles.includes('Admin')) && (
                          <button
                            onClick={() => {
                              handleDashboard();
                              setIsMobileMenuOpen(false);
                            }}
                            className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:text-gold hover:bg-gray-50 rounded-lg transition-colors duration-200 gap-3"
                          >
                            <Settings size={18} />
                            {t('dashboard')}
                          </button>
                        )}
                        {userData.customer && (
                          <SheetClose asChild>
                            <a 
                              href="/profile" 
                              className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:text-gold hover:bg-gray-50 rounded-lg transition-colors duration-200 gap-3"
                            >
                              <User size={18} />
                              {t('myProfile')}
                            </a>
                          </SheetClose>
                        )}
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 gap-3"
                        >
                          <LogOut size={18} />
                          {t('logout')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <SheetClose asChild>
                        <a 
                          href="/auth/login" 
                          className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:text-gold hover:bg-gray-50 rounded-lg transition-colors duration-200 gap-3"
                        >
                          <User size={18} />
                          {t('login')}
                        </a>
                      </SheetClose>
                      {/* <SheetClose asChild>
                        <a 
                          href="/auth/register" 
                          className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:text-gold hover:bg-gray-50 rounded-lg transition-colors duration-200 gap-3"
                        >
                          <User size={18} />
                          {t('register')}
                        </a>
                      </SheetClose> */}
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
} 