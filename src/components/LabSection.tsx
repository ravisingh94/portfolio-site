
"use client"

import { motion } from "framer-motion"
import { Beaker, CheckCircle2, CircleDashed, Lightbulb } from "lucide-react"
import { tools } from "./ToolsSection"

const getItemsByStatus = (status: string) => {
    return tools.filter(tool => tool.state === status).map(tool => tool.title)
}

export default function LabSection() {
    const roadmap = [
        {
            status: "Built",
            items: getItemsByStatus("Built"),
            icon: <CheckCircle2 className="h-5 w-5 text-green-400" />,
            color: "bg-green-400/10 border-green-400/20 text-green-400"
        },
        {
            status: "In Progress",
            items: getItemsByStatus("In Progress"),
            icon: <CircleDashed className="h-5 w-5 text-cyan-400 animate-spin-slow" />,
            color: "bg-cyan-400/10 border-cyan-400/20 text-cyan-400"
        },
        {
            status: "Idea Stage",
            items: getItemsByStatus("Idea Stage"),
            icon: <Lightbulb className="h-5 w-5 text-purple-400" />,
            color: "bg-purple-400/10 border-purple-400/20 text-purple-400"
        }
    ]

    const activeExperiment = tools.find(t => t.state === "In Progress")

    return (
        <section id="experiments" className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-950"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950"></div>

            <div className="container relative z-10 px-4 md:px-6">
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/30 px-4 py-1.5 text-sm text-purple-300 mb-6 backdrop-blur-sm">
                        <Beaker className="h-4 w-4" />
                        <span>The Experiment Lab</span>
                    </div>

                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
                        Inside the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 neon-text-purple">Innovation Pipeline</span>
                    </h2>
                    <p className="max-w-2xl text-slate-400 text-lg">
                        This isn't just a portfolio—it's a living lab where I test hypotheses on next-gen automotive quality assurance.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {roadmap.map((phase, index) => (
                        <motion.div
                            key={phase.status}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            className={`rounded-2xl border p-6 backdrop-blur-sm ${phase.color.replace("text", "border")} bg-slate-900/40`}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                {phase.icon}
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold text-slate-100">{phase.status}</h3>
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-slate-400">{phase.items.length}</span>
                                </div>
                            </div>

                            {phase.items.length > 0 ? (
                                <ul className="space-y-4">
                                    {phase.items.map((item) => (
                                        <li key={item} className="flex items-start gap-3 text-slate-300">
                                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-500" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm italic text-slate-500">No projects in this stage currently.</p>
                            )}
                        </motion.div>
                    ))}
                </div>

                {activeExperiment && (
                    <div className="mt-16 p-8 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm text-center">
                        <h3 className="text-2xl font-bold text-white mb-4">Current Experiment: {activeExperiment.title}</h3>
                        <p className="text-slate-400 mb-6">{activeExperiment.description}</p>
                        <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                            </span>
                            In Development
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
