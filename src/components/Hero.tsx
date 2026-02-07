
"use client"

import { motion } from "framer-motion"
import { ArrowRight, Terminal } from "lucide-react"
import Link from "next/link"

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
            {/* Background Grid Effect */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-cyan-400 opacity-20 blur-[100px]"></div>

            <div className="container relative z-10 px-4 md:px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-3 py-1 text-sm text-cyan-400 mb-6 backdrop-blur-sm"
                >
                    <Terminal className="h-4 w-4" />
                    <span>Automating the Future of Infotainment</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
                >
                    Bridging <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 neon-text-blue">Manual Testing</span>
                    <br />
                    Automation, and AI
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-3xl mx-auto text-lg md:text-xl text-slate-400 mb-10 leading-relaxed"
                >
                    I design practical AI-assisted tools to help manual testers and QA engineers work faster, smarter, and with more confidence.
                    <br /><br />
                    <span className="text-slate-500 text-base">
                        This personal portfolio showcases experimental solutions that reduce repetitive test effort, improve test coverage understanding, and support better decision-making during software and infotainment testing.
                    </span>
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link
                        href="#tools"
                        className="inline-flex h-12 items-center justify-center rounded-md bg-cyan-500 px-8 text-sm font-medium text-black shadow transition-colors hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500 disabled:pointer-events-none disabled:opacity-50"
                    >
                        Explore Tools <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <Link
                        href="#experiments"
                        className="inline-flex h-12 items-center justify-center rounded-md border border-slate-800 bg-slate-950 px-8 text-sm font-medium text-slate-300 shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 disabled:pointer-events-none disabled:opacity-50"
                    >
                        View Experiments
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}
