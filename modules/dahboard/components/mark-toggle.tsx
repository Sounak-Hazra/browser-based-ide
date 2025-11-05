import { Button } from '@/components/ui/button'
import { StarIcon, StarOffIcon } from 'lucide-react'
import React, { useState } from 'react'
import { Favourit } from '../type'
import { ApiErrorResponse, ApiSuccessResponse } from '@/types/api-responce'


interface MarkToggleProps {
    data: Favourit | undefined,
    _id: string,
    toggleFavourit: (_id: string) => Promise<boolean>,
}

const MarkToggleStar = ({ data, _id, toggleFavourit }: MarkToggleProps) => {

    const [isMarked, setIsMarked] = useState(data?.isMarked || false)

    const handleToggle = async () => {
        const success = await toggleFavourit(_id)

        if (success) {
            setIsMarked(prev=>!prev)
        }
    }
    return (
        <Button
            // ref={ref}
            variant="ghost"
            // className={`flex items-center justify-start w-full px-2 py-1.5 text-sm rounded-md cursor-pointer ${className}`}
            className={`flex items-center justify-start w-full px-2 py-1.5 text-sm rounded-md cursor-pointer`}
            onClick={handleToggle}
        // {...props}
        >
            {isMarked ? (
                <StarIcon size={16} className="text-red-500 mr-2" />
            ) : (
                <StarOffIcon size={16} className="text-gray-500 mr-2" />
            )}

            {(isMarked ? "Remove Favorite" : "Add to Favorite")}
            {/* {children || (isMarked ? "Remove Favorite" : "Add to Favorite")} */}
        </Button>
    )
}

export default MarkToggleStar