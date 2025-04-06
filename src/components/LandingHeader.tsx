"use client";

import { useState } from "react";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, NavigationMenuTrigger, NavigationMenuContent } from '@/components/ui/navigation-menu';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { GoPerson } from "react-icons/go";
import Image from 'next/image';
import logo from '../../public/img/logo.png';

export default function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <header className="bg-[#ffffff] border-b shadow-sm">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <div className="flex items-center">
          <Image src={logo} alt="Gong Komodo Tour Logo" className="h-12 w-auto" />
        </div>
        {/* Navigation menu */}
        <div className="flex items-center space-x-8">
          <NavigationMenu>
            <NavigationMenuList className="flex space-x-5">
              <NavigationMenuItem>
                <NavigationMenuLink href="/" className="text-sm hover:text-[#CFB53B]">
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
                      className={`text-sm hover:text-[#CFB53B] ${
                        isOpen || isHovered ? 'text-[#CFB53B]' : 'text-black'
                      }`}
                    >
                      Packages
                    </span>
                  </PopoverTrigger>
                  <PopoverContent 
                    align="start" 
                    className="w-48 p-2 bg-white shadow-md absolute left-0 top-full transform -translate-x-2"
                  >
                    <a href="/paket/open-trip" className="block px-4 py-2 text-sm hover:text-[#CFB53B]">
                      Open Trip
                    </a>
                    <a href="/paket/private-trip" className="block px-4 py-2 text-sm hover:text-[#CFB53B]">
                      Private Trip
                    </a>
                  </PopoverContent>
                </Popover>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/gallery" className="text-sm hover:text-[#CFB53B]">
                  Gallery
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/blog" className="text-sm hover:text-[#CFB53B]">
                  Blog
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/about-us" className="text-sm hover:text-[#CFB53B]">
                  About Us
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="flex items-center space-x-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm hover:text-[#CFB53B] data-[state=open]:text-[#CFB53B]">
                    Bahasa
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="w-32 p-2 bg-white shadow-md">
                    <NavigationMenuLink href="#" className="block px-4 py-2 text-sm hover:text-[#CFB53B]">
                      English
                    </NavigationMenuLink>
                    <NavigationMenuLink href="#" className="block px-4 py-2 text-sm hover:text-[#CFB53B]">
                      Bahasa Indonesia
                    </NavigationMenuLink>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <div>
              <GoPerson className="w-8 h-8 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}