export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Playground from "@/models/playground.models";
import { runInDocker } from "../../../../../backend/lib/runner";
import { connectDB } from "@/lib/mongoose";
import { currentUser } from "@/modules/auth/actions";
import containersModels from "@/models/containers.models";


export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    await connectDB();
    try {
        const { id } = await params;

        const { command } = await req.json()

        if (!id) {
            return NextResponse.json(
                { message: "Id not found.", success: false },
                { status: 400 }
            );
        }


        const playground = await Playground.findById(id).populate('templateFiles');

        if (!playground) {
            return NextResponse.json(
                { message: "Playground not found.", success: false },
                { status: 404 }
            );
        }

        const user = await currentUser()

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized", success: false },
                { status: 401 }
            );
        }

        const container = await containersModels.findOne({
            userId: user._id,
            projectId: "generalPlayground",
        });

        if (!container) {
            const data = await runInDocker({
                userId: "testUser",
                projectId: "generalPlayground",
                runId: "run1",
                cmd: command,
                playground: playground!.templateFiles,
            })
            return NextResponse.json({
                success: true,
                data
            }, { status: 200 })
        } else{

        }

    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { message: "Internal server error", success: false },
            { status: 500 }
        );
    }
}