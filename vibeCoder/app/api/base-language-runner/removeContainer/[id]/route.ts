import { NextRequest, NextResponse } from "next/server";
import Docker from "dockerode"

const docker = new Docker()

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const container = docker.getContainer(id)

        try {
            await container.stop()
        } catch (error) {
            return NextResponse.json({ message: error instanceof Error ? error.message : "Container Alredy Removed!" }, { status: 500 })
        }
        await container.remove()

        return NextResponse.json({
            message: "Success!",
        }, { status: 200 })
    } catch (error: unknown) {
        return NextResponse.json({ message: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 })
    }
}