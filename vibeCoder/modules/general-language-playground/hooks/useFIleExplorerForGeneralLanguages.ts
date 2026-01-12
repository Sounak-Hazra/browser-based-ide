import { create } from 'zustand';
import { toast } from "sonner";

import { findFilePath, generateFileId } from '@/modules/playground/lib';
import { TemplateFile, TemplateFolder } from '@/modules/playground/lib/path-to-json';

interface OpenFile extends TemplateFile {
    id: string,
    hasUnsavedChanges: boolean,
    content: string,
    originalContent: string
}

type SaveTemplateDataReturnType = {
    templateFiles: TemplateFile[]
    [key: string]: any
}



interface FileExplorerState {
    playgroundId: string;
    templateData: TemplateFolder | null;
    openFiles: OpenFile[];
    activeFileId: string | null;
    editorContent: string;

    //Setter
    setPlaygroundId: (id: string) => void;
    setTemplateData: (data: TemplateFolder | null) => void;
    setEditorContent: (content: string) => void;
    setOpenFiles: (files: OpenFile[]) => void;
    setActiveFileId: (fileId: string | null) => void;


    //Function
    openFile: (file: TemplateFile) => void;
    closeFile: (fileId: string) => void;
    closeAllFiles: () => void;


    //File explorer methods
    handleAddFile: (
        newFile: TemplateFile,
        parentPath: string,
        // saveTemplateData: (data: TemplateFolder) => Promise<SaveTemplateDataReturnType | undefined>
        saveTemplateData: (data: TemplateFolder) => Promise<void>,
        writeFileSync: () => Promise<void>

    ) => Promise<void>

    handleAddFolder: (
        newFolder: TemplateFolder,
        parentPath: string,
        // saveTemplateData: (data: TemplateFolder) => Promise<SaveTemplateDataReturnType | undefined>
        saveTemplateData: (data: TemplateFolder) => Promise<void>,
        writeFileSync: () => Promise<void>

    ) => Promise<void>

    handleDeleteFile: (
        file: TemplateFile,
        parentPath: string,
        // saveTemplateData: (data: TemplateFolder) => Promise<SaveTemplateDataReturnType | undefined>
        saveTemplateData: (data: TemplateFolder) => Promise<void>,
        writeFileSync: () => Promise<void>
    ) => Promise<void>

    handleDeleteFolder: (
        folder: TemplateFolder,
        parentPath: string,
        // saveTemplateData: (data: TemplateFolder) => Promise<SaveTemplateDataReturnType | undefined>
        saveTemplateData: (data: TemplateFolder) => Promise<void>,
        writeFileSync: () => Promise<void>

    ) => Promise<void>

    handleRenameFile: (
        file: TemplateFile,
        newFileName: string,
        newFileExtension: string,
        parentPath: string,
        // saveTemplateData: (data: TemplateFolder) => Promise<SaveTemplateDataReturnType | undefined>
        saveTemplateData: (data: TemplateFolder) => Promise<void>,
        writeFileSync: () => Promise<void>

    ) => Promise<void>

    handleRenameFolder: (
        folder: TemplateFolder,
        newFolderName: string,
        parentPath: string,
        // saveTemplateData: (data: TemplateFolder) => Promise<SaveTemplateDataReturnType | undefined>
        saveTemplateData: (data: TemplateFolder) => Promise<void>,
        writeFileSync: () => Promise<void>

    ) => Promise<void>

    updateFileContent: (fileId: string, content: string) => void

    handleFindFilePath: () => { parentFolderPath: string; fullFilePath: string, fileNameWithExtension: string } | undefined;
}


