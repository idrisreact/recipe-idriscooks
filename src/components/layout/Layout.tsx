"use client"
import React from "react"

interface LayoutHeaderProps {
  children: React.ReactNode
}

export const LayoutHeader = ({children}: LayoutHeaderProps) => {
  return <>
    <header>
      <h1>Idris cooks</h1>
    </header>
    <main>
      {children}
    </main>
  </>
}