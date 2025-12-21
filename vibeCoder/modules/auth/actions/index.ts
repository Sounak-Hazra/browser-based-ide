
import { auth, signIn } from "@/modules/auth/core/auth"
import { db, connect } from "@/lib/db"
import mongoose from "mongoose"
import { User as UserType } from "@/modules/dahboard/type"
import { connectDB } from "@/lib/mongoose"
import User from "@/models/user.models"


export const getUserById = async (id: string) => {
    try {
        await connectDB()
        const user = await db.collection("users").findOne({
            _id: new mongoose.Types.ObjectId(id)
        })

        return user
    } catch (error) {
        console.log(error)
        return null
    }
}


export const getAccountByUserId = async (userId: string) => {
    try {
        await connectDB()

        const account = await db.collection("account").findOne({
            userId
        })

        return account
    } catch (error) {
        console.log(error)
        return null
    }

    // try {
    //     await connectDB()

    //     const user = await User.findById(userId)

    //     if (!user) throw new Error("User not found.")
        
    //     return user
    // } catch (error) {
    //     console.log(error)
    //     return undefined
    // }
}


export const currentUser = async ():Promise<UserType | undefined> => {
    try {
        const session = await auth()
        
    
        if (!session) {
            throw new Error("Session not found try relogin.")
        }
    
        await connectDB()
    
        const acUser = await User.findById(session.user.id)
    
            if(!acUser) throw new Error("Current user not found.")
         
        return acUser
    } catch (error) {
        console.log(error)
        return undefined
    }
}

