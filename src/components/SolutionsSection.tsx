"use client"

import { motion } from "framer-motion"
import { Sparkles, Brain, Zap, Target } from "lucide-react"

export default function SolutionsSection() {
    return (
        <section className="py-24 relative bg-slate-900/50">
            <div className="container px-4 md:px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
                            How AI Helps <span className="text-cyan-400">Manual Testers</span>
                        </h2>
                        <div className="space-y-6 text-slate-400 text-lg">
                            <p>
                                The goal is not to replace manual testing, but to <span className="text-white font-medium">augment it</span>.
                            </p>
                            <p>
                                By handling repetitive analysis and scenario generation, AI allows testers to focus on what humans do best: critical thinking, validation, and exploring edge cases.
                            </p>

                            <ul className="space-y-4 mt-8">
                                {[
                                    { text: "Suggest test scenarios from requirements", icon: <Brain className="w-5 h-5 text-purple-400" /> },
                                    { text: "Highlight risky areas based on past defects", icon: <AlertTriangle className="w-5 h-5 text-orange-400" /> },
                                    { text: "Summarize logs instead of reading thousands of lines", icon: <Zap className="w-5 h-5 text-yellow-400" /> },
                                    { text: "Visualize what is tested vs what is not", icon: <Target className="w-5 h-5 text-cyan-400" /> }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                            {item.icon}
                                        </div>
                                        <span>{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full"></div>
                        <div className="relative rounded-2xl border border-white/10 bg-slate-950 p-8 backdrop-blur-xl">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                    <span className="text-sm font-medium text-slate-400">Manual Effort</span>
                                    <span className="text-sm font-medium text-red-400">High</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: "90%" }}
                                            whileInView={{ width: "30%" }}
                                            transition={{ duration: 1.5, delay: 0.5 }}
                                            className="h-full bg-red-500"
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Traditional Workflow</span>
                                        <span className="text-cyan-400">AI-Assisted Workflow</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mt-4">
                                    <div className="flex items-start gap-4">
                                        <Sparkles className="w-6 h-6 text-cyan-400 mt-1" />
                                        <div>
                                            <h4 className="text-white font-medium mb-1">Result</h4>
                                            <p className="text-sm text-cyan-100/70">
                                                Testers spend 70% less time on setup and 100% more time on high-value validation.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

import { AlertTriangle } from "lucide-react"
