import React from 'react'

const EmptyState = () => {
    return (
        <div className="flex flex-col items-center justify-center py-16">
            <img src="/empty-state.png" alt="No projects" className="w-48 h-48 mb-4" />
            <h2 className="text-x1 font-semibold Itext-gray-500">No projects found</h2>
            <p className="text-gray-400">Create a new project to get started ! </p>
        </div>
    )
}

export default EmptyState