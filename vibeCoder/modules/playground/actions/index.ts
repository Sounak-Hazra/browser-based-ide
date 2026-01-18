"use server"

import { connectDB } from "@/lib/mongoose"
import Playground from "@/models/playground.models"
import { PlaygroundFetch } from "@/modules/dahboard/type"
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/api-responce"
import type { TemplateFile, TemplateFolder } from "../lib/path-to-json"
import { currentUser } from "@/modules/auth/actions"
import TemplatesFilesModel from "@/models/templateFile.models"
import mongoose from "mongoose"

interface PlaygroundData extends PlaygroundFetch {
    templateFiles: TemplateFile[]
    [key: string]: any
}

export async function getPlaygroundById(id: string): Promise<ApiSuccessResponse<PlaygroundData> | ApiErrorResponse> {
    try {

        await connectDB()
        const playGround = await Playground
            .findById(id)
            .populate("templateFiles")
            .lean()

        if (!playGround) {
            throw new Error("Playground not found.")
        }

        return {
            success: true,
            data: JSON.parse(JSON.stringify(playGround)),
            message: "Playground fetched successfully"
        }
    } catch (error: unknown) {
        console.log(error)
        return {
            success: false,
            message: (error as any).message || "Unable to get playground."
        }
    }
}



export async function SaveUpdatedCode(playgroundId: string, data: TemplateFolder): Promise<ApiSuccessResponse<TemplateFolder> | ApiErrorResponse> {
    try {
        const user = await currentUser()

        const existingFile = await TemplatesFilesModel.findOne({
            playgroundId: playgroundId
        })
        const playGround = await Playground.findById(playgroundId)

        if (!existingFile) {
            const file = await TemplatesFilesModel.create({
                playgroundId: playgroundId,
                content: JSON.stringify(data)
            })

            playGround.templateFiles?.push(new mongoose.Types.ObjectId(file._id))

            await playGround.save()

        } else {
            existingFile.content = JSON.stringify(data)
            await existingFile.save()
        }

        const updatedPlayGround = await TemplatesFilesModel.findOne({
            playgroundId: playgroundId
        })

        console.log("Playground data updated broooooo.......")

        return {
            success: true,
            data: JSON.parse(JSON.stringify(updatedPlayGround.content)), //! Change here
            // data: JSON.parse(JSON.stringify(updatedPlayGround)),
            message: "Playground fetched successfully"
        }

    } catch (error: unknown) {
        console.log(error)
        return {
            success: false,
            message: (error as any).message || "Unable to get playground.",
            data: null
        }
    }
}