import { TEMPLATES } from "@/lib/constants"
import { templateKeys } from "@/lib/template"

export interface User {
    _id: string
    name: string
    email: string
    image: string
    role: string
    createdAt: Date
    updatedAt: Date
}

export interface Favourit{
    isMarked: boolean,
    userId: string,
    playgroundId: string,
    createdAt: Date,
    updatedAt: Date,
    _id: string
}


// export interface Project {
//     id: string
//     title: string
//     description: string
//     template: string
//     createdAt: Date
//     updatedAt: Date
//     userId: User
//     // user: User
//     Starmark: { isMarked: boolean }[]
// }


export interface PlaygroundCreate{
    title: string,
    description: string,
    template: (typeof templateKeys)[keyof typeof templateKeys]
}

export interface PlaygroundFetch{
    _id: string,
    title: string,
    description: string,
    template: (typeof TEMPLATES)[number],
    userId: User,
    createdAt: Date,
    updatedAt: Date,
    starred?: boolean,
    icon?: string,
    favourit?: Favourit
}