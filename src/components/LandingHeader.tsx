/* stylelint-disable all */

import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { GoPerson } from "react-icons/go";
import Image from 'next/image';
import logo from '../../public/img/logo.png';

export default function LandingHeader() {
  return (
    <header className="bg-gray-100 border-b shadow-sm">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo (Teks Sementara) */}
        <div className="flex items-center">
          <Image 
            src={logo} 
            alt="Gong Komodo Tour Logo" 
            className="h-12 w-auto" 
          />
        </div>
        {/* Navigation menu links */}
        <div className="flex items-center space-x-8">
          <NavigationMenu>
            <NavigationMenuList className="flex space-x-4">
              <NavigationMenuItem>
                <NavigationMenuLink href="#">Home</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#">Packages</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#">Gallery</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#">Blog</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#">About Us</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="flex items-center space-x-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Bahasa</NavigationMenuTrigger>
                  <NavigationMenuContent className="w-32">
                    <NavigationMenuLink href="#">English</NavigationMenuLink>
                    <NavigationMenuLink href="#">Bahasa Indonesia</NavigationMenuLink>
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