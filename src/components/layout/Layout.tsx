"use client";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { authClient } from "@/src/utils/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface LayoutHeaderProps {
  children: React.ReactNode;
}

export const LayoutHeader = ({ children }: LayoutHeaderProps) => {
  const { data: session, isPending } = authClient.useSession();

  const router = useRouter();

  const signIn = async () => {
    await authClient.signIn.social({
      provider: "google",
    });
  };

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
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

          {isPending ? (
            <h1>loading</h1>
          ) : session ? (
            <div className="flex gap-4 items-center">
              <p>{`Welcome ${session.user.name}`}</p>
              <Button className="cursor-pointer" onClick={signOut}>
                Sign out
              </Button>
            </div>
          ) : (
            <Button className="cursor-pointer" onClick={signIn}>
              Sign In
            </Button>
          )}
        </header>
      </div>

      <main>{children}</main>
    </>
  );
};
