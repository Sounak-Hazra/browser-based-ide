"use client"
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usePlaygroundForGeneralLanguage } from '@/modules/general-language-playground/hooks/useGeneralPerpousePlayground'
import LoadingStep from '@/modules/playground/components/loader'
import PlaygroundEditor from '@/modules/playground/components/playground-editor'
import { TemplateFileTree } from '@/modules/playground/components/playground-explorer'
import { useFileExplorerForGeneralLanguage } from '@/modules/general-language-playground/hooks/useFIleExplorerForGeneralLanguages'
import { findFilePath } from '@/modules/playground/lib'
import { TemplateFile, TemplateFolder } from '@/modules/playground/lib/path-to-json'
import { AlertCircle, Bot, FileText, FolderOpen, Save, Settings, X } from 'lucide-react'
import { useParams, } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import TerminalComponentForGeneralLanguage from '@/modules/general-language-playground/components/terminal-for-general-language'
import RunButton from '@/modules/general-language-playground/components/run-button'
import WebContainerPreviewForGeneral from '@/modules/general-language-playground/components/terminal-preview'
import { useDockerContainers } from '@/modules/general-language-playground/hooks/useDockerContainers'

const PlaygroundHomePage = () => {

    const { id } = useParams<{ id: string }>()
    const [isPreviewVisible, setIsPreviewVisible] = useState(false)
    const [runButtonIsLoading, setRunButtonIsLoading] = useState(false)
    const terminalRef = useRef<any>(null);

    const { playGroundData, templateData, saveTemplate, compile, } = usePlaygroundForGeneralLanguage(id)

    const {
        setTemplateData,
        setActiveFileId,
        setPlaygroundId,
        setOpenFiles,
        activeFileId,
        closeAllFiles,
        openFile,
        openFiles,
        closeFile,
        handleAddFile,
        handleAddFolder,
        handleDeleteFile,
        handleDeleteFolder,
        handleRenameFile,
        handleRenameFolder,
        updateFileContent
    } = useFileExplorerForGeneralLanguage()

    const { containerId, error, isLoading, socketUrl, writeFileSync } = useDockerContainers({ playgroundId: id })

    const lastSyncedContentRef = useRef<Map<string, string>>(new Map());


    useEffect(() => {
        setPlaygroundId(id)
    }, [id, setPlaygroundId])


    useEffect(() => {
        if (templateData && !openFiles.length) {
            setTemplateData(templateData)
        }
    }, [templateData, setTemplateData, openFiles.length])


    const wrapperHandleAddFile = useCallback((newFile: TemplateFile, parentPath: string) => {
        return handleAddFile(
            newFile,
            parentPath,
            saveTemplate
        )
    }, [handleAddFile, saveTemplate])

    const wrappedHandleAddFolder = useCallback(
        (newFolder: TemplateFolder, parentPath: string) => {
            return handleAddFolder(newFolder, parentPath, saveTemplate);
        },
        [handleAddFolder, saveTemplate]
    );

    const wrappedHandleDeleteFile = useCallback(
        (file: TemplateFile, parentPath: string) => {
            return handleDeleteFile(file, parentPath, saveTemplate);
        },
        [handleDeleteFile, saveTemplate]
    );

    const wrappedHandleDeleteFolder = useCallback(
        (folder: TemplateFolder, parentPath: string) => {
            return handleDeleteFolder(folder, parentPath, saveTemplate);
        },
        [handleDeleteFolder, saveTemplate]
    );

    const wrappedHandleRenameFile = useCallback(
        (
            file: TemplateFile,
            newFilename: string,
            newExtension: string,
            parentPath: string
        ) => {
            return handleRenameFile(
                file,
                newFilename,
                newExtension,
                parentPath,
                saveTemplate
            );
        },
        [handleRenameFile, saveTemplate]
    );

    const wrappedHandleRenameFolder = useCallback(
        (folder: TemplateFolder, newFolderName: string, parentPath: string) => {
            return handleRenameFolder(
                folder,
                newFolderName,
                parentPath,
                saveTemplate
            );
        },
        [handleRenameFolder, saveTemplate]
    );


    const handleFileSelect = (file: TemplateFile) => {
        openFile(file)
    }

    const wrapperForCompile = useCallback((command: string) => {
        return compile(templateData!, command, id)
    }, [templateData, id])

    const wrapperForCompileSelectedFile = useCallback(async () => {
        const selectedFile = openFiles.find((file) => file.id === activeFileId);
        if (!selectedFile) {
            toast.error("No file selected for compilation");
            return;
        }

        try {
            setRunButtonIsLoading(true);
            const requireCommand = getRunnerCommand(selectedFile.filename, selectedFile.fileExtension);
            const data = await compile(templateData!, requireCommand, id, selectedFile);

            return {
                success: data.success,
                data: data.data,
                message: data.message
            }
        } catch (error) {
            console.error("Error during compilation:", error);
            toast.error("Compilation failed");
            return {
                success: false,
                data: "",
                message: "Compilation failed"
            }
        } finally {
            setRunButtonIsLoading(false);
        }
    }, [templateData, id, activeFileId, openFiles]);

    const activeFile = openFiles.find((file) => file.id === activeFileId);
    const hasUnsavedChanges = openFiles.some((file) => file.hasUnsavedChanges)

    const handleSave = useCallback(async (fileId?: string) => {   //Web container part need to change
        const targetedFileId = fileId || activeFileId;
        if (!targetedFileId) return;

        const fileToSave = openFiles.find((file) => file.id === targetedFileId);

        if (!fileToSave) return;

        const latestTemplateData = useFileExplorerForGeneralLanguage.getState().templateData;

        if (!latestTemplateData) return;

        try {
            console.log(latestTemplateData)
            const filePath = findFilePath(fileToSave, latestTemplateData);

            if (!filePath) {
                toast.error("Could not find file path");
                return;
            }

            const updatedTemplateData = JSON.parse(JSON.stringify(latestTemplateData));
            console.log("Updated Template Data before save:", updatedTemplateData);
            const updateFileContent = (items: (TemplateFolder | TemplateFile)[]): (TemplateFolder | TemplateFile)[] =>
                items.map((item) => {
                    if ("folderName" in item) {
                        return { ...item, items: updateFileContent(item.items) }
                    } else if (
                        item.filename === fileToSave.filename &&
                        item.fileExtension === fileToSave.fileExtension
                    ) {
                        return { ...item, content: fileToSave.content }
                    }
                    return item
                })

            updatedTemplateData.items = updateFileContent(
                updatedTemplateData.items
            )

            console.log("updated templated data after update", updatedTemplateData)


            const newTemplateData = await saveTemplate(updatedTemplateData || updatedTemplateData)
            console.log("New Template data", newTemplateData)
            // setTemplateData(newTemplateData || updatedTemplateData)
            setTemplateData(updatedTemplateData)



            if (!!writeFileSync) {
                writeFileSync()
            }

            const updatedOpenFiles = openFiles.map((file) =>
                file.id === targetedFileId
                    ? {
                        ...file,
                        content: fileToSave.content,
                        originalContent: fileToSave.content,
                        hasUnsavedChanges: false
                    } : file
            )

            setOpenFiles(updatedOpenFiles)

            toast.success(`Saved ${fileToSave.filename}.${fileToSave.fileExtension} successfully`);
        } catch (error) {
            console.error("Error saving file:", error);
            toast.error(`Failed to save ${fileToSave.filename}.${fileToSave.fileExtension}`);
            throw error
        }

    }, [
        activeFileId,
        openFiles,
        saveTemplate,
        setTemplateData,
        setOpenFiles
    ])

    const handleSaveAll = async () => {
        const unsavedFiles = openFiles.filter((file) => file.hasUnsavedChanges);

        if (unsavedFiles.length === 0) {
            toast.info("No unsaved changes to save");
            return;
        }

        try {
            await Promise.all(unsavedFiles.map((file) => handleSave(file.id)));
            toast.success(`Saved ${unsavedFiles.length} file(s) successfully`);
        } catch (error) {
            console.error("Error saving all files:", error);
            toast.error("Failed to save all files");
        }
    }


    useEffect(() => {
        const handKeydown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault()

                if (e.shiftKey) {
                    handleSaveAll()
                } else {
                    handleSave()
                }
            }
        }

        window.addEventListener("keydown", handKeydown)

        return () => {
            return window.removeEventListener("keydown", handKeydown)
        }
    }, [handleSave])

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem) ] p-4">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-red-600 mb-2">
                    Something went wrong
                </h2>
                <p className="[text-gray-600 mb-4]">{error}</p>
                <Button onClick={() => window.location.reload()} variant="destructive">
                    Try Again
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
                <div className="w-full max-w-md p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold mb-6 text-center">
                        Loading Playground
                    </h2>
                    <div className="mb-8">
                        <LoadingStep
                            currentStep={1}
                            step={1}
                            label="Loading playground data"
                        />
                        <LoadingStep
                            currentStep={2}
                            step={2}
                            label="Setting up environment"
                        />
                        <LoadingStep currentStep={3} step={3} label="Ready to code" />
                    </div>
                </div>
            </div>
        );
    }

    // No template data
    if (!templateData) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
                <FolderOpen className="h-12 w-12 text-amber-500 mb-4" />
                <h2 className="text-xl font-semibold text-amber-600 mb-2">
                    No template data available
                </h2>
                <Button onClick={() => window.location.reload()} variant="outline">
                    Reload Template
                </Button>
            </div>
        );
    }




    return (
        <TooltipProvider>
            <div className="flex h-screen">
                {/* Sidebar */}
                <TemplateFileTree
                    data={templateData}
                    onFileSelect={handleFileSelect}
                    selectedFile={activeFile}
                    title="File Explorer"
                    onAddFile={wrapperHandleAddFile}
                    onAddFolder={wrappedHandleAddFolder}
                    onDeleteFile={wrappedHandleDeleteFile}
                    onDeleteFolder={wrappedHandleDeleteFolder}
                    onRenameFile={wrappedHandleRenameFile}
                    onRenameFolder={wrappedHandleRenameFolder}
                />

                {/* Main content area */}
                <SidebarInset className="flex-1 flex flex-col">
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <div className="flex flex-1 items-center gap-2 px-4">
                            <div className="flex flex-col flex-1">
                                <h1 className="text-sm font-medium">
                                    {playGroundData?.title || "Playground"}
                                </h1>
                                <p className='text-xs text-muted-foreground'>
                                    {openFiles.length} File(s) open
                                    {hasUnsavedChanges && ". Unsaved changes"}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Tooltip>
                                    <TooltipTrigger>
                                        <RunButton isLoading={runButtonIsLoading} onClickRun={() => wrapperForCompileSelectedFile()} />
                                    </TooltipTrigger>
                                    <TooltipContent>Run Code</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleSave()}
                                            disabled={!activeFile || !activeFile.hasUnsavedChanges}
                                        >
                                            <Save className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Save (Ctrl + s)</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleSaveAll()}
                                            disabled={!hasUnsavedChanges}
                                        >
                                            <Save className="h-4 w-4" /> All
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Save (Ctrl + Shift + s)</TooltipContent>
                                </Tooltip>

                                <Button variant={'default'} size={"icon-sm"}>
                                    <Bot className='size-4' />
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="sm" variant="outline">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => setIsPreviewVisible(!isPreviewVisible)}>
                                            {isPreviewVisible ? "Hide" : "Show"} Preview
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={closeAllFiles}>
                                            Close All Files
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                            </div>
                        </div>
                    </header>

                    <div className="h-[calc(100vh-4rem)]">
                        {
                            openFiles.length > 0 ? (
                                <div className="h-full flex flex-col">
                                    <div className="border-b bg-muted/30">
                                        <Tabs value={activeFileId || ""} onValueChange={setActiveFileId}>
                                            <div className="flex items-center justify-between px-4 py-2">
                                                <TabsList className="h-8 bg-transparent p-0">
                                                    {openFiles.map((file) => (
                                                        <TabsTrigger
                                                            key={file.id}
                                                            value={file.id}
                                                            className="relative h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm group"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="h-3 w-3" />
                                                                <span>
                                                                    {file.filename}.{file.fileExtension}
                                                                </span>
                                                                {file.hasUnsavedChanges && (
                                                                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                                                                )}
                                                                <span
                                                                    className="ml-2 h-4 w-4 hover:bg-destructive hover:text-destructive-foreground rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        closeFile(file.id);
                                                                    }}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </span>
                                                            </div>
                                                        </TabsTrigger>
                                                    ))}
                                                </TabsList>

                                                {openFiles.length > 1 && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={closeAllFiles}
                                                        className="h-6 px-2 text-xs"
                                                    >
                                                        Close All
                                                    </Button>
                                                )}
                                            </div>
                                        </Tabs>
                                    </div>
                                    <div className='flex-1'>
                                        <ResizablePanelGroup direction='horizontal' className='h-full'>
                                            <ResizablePanel defaultSize={isPreviewVisible ? 50 : 100}>
                                                <PlaygroundEditor
                                                    activeFile={activeFile}
                                                    content={activeFile?.content || ""}
                                                    onContentChange={(value) => activeFileId && updateFileContent(activeFileId, value)}
                                                />
                                            </ResizablePanel>

                                            {
                                                isPreviewVisible && (
                                                    <>
                                                        <ResizableHandle />
                                                        <ResizablePanel defaultSize={50}>
                                                            { /*
                                                                <WebContainerPreview
                                                                templateData={templateData!}
                                                                instance={instance}
                                                                writeFileSync={writeFileSync}
                                                                isLoading={containerLoading}
                                                                error={containerError}
                                                                serverURL={serverURL!}
                                                                forceResetup={false}
                                                            />

                                                            */ }
                                                            <WebContainerPreviewForGeneral
                                                                compileCode={wrapperForCompile}
                                                                socketUrl={socketUrl!}
                                                                containerId={containerId!}
                                                                theme="dark"
                                                                className="h-full"
                                                                playgroundId={id}
                                                            />
                                                        </ResizablePanel>
                                                    </>
                                                )
                                            }
                                        </ResizablePanelGroup>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full items-center justify-center text-muted-foreground gap-4">
                                    <FileText className="h-16 w-16 text-gray-300" />
                                    <div className="text-center">
                                        <p className="text-1g font-medium">No files open</p>
                                        < p className="text-sm text-gray-500">
                                            Select a file from the sidebar to start editing
                                        </p>
                                    </div>
                                </div>
                            )
                        }
                    </div >

                </SidebarInset >
            </div >
        </TooltipProvider >

    )
}

export default PlaygroundHomePage