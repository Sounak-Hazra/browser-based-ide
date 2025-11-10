import { TemplateFile, TemplateFolder, TemplateItem } from "@/modules/playground/lib/path-to-json";
import tar from "tar-stream"



type FlatFile = { path: string; content: string };
type PlaygroundRecord = { content: string | TemplateFolder } | TemplateFolder;


function fileTreeToTar(files: FlatFile[]) {
    const pack = tar.pack();
    for (const f of files) {
        pack.entry({ name: f.path }, f.content);
    }
    pack.finalize();
    return pack;
}

function isFolder(item: TemplateItem): item is TemplateFolder {
    return (item as TemplateFolder).items !== undefined;
}

function isFile(item: TemplateItem): item is TemplateFile {
    return (item as TemplateFile).filename !== undefined;
}

function flattenTemplateStructure(folder: TemplateFolder, basePath = ""): FlatFile[] {
    const files: FlatFile[] = [];
    const currentPath = basePath ? `${basePath}/${folder.folderName}` : folder.folderName;

    for (const item of folder.items) {
        if (isFolder(item)) {
            files.push(...flattenTemplateStructure(item, currentPath));
        } else if (isFile(item)) {
            const fileName = item.fileExtension
                ? `${item.filename}.${item.fileExtension}`
                : item.filename;
            files.push({ path: `${currentPath}/${fileName}`, content: item.content ?? "" });
        }
    }

    return files;
}


export const contentToTar = (playground: PlaygroundRecord[]) => {
    let files: FlatFile[] = []
    try {
        for (const p of playground) {
            const parsed =
                typeof (p as any).content === "string"
                    ? JSON.parse((p as any).content)
                    : (p as any).content ?? p;
            const flatFiles = flattenTemplateStructure(parsed as TemplateFolder);
            files.push(...flatFiles);
        }


        const tarStream = fileTreeToTar(files);
        
        return tarStream
    } catch (error) {
        console.log(error)
        return null
    }
}