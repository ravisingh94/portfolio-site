
"use client"

import { Github, Linkedin, Mail, Twitter } from "lucide-react"
import Link from "next/link"

export default function Footer() {
    return (
        <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-400">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-xl font-bold text-white">Ravi Ranjan Singh</h3>
                        <p className="text-sm">Personal Portfolio & Experiment Lab</p>
                    </div>

                    <div className="flex gap-4">
                        <Link href="#" className="hover:text-cyan-400 transition-colors">
                            <Linkedin className="h-5 w-5" />
                            <span className="sr-only">LinkedIn</span>
                        </Link>
                        <Link href="#" className="hover:text-cyan-400 transition-colors">
                            <Github className="h-5 w-5" />
                            <span className="sr-only">GitHub</span>
                        </Link>
                        <Link href="#" className="hover:text-cyan-400 transition-colors">
                            <Twitter className="h-5 w-5" />
                            <span className="sr-only">Twitter</span>
                        </Link>
                        <Link href="#" className="hover:text-cyan-400 transition-colors">
                            <Mail className="h-5 w-5" />
                            <span className="sr-only">Email</span>
                        </Link>
                    </div>
                </div>

                <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
                    <p className="mb-2">Disclaimer</p>
                    <p className="max-w-2xl mx-auto italic">
                        All tools showcased on this site are experimental prototypes created for learning, exploration, and demonstration purposes.
                        They are not production-ready tools.
                    </p>
                    <p className="mt-8">© {new Date().getFullYear()} Ravi Ranjan Singh. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
