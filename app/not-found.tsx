'use client';
import { motion } from "motion/react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-dvh bg-background">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="flex flex-col items-center justify-center"
            >
                <h1 className="text-[clamp(4.5rem,2.5634rem_+_8.26vw,10rem)] font-grotesk text-primary">
                    404
                </h1>
                <h2 className="text-[clamp(1.25rem,1.0563rem_+_0.8264vw,1.8rem)] font-bebas text-primary">
                    Сторінку не знайдено
                </h2>
            </motion.div>
        </div>
    );
}