export const useFileExplorerForGeneralLanguage = create<FileExplorerState>((set, get) => ({
    templateData: null,
    playgroundId: "",
    openFiles: [] satisfies OpenFile[],
    activeFileId: null,
    editorContent: "",

    setTemplateData: (data) => set({ templateData: data }),
    setPlaygroundId(id) {
        set({ playgroundId: id });
    },
    setEditorContent: (content) => set({ editorContent: content }),

    setOpenFiles: (files) => set({ openFiles: files }),
    setActiveFileId: (fileId) => set({
        activeFileId: fileId
    }),

    openFile: (file) => {
        const fileId = generateFileId(file, get().templateData!)
        const { openFiles } = get()

        const existingFile = openFiles.find((f) => f.id === fileId)

        if (existingFile) {
            set({ activeFileId: fileId, editorContent: existingFile.content })
            return
        }

        const newOpenFile: OpenFile = {
            ...file,
            id: fileId,
            hasUnsavedChanges: false,
            content: file.content,
            originalContent: file.content
        }

        set((state) => ({
            openFiles: [...state.openFiles, newOpenFile],
            activeFileId: fileId,
            editorContent: file.content
        }))

    },

    closeFile: (fileId) => {
        const { openFiles, activeFileId } = get();
        const newFiles = openFiles.filter((f) => f.id !== fileId);

        // If we're closing the active file, switch to another file or clear act
        let newActiveFileId = activeFileId;
        let newEditorContent = get().editorContent;

        if (activeFileId === fileId) {
            if (newFiles.length > 0) {
                const lastFile = newFiles[newFiles.length - 1];
                newActiveFileId = lastFile.id;
                newEditorContent = lastFile.content;
            }

            else {
                newActiveFileId = null;
                newEditorContent = ""
            }
        }

        set({
            openFiles: newFiles,
            activeFileId: newActiveFileId,
            editorContent: newEditorContent
        })
    },

    closeAllFiles: () => {
        set({
            openFiles: [],
            activeFileId: null,
            editorContent: "",
        })
    },


    handleAddFile: async (newFile, parentPath, saveTemplateData, writeFileSync) => {
        const { templateData } = get()

        if (!templateData) return

        try {
            const updatedTemplateData = JSON.parse(JSON.stringify(templateData)) as TemplateFolder
            const pathParts = parentPath.split("/")
            let currentFolder = updatedTemplateData

            for (const part of pathParts) {
                if (part) {
                    const nextFolder = currentFolder.items.find(
                        (item) => "folderName" in item && item.folderName === part
                    ) as TemplateFolder

                    if (nextFolder) currentFolder = nextFolder
                }
            }

            currentFolder.items.push(newFile)
            set({ templateData: updatedTemplateData })
            toast.success(`Created file ${newFile.filename}.${newFile.fileExtension}`)

            await saveTemplateData(updatedTemplateData)

            await writeFileSync()

            get().openFile(newFile)
        } catch (error) {
            console.log(error)
            const errorMessage = error instanceof Error ? error.message : "Unable to create new file for more information check browser console"
            toast.error(errorMessage)
        }
    },

    handleAddFolder: async (newFolder, parentPath, saveTemplateData, writeFileSync) => {
        const { templateData } = get();
        console.log("previous template data", templateData)
        if (!templateData) return;

        try {
            const updatedTemplateData = JSON.parse(JSON.stringify(templateData)) as TemplateFolder;
            const pathParts = parentPath.split("/");
            let currentFolder = updatedTemplateData;

            for (const part of pathParts) {
                if (part) {
                    const nextFolder = currentFolder.items.find(
                        (item) => "folderName" in item && item.folderName === part
                    ) as TemplateFolder;
                    if (nextFolder) currentFolder = nextFolder;
                }
            }

            currentFolder.items.push(newFolder);
            set({ templateData: updatedTemplateData });
            toast.success(`Created folder: ${newFolder.folderName}`);
            console.log("Updated template data", updatedTemplateData)

            // Use the passed saveTemplateData function
            await saveTemplateData(updatedTemplateData);

            await writeFileSync()

        } catch (error) {
            console.error("Error adding folder:", error);
            toast.error("Failed to create folder");
        }
    },

    handleDeleteFile: async (file, parentPath, saveTemplateData, writeFileSync) => {
        const { templateData, openFiles } = get();
        if (!templateData) return;

        try {
            const updatedTemplateData = JSON.parse(
                JSON.stringify(templateData)
            ) as TemplateFolder;
            const pathParts = parentPath.split("/");
            let currentFolder = updatedTemplateData;

            for (const part of pathParts) {
                if (part) {
                    const nextFolder = currentFolder.items.find(
                        (item) => "folderName" in item && item.folderName === part
                    ) as TemplateFolder;
                    if (nextFolder) currentFolder = nextFolder;
                }
            }

            currentFolder.items = currentFolder.items.filter(
                (item) =>
                    !("filename" in item) ||
                    item.filename !== file.filename ||
                    item.fileExtension !== file.fileExtension
            );

            // Find and close the file if it's open
            // Use the same ID generation logic as in openFile
            const fileId = generateFileId(file, templateData);
            const openFile = openFiles.find((f) => f.id === fileId);

            if (openFile) {
                // Close the file using the closeFile method
                get().closeFile(fileId);
            }

            set({ templateData: updatedTemplateData });

            // Use the passed saveTemplateData function
            await saveTemplateData(updatedTemplateData);
            await writeFileSync()
            toast.success(`Deleted file: ${file.filename}.${file.fileExtension}`);
        } catch (error) {
            console.error("Error deleting file:", error);
            toast.error("Failed to delete file");
        }
    },

    handleDeleteFolder: async (folder, parentPath, saveTemplateData, writeFileSync) => {
        const { templateData } = get();
        if (!templateData) return;

        try {
            const updatedTemplateData = JSON.parse(
                JSON.stringify(templateData)
            ) as TemplateFolder;
            console.log(parentPath);
            const pathParts = parentPath.split("/");
            let currentFolder = updatedTemplateData;

            for (const part of pathParts) {
                if (part) {
                    const nextFolder = currentFolder.items.find(
                        (item) => "folderName" in item && item.folderName === part
                    ) as TemplateFolder;
                    if (nextFolder) currentFolder = nextFolder;
                }
            }

            currentFolder.items = currentFolder.items.filter(
                (item) =>
                    !("folderName" in item) || item.folderName !== folder.folderName
            );

            // Close all files in the deleted folder recursively
            const closeFilesInFolder = (folder: TemplateFolder, currentPath: string = "") => {
                folder.items.forEach((item) => {
                    if ("filename" in item) {
                        // Generate the correct file ID using the same logic as openFile
                        const fileId = generateFileId(item, templateData);
                        get().closeFile(fileId);
                    } else if ("folderName" in item) {
                        const newPath = currentPath ? `${currentPath}/${item.folderName}` : item.folderName;
                        closeFilesInFolder(item, newPath);
                    }
                });
            };

            closeFilesInFolder(folder, parentPath ? `${parentPath}/${folder.folderName}` : folder.folderName);

            set({ templateData: updatedTemplateData });

            // Use the passed saveTemplateData function
            await saveTemplateData(updatedTemplateData);
            await writeFileSync()
            toast.success(`Deleted folder: ${folder.folderName}`);
        } catch (error) {
            console.error("Error deleting folder:", error);
            toast.error("Failed to delete folder");
        }
    },

    handleRenameFile: async (
        file,
        newFilename,
        newExtension,
        parentPath,
        saveTemplateData,
        writeFileSync
    ) => {
        const { templateData, openFiles, activeFileId } = get();
        if (!templateData) return;

        // Generate old and new file IDs using the same logic as openFile
        const oldFileId = generateFileId(file, templateData);
        const newFile = { ...file, filename: newFilename, fileExtension: newExtension };
        const newFileId = generateFileId(newFile, templateData);

        try {
            const updatedTemplateData = JSON.parse(
                JSON.stringify(templateData)
            ) as TemplateFolder;
            const pathParts = parentPath.split("/");
            let currentFolder = updatedTemplateData;

            for (const part of pathParts) {
                if (part) {
                    const nextFolder = currentFolder.items.find(
                        (item) => "folderName" in item && item.folderName === part
                    ) as TemplateFolder;
                    if (nextFolder) currentFolder = nextFolder;
                }
            }

            const fileIndex = currentFolder.items.findIndex(
                (item) =>
                    "filename" in item &&
                    item.filename === file.filename &&
                    item.fileExtension === file.fileExtension
            );

            if (fileIndex !== -1) {
                const updatedFile = {
                    ...currentFolder.items[fileIndex],
                    filename: newFilename,
                    fileExtension: newExtension,
                } as TemplateFile;
                currentFolder.items[fileIndex] = updatedFile;

                // Update open files with new ID and names
                const updatedOpenFiles = openFiles.map((f) =>
                    f.id === oldFileId
                        ? {
                            ...f,
                            id: newFileId,
                            filename: newFilename,
                            fileExtension: newExtension,
                        }
                        : f
                );

                set({
                    templateData: updatedTemplateData,
                    openFiles: updatedOpenFiles,
                    activeFileId: activeFileId === oldFileId ? newFileId : activeFileId,
                });

                // Use the passed saveTemplateData function
                await saveTemplateData(updatedTemplateData);
                await writeFileSync()
                toast.success(`Renamed file to: ${newFilename}.${newExtension}`);
            }
        } catch (error) {
            console.error("Error renaming file:", error);
            toast.error("Failed to rename file");
        }
    },


    handleRenameFolder: async (folder, newFolderName, parentPath, saveTemplateData, writeFileSync) => {
        const { templateData } = get();
        if (!templateData) return;

        try {
            const updatedTemplateData = JSON.parse(
                JSON.stringify(templateData)
            ) as TemplateFolder;
            const pathParts = parentPath.split("/");
            let currentFolder = updatedTemplateData;

            for (const part of pathParts) {
                if (part) {
                    const nextFolder = currentFolder.items.find(
                        (item) => "folderName" in item && item.folderName === part
                    ) as TemplateFolder;
                    if (nextFolder) currentFolder = nextFolder;
                }
            }

            const folderIndex = currentFolder.items.findIndex(
                (item) => "folderName" in item && item.folderName === folder.folderName
            );

            if (folderIndex !== -1) {
                const updatedFolder = {
                    ...currentFolder.items[folderIndex],
                    folderName: newFolderName,
                } as TemplateFolder;
                currentFolder.items[folderIndex] = updatedFolder;

                set({ templateData: updatedTemplateData });

                // Use the passed saveTemplateData function
                await saveTemplateData(updatedTemplateData);
                await writeFileSync()
                toast.success(`Renamed folder to: ${newFolderName}`);
            }
        } catch (error) {
            console.error("Error renaming folder:", error);
            toast.error("Failed to rename folder");
        }
    },

    updateFileContent: (fileId, content) => {
        set((state) => ({
            openFiles: state.openFiles.map((file) =>
                file.id === fileId
                    ? {
                        ...file,
                        content,
                        hasUnsavedChanges: content !== file.originalContent,
                    }
                    : file
            ),
            editorContent:
                fileId === state.activeFileId ? content : state.editorContent,
        }));
    },

    handleFindFilePath: () => {
        const { templateData, activeFileId } = get();

        if (!templateData || !activeFileId) {
            return undefined;
        }

        const activeFile = get().openFiles.find(e => e.id === activeFileId);


        const path = findFilePath(activeFile as TemplateFile, templateData)

        // console.log("Found path: ", path)
        // console.log("templateData folder name: ",
        // templateData.folderName )
        const fullPath = `${templateData.folderName}/${path}`

        const pathWithoutFile = fullPath?.split("/").slice(0, -1).join("/") 

        if (templateData.folderName) {
            return {
                fileNameWithExtension: `${activeFile?.filename}${activeFile?.fileExtension ? `.${activeFile?.fileExtension}` : ""}`,
                fullFilePath: path ? `${templateData.folderName}/${path}` : "",
                parentFolderPath: pathWithoutFile
            }
        }
        else {
            return {
                fileNameWithExtension: `${activeFile?.filename}${activeFile?.fileExtension ? `.${activeFile?.fileExtension}` : ""}`,
                fullFilePath: path || "",
                parentFolderPath: pathWithoutFile! //!Error may be null but we handle that above
            }
        }
    }
}))


