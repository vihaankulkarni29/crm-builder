"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundCircles = ({
    title = "RFRNCS OS",
    description = "Operational Intelligence",
    className,
}: {
    title?: string;
    description?: string;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "relative flex h-full w-full items-center justify-center overflow-hidden bg-background",
                className
            )}
        >
            <div className="z-10 flex flex-col items-center justify-center gap-2 px-4 text-center">
                <h1 className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-primary to-primary/50 bg-clip-text text-5xl font-bold leading-tight text-transparent dark:from-white dark:to-white/40 sm:text-7xl">
                    {title}
                </h1>
                <p className="pointer-events-none text-lg text-muted-foreground">
                    {description}
                </p>
            </div>

            {/* Animated Circles */}
            <motion.div
                animate={{
                    rotate: 360,
                }}
                transition={{
                    duration: 50,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute -top-[50%] left-[50%] h-[1000px] w-[1000px] -translate-x-[50%] rounded-full border border-neutral-200 dark:border-neutral-800 opacity-20"
            />
            <motion.div
                animate={{
                    rotate: -360,
                }}
                transition={{
                    duration: 70,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute -top-[60%] left-[50%] h-[1200px] w-[1200px] -translate-x-[50%] rounded-full border border-neutral-200 dark:border-neutral-800 opacity-20"
            />
            <motion.div
                animate={{
                    rotate: 360,
                }}
                transition={{
                    duration: 90,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute -top-[70%] left-[50%] h-[1400px] w-[1400px] -translate-x-[50%] rounded-full border border-neutral-200 dark:border-neutral-800 opacity-20"
            />
        </div>
    );
};
