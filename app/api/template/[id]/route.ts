import { readTemplateStructureFromJson, saveTemplateStructureToJson } from "@/modules/playground/lib/path-to-json";
import { templatePaths } from "@/lib/template";
import path from "path";
import fs from "fs/promises"
import { NextRequest, NextResponse } from "next/server";
import Playground from "@/models/playground.models";


function validateJson(data: any): boolean{
    try {
        JSON.parse(JSON.stringify(data))
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}


export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { message: "Id not found.", success: false },
                { status: 400 }
            );
        }


        const playground = await Playground.findById(id)


        const templateKey = playground.template as keyof typeof templatePaths
        const templatePath = templatePaths[templateKey]


        const inputPath = path.join(process.cwd(), templatePath)
        const outPutPath = path.join(process.cwd(), `output/${templateKey}.json`)

        await saveTemplateStructureToJson(inputPath, outPutPath)
        const result = await readTemplateStructureFromJson(outPutPath)


        if (!validateJson(result.items)) {
            return NextResponse.json({
                message: "Unable to make json."
            }, {status: 500})
        }

        await fs.unlink(outPutPath)

        return NextResponse.json({
            success: true,
            templateJson: result
        }, { status: 200 })

        
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { message: "Internal server error", success: false },
            { status: 500 }
        );
    }
}