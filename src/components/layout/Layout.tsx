"use client"
import Link from "next/link"
import Image from "next/image";
import React from "react"

import { Container } from "../ui/Container"
import { authClient } from "@/src/utils/auth-client"

interface LayoutHeaderProps {
  children: React.ReactNode
}


export const LayoutHeader = ({children}: LayoutHeaderProps) => {

    const signIn = async ()=>{
        const data = await authClient.signIn.social({
            provider:'google'
        })
    }
  return <>
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
      <button onClick={signIn}>Sign up</button>
    </header>
   </Container>
    <main>
      {children}
    </main>
  </>
}