import { Button } from '@/components/ui/button';
import React from 'react'
import { Play } from 'lucide-react';
import { Loader2 } from 'lucide-react';



interface RunButtonProps {
    onClickRun: () => Promise<any>;
    isLoading?: boolean;
}

const RunButton = ({ onClickRun, isLoading }: RunButtonProps) => {

    const handleClick = async () => {
        onClickRun();
    }

    return (
        <>
            {/* <Button variant={'default'} onClick={handleClick} disabled={isLoading}>
                {
                    isLoading ?
                        <Loader2 size={5} className="animate-spin" />:
                        <Play size={5} />
                }
            </Button> */}
        </>
    )
}

export default RunButton