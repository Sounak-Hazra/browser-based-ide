import { Button } from '@/components/ui/button';
import React from 'react'
import { Play } from 'lucide-react';
import { Loader2 } from 'lucide-react';



interface RunButtonProps {
    onClickRun: () => void;
}

const RunButton = ({ onClickRun }: RunButtonProps) => {

    const handleClick = async () => {
        onClickRun();
    }

    return (
        <>
            <Button
                size="sm"
                variant="default"
                onClick={handleClick}
            >
                <Play className="h-4 w-4" />

            </Button >
        </>
    )
}

export default RunButton