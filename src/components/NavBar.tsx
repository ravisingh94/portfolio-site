
"use client"

import { useState, useEffect } from "react"
import { motion, useScroll } from "framer-motion"
import Link from "next/link"
import { Terminal } from "lucide-react"

export default function NavBar() {
    const { scrollY } = useScroll()
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        return scrollY.onChange((latest) => {
            setIsScrolled(latest > 50)
        })
    }, [scrollY])

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-slate-950/80 backdrop-blur-md border-b border-slate-800 py-3" : "bg-transparent py-6"
                }`}
        >
            <div className="container px-4 md:px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
                    <Terminal className="h-6 w-6 text-cyan-400" />
                    <span>Auto<span className="text-cyan-400">Test</span>AI</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
                    <Link href="#tools" className="hover:text-cyan-400 transition-colors">Tools</Link>
                    <Link href="#experiments" className="hover:text-cyan-400 transition-colors">Lab</Link>
                    <Link href="#" className="hover:text-cyan-400 transition-colors">About</Link>
                </nav>

                <Link href="#" className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20 transition-colors border border-cyan-500/20">
                    Contact
                </Link>
            </div>
        </motion.header>
    )
}
