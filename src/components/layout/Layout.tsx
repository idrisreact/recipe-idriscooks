"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { authClient } from "@/src/utils/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { SubMenu } from "../sub-menu/sub-menu";
import { SignInModal } from "../sign-in-modal/SignInModal";
import { Text } from "../ui/Text";
import { link } from "fs";
import { title } from "process";

interface LayoutHeaderProps {
  children: React.ReactNode;
}

const links = [
  { link: "/log-in", title: "Log in" },
  // { link: "/sign-up", title: "Sign up" },
  { link: "/sign-out", title: "Sign out" },
];

export const LayoutHeader = ({ children }: LayoutHeaderProps) => {
  const { data: session, isPending } = authClient.useSession();
  const [showModalMenu, setShowModalMenu] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const router = useRouter();

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/recipes");
        },
      },
    });
  };

  return (
    <>
      <div className="wrapper">
        <header className="flex justify-between items-center py-2 md:py-8">
          <Image
            src="/images/idriscooks-logo.png"
            alt="Logo"
            width={50}
            height={50}
            priority
            loading="eager"
          />

          <ul className="hidden md:block md:flex">
            <li className="mr-2">
              <Link href={"/"}>Home</Link>
            </li>
            <li className="mr-2">
              <Link href={"/recipes"}>Recipes</Link>
            </li>
            <li className="mr-2">
              <Link href={"/about"}>About</Link>
            </li>
            <li className="mr-2">
              <Link href={"/contact"}>Contact</Link>
            </li>
          </ul>
          <div className="relative group flex items-center">
            <div className="flex gap-2 items-center">
              {session && <Text as="p">Welcome Back, {session.user.name}</Text>}
              <Button
                className="cursor-pointer"
                variant={"outline"}
                size={"icon"}
                onClick={() => setShowSubMenu((prev) => !prev)}
              >
                <HamburgerMenuIcon />
              </Button>
            </div>
            {showSubMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white shadow-lg rounded-md z-10 ">
                <SubMenu
                  links={links}
                  onSignInClick={() => setShowModalMenu(true)}
                  onSignOutClick={signOut}
                  onSignUpClick={() => router.push("sign-up")}
                />
              </div>
            )}
          </div>
        </header>
      </div>

      <main>{children}</main>
      {showModalMenu && <SignInModal onClose={() => setShowModalMenu(false)} />}
    </>
  );
};
