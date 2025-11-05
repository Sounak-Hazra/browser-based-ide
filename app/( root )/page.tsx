import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";




export default function Home() {

    return (
        <div className=" z-20 flex flex-col items-center justify-start min-h-screen py-2">

            <div className="flex flex-col justify-center items-center">
                <Image src={"/homepage-image.png"} alt="Hero-Section" height={400} width={400} />

                <h1 className="z-20 text-6xl font-extrabold text-center bg-clip-text text-transparent [background-image:var(--vc-gradient-primary)] bg-cover bg-center tracking-tight leading-[1.3]">
                    Vibe Code With Intelligence
                </h1>

            </div>


            <p className="mt-2 text-lg text-center text-gray-600 dark:text-gray-400 px-5 py-10 max-w-2xl">
                VibeCode Editor is a powerful and intelligent code editor that enhances
                your coding experience with advanced features and seamless integration.
                It is designed to help you write, debug, and optimize your code
                efficiently.
            </p>
            <Link href={"/dashboard"}>
                <Button variant={"outline"} className="mb-4" size={"lg"}>
                    Get Started
                    <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
            </Link>
        </div>
    );
}
