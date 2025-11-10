"use server"

import { connectDB } from "@/lib/mongoose"
import Playground from "@/models/playground.models"
import { currentUser } from "@/modules/auth/actions"
import { revalidatePath } from "next/cache"
import type { Favourit as FavouritTypes, PlaygroundCreate, PlaygroundFetch } from "../type"
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/api-responce"
import Favourit from "@/models/favourits.models"


export async function getAllPlaygroundForUsers(): Promise<PlaygroundFetch[]> {
    try {

        await connectDB()

        const user = await currentUser()

        if (!user) {
            throw new Error("User not found")
        }

        const playgrounds = await Playground.find({
            userId: user._id
        })
            .populate("userId")
            .populate("favourit")
            .lean()


        return JSON.parse(JSON.stringify(playgrounds)) || []


    } catch (error) {
        console.log(error)
        return []
    }
}


export async function createPlayground(data: PlaygroundCreate): Promise<ApiSuccessResponse<PlaygroundFetch> | ApiErrorResponse> {

    try {
        await connectDB()
        const user = await currentUser()

        const { title, description, template, perpous } = data

        const playGround = await Playground.create({
            title,
            description,
            template,
            userId: user?._id!,
            perpous
        })

        revalidatePath("/dashboard")
        return {
            success: true,
            data: JSON.parse(JSON.stringify(playGround)),
            message: "Playground Created successfully."
        }
    } catch (error: any) {
        console.log(error)
        return {
            success: false,
            message: error.message || "Failed to create project."
        }
    }
}


export async function deletePlayground(_id: string): Promise<ApiSuccessResponse<boolean> | ApiErrorResponse> {
    try {

        await connectDB()

        await Playground.deleteOne({
            _id
        })

        revalidatePath("/dashborad")
        return {
            success: true,
            data: true,
            message: "Playground Created successfully."
        }
    } catch (error: any) {
        console.log(error)
        return {
            success: false,
            message: error.message || "Falied to delete playground."
        }
    }
}


export async function editProjectById(id: string, data: { title: string, description: string }): Promise<ApiSuccessResponse<null> | ApiErrorResponse> {

    try {
        connectDB()

        await Playground.findByIdAndUpdate(id, data)

        revalidatePath("/dashboard")

        return {
            success: true,
            message: "Successfully Updated.",
            data: null
        }
    } catch (error: any) {
        console.log(error)
        return {
            success: false,
            message: error.message || "Failed to update project details",
            error: error.message || "Failed to update project details",
        }
    }
}


export async function duplaicatePlayground(id: string): Promise<ApiSuccessResponse<PlaygroundFetch> | ApiErrorResponse> {

    try {
        await connectDB()

        const originalPlayground = await Playground.findById(id)

        const user = await currentUser()

        if (!user) {
            throw new Error("User not found.")
        }

        if (!originalPlayground) {
            throw new Error("Original Playground not found.")
        }

        const newPlayground = await Playground.create({
            title: `${originalPlayground.title} (Copy)`,
            description: originalPlayground.description,
            template: originalPlayground.template,
            userId: user._id
        })

        revalidatePath("/dashboard")

        return {
            success: true,
            data: JSON.parse(JSON.stringify(newPlayground)),
            message: "Playground Duplicated successfully"
        }

    } catch (error: any) {
        console.log(error)
        return {
            success: false,
            message: error.message || "Failed to duplicate playground."
        }
    }

}

export async function toggleFavouritPlayground(id: string): Promise<ApiSuccessResponse<FavouritTypes> | ApiErrorResponse>  {
    try {

        await connectDB()

        const playGround = await Playground.findById(id)

        if (!playGround) throw new Error("Playground not found.")
        
        let marked = await Favourit.findById(playGround.favourit?._id)

        if (!marked) {
            const user = await currentUser()
            marked = await Favourit.create({
                userId: user?._id,
                playgroundId: id,
                isMarked: false
            })

            playGround.favourit = marked._id

            await playGround.save()
        }
        const work = marked.isMarked

        if (work) {//* Alredy marked need to unmark
            marked.isMarked = false
            await marked.save()
            revalidatePath("/dashboard", "layout")
            return {
                success: true,
                message: "Successfully unmarked",
                data: JSON.parse(JSON.stringify(marked))
            }
        } else {//* Unmarked need to marked
            marked.isMarked = true
            await marked.save()
            revalidatePath("/dashboard", "layout")
            return {
                success: true,
                message: "Successfully marked",
                data: JSON.parse(JSON.stringify(marked))
            }
        } 

        

    } catch (error: any) {
        console.log(error)
        return {
            success: false,
            message: error.message || "Server error."
        }
    }
}