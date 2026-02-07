"use client"

import { motion } from "framer-motion"
import { AlertTriangle, Clock, FileWarning, Search, Repeat } from "lucide-react"

const problems = [
    {
        title: "Manual Test Overload",
        description: "Heavy reliance on manual test case creation slows down sprint velocity.",
        icon: <FileWarning className="h-6 w-6 text-orange-400" />
    },
    {
        title: "Automation Gaps",
        description: "Difficulty transitioning manual scenarios to reliable automation scripts.",
        icon: <Repeat className="h-6 w-6 text-red-400" />
    },
    {
        title: "Log Paralysis",
        description: "Thousands of lines of logs make root cause analysis time-consuming.",
        icon: <Search className="h-6 w-6 text-yellow-400" />
    },
    {
        title: "Coverage Blindspots",
        description: "Poor visibility into what is actually tested versus what is not.",
        icon: <AlertTriangle className="h-6 w-6 text-amber-400" />
    }
]

export default function ProblemsSection() {
    return (
        <section className="py-24 relative bg-slate-950">
            <div className="container px-4 md:px-6">
                <div className="mb-16 md:text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
                        Problems in Today’s <span className="text-red-400">Testing Workflow</span>
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        During real-world infotainment testing, teams often face repetitive execution, visibility gaps, and the constant struggle to balance quality with speed.
                    </p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {problems.map((problem, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/30 transition-colors"
                        >
                            <div className="mb-4 bg-white/5 w-12 h-12 rounded-lg flex items-center justify-center border border-white/10">
                                {problem.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">{problem.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {problem.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
