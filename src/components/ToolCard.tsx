
"use client"

import { motion } from "framer-motion"
import { ArrowRight, Bot, CheckCircle2, CircleDashed, Cpu, FileText, Lightbulb, Mic, Play } from "lucide-react"
import Link from "next/link"

interface ToolCardProps {
    title: string
    description: string
    icon: React.ReactNode
    demoLink?: string
    tags: string[]
    state?: string
    delay?: number
}

const getStatusConfig = (state: string) => {
    switch (state) {
        case "Built":
            return {
                icon: <CheckCircle2 className="h-3 w-3" />,
                color: "border-green-500/30 bg-green-950/30 text-green-300"
            }
        case "In Progress":
            return {
                icon: <CircleDashed className="h-3 w-3 animate-spin-slow" />,
                color: "border-cyan-500/30 bg-cyan-950/30 text-cyan-300"
            }
        case "Idea Stage":
        default:
            return {
                icon: <Lightbulb className="h-3 w-3" />,
                color: "border-purple-500/30 bg-purple-950/30 text-purple-300"
            }
    }
}

export default function ToolCard({ title, description, icon, demoLink = "#", tags, state = "Idea Stage", delay = 0 }: ToolCardProps) {
    const statusConfig = getStatusConfig(state)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-6 hover:border-cyan-500/50 hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.1)] transition-all duration-300"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

            <div className="relative z-10">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>

                <h3 className="mb-2 text-xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                    {title}
                </h3>

                <p className="mb-4 h-20 text-slate-400 text-sm leading-relaxed">
                    {description}
                </p>

                <div className="mt-6 flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300 border border-slate-700">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex justify-start">
                        <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs backdrop-blur-sm ${statusConfig.color}`}>
                            {statusConfig.icon}
                            <span>{state}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
