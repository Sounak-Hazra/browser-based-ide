// import path from "path";
// import fs from "fs/promises";
// import Playground from "../../../models/playground.models.ts";
// import TemplatesFilesModel from "../../../models/templateFile.models.ts";
// import { templatePaths } from "../../../lib/template.ts";
// import {
//   readTemplateStructureFromJson,
//   saveTemplateStructureToJson,
// } from "../../../modules/playground/lib/path-to-json.ts";
// import express from "express";


// function validateJson(data: any): boolean{
//     try {
//         JSON.parse(JSON.stringify(data))
//         return true
//     } catch (error) {
//         console.log(error)
//         return false
//     }
// }


// export const getTemplateJson = async (req: express.Request, res: express.Response) => {
//   try {
//     const { id } = req.params;

//     if (!id) {
//       return res.status(400).json({
//         message: "Id not found.",
//         success: false,
//       });
//     }

//     const playground = await Playground.findById(id);
//     if (!playground) {
//       return res.status(404).json({
//         message: "Playground not found.",
//         success: false,
//       });
//     }

//     const templateKey = playground.template as keyof typeof templatePaths;
//     const templatePath = templatePaths[templateKey];

//     if (!templatePath) {
//       return res.status(400).json({
//         message: "Invalid template key.",
//         success: false,
//       });
//     }

//     const inputPath = path.join(process.cwd(), templatePath);
//     const outputPath = path.join(process.cwd(), `output/${templateKey}.json`);

//     await saveTemplateStructureToJson(inputPath, outputPath);
//     const result = await readTemplateStructureFromJson(outputPath);

//     // Save template file if not exists
//     if (!playground.templateFiles.length) {
//       const templateFile = await TemplatesFilesModel.create({
//         playgroundId: playground._id,
//         content: JSON.stringify(result),
//       });

//       playground.templateFiles.push(templateFile._id);
//       await playground.save();
//     }

//     if (!validateJson(result.items)) {
//       return res.status(500).json({
//         message: "Unable to make JSON.",
//         success: false,
//       });
//     }

//     await fs.unlink(outputPath);

//     return res.status(200).json({
//       success: true,
//       templateJson: result,
//     });
//   } catch (error) {
//     console.error("Error in getTemplateJson:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//       success: false,
//     });
//   }
// };
