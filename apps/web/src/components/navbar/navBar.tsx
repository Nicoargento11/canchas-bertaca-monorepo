"use client";
import React, { useState } from "react";
import Link from "next/link";

import { Menu, X } from "lucide-react";

import { ProfileMenu } from "@/components/navbar/profile-menu";
import { ListMenu } from "@/components/navbar/list-menu";
// import { Logo } from "./logo";
import { Collapsible, CollapsibleContent } from "../ui/collapsible";
import { Separator } from "../ui/separator";

import { navBarItems } from "@/constants";
import { Session } from "@/services/auth/session";
import { Button } from "../ui/button";
import { useModal } from "@/contexts/modalContext";
import { scrollToSection } from "@/utils/scrollToSection";

interface NavBarProps {
  currentUser?: Session | null;
}

const NavBar = ({ currentUser }: NavBarProps) => {
  const { handleChangeLogin, handleChangeRegister } = useModal();
  const [openNav, setOpenNav] = useState(false);
  return (
    <>
      <div className="max-h-[768px] w-[calc(100%)] ">
        <nav
          className="
        h-max w-full py-2 px-4 lg:px-4 lg:py-3  
        fixed top-0 z-20
        shadow-lg rounded-none backdrop-blur-sm  
        "
        >
          <div className="flex justify-between items-center w-full px-1">
            <div className="flex justify-center items-center">
              <div className="hidden lg:block text-Primary font-bold text-lg">
                {/* <Logo /> */} logo
              </div>
              <div
                className="hover:cursor-pointer h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
                onClick={() => setOpenNav(!openNav)}
              >
                {openNav ? <X size={25} /> : <Menu size={25} />}
              </div>
            </div>
            <div className="mr-4 hidden lg:block">
              <ListMenu />
            </div>
            {currentUser ? (
              <ProfileMenu currentUser={currentUser} />
            ) : (
              <div className="flex gap-2">
                {!openNav && (
                  <>
                    <div className="hidden lg:block">
                      <Button
                        className="bg-Primary"
                        onClick={handleChangeLogin}
                      >
                        Iniciar Sesion
                      </Button>
                    </div>
                    <Button onClick={handleChangeRegister}>Registrarse</Button>
                  </>
                )}
              </div>
            )}
          </div>
          <Collapsible open={openNav} className="block lg:hidden">
            <CollapsibleContent className="w-full flex flex-col justify-center items-center gap-4 border-blue-gray-50 bg-transparent font-semibold">
              {navBarItems.map(({ title, href }) => (
                <Link
                  key={title}
                  href={`#${href}`}
                  className="flex items-center"
                  onClick={(event) => {
                    scrollToSection(event);
                    setOpenNav((value) => !value);
                  }}
                >
                  {title}
                </Link>
              ))}

              <Separator />
            </CollapsibleContent>
          </Collapsible>
        </nav>
      </div>
    </>
  );
};

export default NavBar;
