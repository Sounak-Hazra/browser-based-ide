import React from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { getAllPlaygroundForUsers } from '@/modules/dahboard/actions'
import { DashboardSidebar } from '@/modules/dahboard/components/dashboard-sidebar'

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {


    const playgroundData = await getAllPlaygroundForUsers()

    const technologyIconMap: Record<string, string> = {
        REACT: "Zap",
        NEXTJS: "Lightbulb",
        EXPRESS: "Database",
        VUE: "Compass",
        HONO: "FlameIcon",
        ANGULAR: "Terminal",

    }

    const formattedPlaygroundData = playgroundData?.map((item) => ({
        icon: technologyIconMap[item.template],
        ...item
    }))

    return (
        <>
            <SidebarProvider>

                <div className='flex min-h-screen w-full overflow-x-hidden'>

                    {/* Sidebar */}
                    <DashboardSidebar initialPlaygroundData={formattedPlaygroundData} />

                    {/* Main */}
                    <main className='flex-1'>
                        {children}
                    </main>

                </div>

            </SidebarProvider>
        </>
    )
}

export default DashboardLayout