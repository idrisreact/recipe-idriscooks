"use client"

interface ContainerProps{
    children:React.ReactNode
}

export const Container =({children}:ContainerProps)=>{



    return <div className="m-auto w-full px-16">{children}</div>
}