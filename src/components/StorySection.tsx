
"use client"

import { motion } from "framer-motion"

export default function StorySection() {
    return (
        <section className="py-24 relative">
            <div className="container px-4 md:px-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 md:p-12 backdrop-blur-sm">
                    <div className="grid gap-12 lg:grid-cols-2 items-center">

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
                                About Me
                            </h2>
                            <div className="space-y-4 text-slate-400 text-lg leading-relaxed">
                                <p>
                                    I’m <span className="text-cyan-400 font-semibold">Ravi Ranjan Singh</span>, an Automotive Test Engineer with hands-on experience in manual testing, infotainment systems, and test automation challenges.
                                </p>
                                <p>
                                    This website is my personal portfolio, where I explore how AI can practically support testers — especially those transitioning from manual testing to automation.
                                </p>
                                <p>
                                    All tools here are built from <span className="text-purple-400 font-semibold">real testing pain points</span> and are continuously evolving through experimentation and learning.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative h-64 md:h-full min-h-[300px] rounded-xl overflow-hidden border border-slate-700 bg-slate-950"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10"></div>

                            {/* Fake Terminal UI */}
                            <div className="absolute inset-4 rounded-lg bg-black/80 border border-slate-800 p-4 font-mono text-sm overflow-hidden">
                                <div className="flex gap-2 mb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="space-y-2 text-slate-300">
                                    <p><span className="text-pink-500">user@testlab:~$</span> ./init_automation.sh</p>
                                    <p className="text-slate-500">Loading modules...</p>
                                    <p>✔ CAN Interface Connected</p>
                                    <p>✔ AI Model Loaded (v2.4)</p>
                                    <p className="text-green-400">SUCCESS: Test environment ready.</p>
                                    <p className="animate-pulse">_</p>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
        </section>
    )
}
