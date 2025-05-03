"use client"
import Link from "next/link"
import Image from "next/image";
import React, { useEffect, useState } from "react"

import { Container } from "../ui/Container"
import { authClient, session } from "@/src/utils/auth-client"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";


interface LayoutHeaderProps {
  children: React.ReactNode
}

export const LayoutHeader = ({children}: LayoutHeaderProps) => {
  const [isClient, setIsClient] = useState(false); // Track client-side rendering
  const router = useRouter()

  useEffect(() => {
    setIsClient(true); // Set to true once mounted on the client
  }, []);

  const signIn = async () => {
   await authClient.signIn.social({
      provider: 'google',
    });
  };

  const signOut = async ()=>{
  await authClient.signOut({
    fetchOptions:{
        onSuccess:()=>{
            router.push('/')
        }
    }
  })
  }

  // Only render dynamic content after mounting on the client
  return (
    <>
      <Container>
        <header className="flex justify-between items-center py-8">
          <Image 
            src="/images/idriscooks-logo.png"
            alt="Logo"
            width={75}
            height={75}
          />

          <ul className=" flex">
            <li className="mr-2"><Link href={'/'}>Home</Link></li>
            <li className="mr-2"><Link href={'/recipes'}>Recipes</Link></li>
            <li className="mr-2"><Link href={'/about'}>About</Link></li>
            <li className="mr-2"><Link href={'/contact'}>Contact</Link></li>
          </ul>

    
            {isClient && session ? <div className="flex gap-4 items-center">
                <p>{`Welcome ${session.user.name}`}</p>
                <Button onClick={signOut}>Sign out</Button>
            </div> : 
              <Button onClick={signIn}>Sign In</Button>}
    
        </header>
      </Container>

      <main>
        {children}
      </main>
    </>
  );
};