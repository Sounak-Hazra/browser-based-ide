export const workingDirectoryGenerator = ({
    // userId,
    projectId,
    // runId = "run1"
}: {
    // userId: string,
    projectId: string,
    // runId: string
}) => {
    return `/workspace/${projectId}/`
}