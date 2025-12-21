import React from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'

const PlaygroundLayout = async ({ children }: { children: React.ReactNode }) => {


    return (
        <>
            <SidebarProvider>

                <div className='flex min-h-screen w-full overflow-x-hidden'>

                    {/* Main */}
                    <main className='flex-1'>
                        {children}
                    </main>

                </div>

            </SidebarProvider>
        </>
    )
}

export default PlaygroundLayout