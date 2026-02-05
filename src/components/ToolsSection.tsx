
"use client"

import { Bot, Bug, FileCode, Mic, Radio } from "lucide-react"
import ToolCard from "./ToolCard"

export const tools = [
    {
        title: "TestGenAI",
        description: "Generate comprehensive infotainment test cases from raw requirements, user stories using advanced LLMs. Covers functional, negative, and edge cases.",
        icon: <Bot className="h-6 w-6" />,
        tags: ["GenAI", "Test Automation", "LLM"],
        state: "In Progress",
        demoLink: "/test-gen-ai"
    },
    // {
    //     title: "TestAutomatorAI",
    //     description: "From test cases to test scripts in seconds. TestAutomatorAI uses AI to auto-generate reliable automation code for infotainment platforms.",
    //     icon: <Bot className="h-6 w-6" />,
    //     tags: ["GenAI", "Automation", "Smart Testing"],
    //     state: "Idea Stage",
    //     demoLink: "#"
    // },
    // {
    //     title: "TestExecutorAI",
    //     description: "Intelligently executes automated infotainment test suites and adapts execution flow in real time using AI. Detects flaky tests, retries smartly, and provides actionable execution insights.",
    //     icon: <Bot className="h-6 w-6" />,
    //     tags: ["AI Execution", "Test Orchestration", "Infotainment QA"],
    //     state: "Built",
    //     demoLink: "#"
    // },
    // {
    //     title: "InfoLog Insight",
    //     description: "Automated root cause analysis for infotainment system logs (CAN, DLT). Translates cryptic error codes into plain English summaries.",
    //     icon: <FileCode className="h-6 w-6" />,
    //     tags: ["Log Analysis", "Deep Learning", "Diagnostics"],
    //     state: "Idea Stage",
    //     demoLink: "#"
    // },
    // {
    //     title: "Coverage Heatmap",
    //     description: "Visualizing test coverage across infotainment modules. Identify under-tested areas (Bluetooth, Navigation, Media) instantly.",
    //     icon: <Radio className="h-6 w-6" />,
    //     tags: ["Data Viz", "QA Metrics", "React"],
    //     state: "Idea Stage",
    //     demoLink: "#"
    // },
    // {
    //     title: "Defect Predictor",
    //     description: "Predict high-risk modules based on historical bug data and code churn. Proactive quality assurance before the build drops.",
    //     icon: <Bug className="h-6 w-6" />,
    //     tags: ["Predictive AI", "Risk Analysis", "ML"],
    //     state: "Idea Stage",
    //     demoLink: "#"
    // }
]

export default function ToolsSection() {
    return (
        <section id="tools" className="py-24 relative bg-slate-950/50">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>

            <div className="container px-4 md:px-6">
                <div className="mb-12 md:text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
                        Where Implementation Meets <span className="text-cyan-400">Innovation</span>
                    </h2>
                    <p className="text-slate-400 text-lg">
                        A suite of experimental tools designed to solve real-world infotainment testing headaches.
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
