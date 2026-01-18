import { deletePlayground, duplaicatePlayground, editProjectById, getAllPlaygroundForUsers, toggleFavouritPlayground } from '@/modules/dahboard/actions'
import AddNewButton from '@/modules/dahboard/components/add-new-button'
import AddRepo from '@/modules/dahboard/components/add-new-repo'
import EmptyState from '@/modules/dahboard/components/empty-state'
import ProjectTable from '@/modules/dahboard/components/project-table'

const Page = async () => {

    const playGrounds = await getAllPlaygroundForUsers()
    return (
        <div className="flex flex-col justify-start items-center min-h-screen mx-auto
max-w-7x1 px-4 py-10">
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full'>
                <AddNewButton />
                <AddRepo />
            </div>
            <div className="mt-10 flex flex-col justify-center items-center w-full">
                {playGrounds && playGrounds.length === 0 ? (
                    <EmptyState />)
                    : (
                        <ProjectTable
                            projects={playGrounds.map(e=>({id:e._id, ...e})) || []}
                            onDeleteProject={deletePlayground}
                            onUpdateProject={editProjectById}
                            onDuplicateProject={duplaicatePlayground}
                            onMarkasFavorite={toggleFavouritPlayground}
                        />)
                }

            </div>
        </div>
    )
}

export default Page