"use server"

import {auth} from '@/src/utils/auth';


export const signIn = async ()=>{
    await auth.api.signInEmail({
        body:{
            email:'idrist2013@gmail.com',
            password:'password123'
        }
    })
}

export const signUp = async ()=>{
    await auth.api.signUpEmail({
        body:{
            email:'idrist2013@gmail.com',
            password:'password123',
            name:'idris'
        }
    })
}