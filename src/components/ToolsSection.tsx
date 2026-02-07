
"use client"

import { Bot, Bug, FileCode, Mic, Radio, Zap, Layout, Search, BarChart } from "lucide-react"
import ToolCard from "./ToolCard"

export const tools = [
    {
        title: "TestGenAI",
        description: "Generates functional and edge-case test scenarios from requirements, PRDs, or specifications to reduce manual test design effort.",
        icon: <Bot className="h-6 w-6" />,
        tags: ["GenAI", "Test Design", "Manual Assist"],
        state: "In Progress",
        demoLink: "/test-gen-ai"
    },
    {
        title: "TestAutomatorAI",
        description: "Assists in identifying automation-friendly test cases and mapping manual scenarios to automation workflows.",
        icon: <Zap className="h-6 w-6" />,
        tags: ["Automation Assist", "Workflow", "Productivity"],
        state: "Idea Stage",
        demoLink: "#"
    },
    {
        title: "TestExecutorAI",
        description: "Supports intelligent test execution by prioritizing scenarios based on risk and past failures.",
        icon: <Layout className="h-6 w-6" />,
        tags: ["Execution", "Risk Based", "Efficiency"],
        state: "Idea Stage",
        demoLink: "#"
    },
    {
        title: "InfoLog Insight",
        description: "Analyzes system and infotainment logs to highlight anomalies, patterns, and recurring issues.",
        icon: <Search className="h-6 w-6" />,
        tags: ["Log Analysis", "Diagnostics", "AI Ops"],
        state: "Idea Stage",
        demoLink: "#"
    },
    {
        title: "Coverage Heatmap",
        description: "Visualizes feature-level and requirement-level test coverage to identify blind spots.",
        icon: <BarChart className="h-6 w-6" />,
        tags: ["Coverage", "Visibility", "Metrics"],
        state: "Idea Stage",
        demoLink: "#"
    },
    {
        title: "Defect Predictor",
        description: "Uses historical test data to indicate areas with higher probability of defects.",
        icon: <Bug className="h-6 w-6" />,
        tags: ["Prediction", "Quality", "Data Analysis"],
        state: "Idea Stage",
        demoLink: "#"
    }
]

export default function ToolsSection() {
    return (
        <section id="tools" className="py-24 relative bg-slate-950/50">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>

            <div className="container px-4 md:px-6">
                <div className="mb-12 md:text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
                        Tools & <span className="text-cyan-400">Experiments</span>
                    </h2>
                    <p className="text-slate-400 text-lg">
                        These tools are experimental prototypes, built to explore how AI can support testing activities.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {tools.map((tool, index) => (
                        <ToolCard
                            key={index}
                            {...tool}
                            delay={index * 0.1}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
