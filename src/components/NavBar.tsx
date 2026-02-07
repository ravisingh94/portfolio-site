
"use client"

import { useState, useEffect } from "react"
import { motion, useScroll } from "framer-motion"
import Link from "next/link"
import { Terminal, LogIn, LogOut, User as UserIcon, Coins } from "lucide-react"
import { useAuth } from "@/components/auth/AuthContext"
import { useCredits } from "@/components/auth/CreditContext"

export default function NavBar() {
    const { scrollY } = useScroll()
    const [isScrolled, setIsScrolled] = useState(false)
    const auth = useAuth()
    const { tokensUsed, maxTokens } = useCredits()
    const creditsUsed = Math.min(100, Math.round((tokensUsed / maxTokens) * 100))

    useEffect(() => {
        return scrollY.on('change', (latest) => {
            setIsScrolled(latest > 50)
        })
    }, [scrollY])

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-slate-950/80 backdrop-blur-md border-b border-slate-800 py-3" : "bg-transparent py-6"
                }`}
        >
            <div className="w-full px-4 md:px-10 flex items-center h-full relative">
                <div className="flex-shrink-0">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
                        <Terminal className="h-6 w-6 text-cyan-400" />
                        <span>Auto<span className="text-cyan-400">Test</span>AI</span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                    <Link href="#tools" className="hover:text-cyan-400 transition-colors">Tools</Link>
                    <Link href="#experiments" className="hover:text-cyan-400 transition-colors">Lab</Link>
                    <Link href="#" className="hover:text-cyan-400 transition-colors">About</Link>
                </nav>

                <div className="ml-auto flex items-center justify-end">

                    {auth.isAuthenticated ? (
                        <div className="flex items-center gap-6">
                            <div className="hidden sm:flex flex-col items-end gap-1 relative group cursor-help">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                    <Coins className="h-3 w-3 text-amber-400" />
                                    <span>Daily Credits: {100 - creditsUsed}/100</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${100 - creditsUsed}%` }}
                                        className={`h-full ${100 - creditsUsed < 20 ? 'bg-red-500' : 100 - creditsUsed < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    />
                                </div>

                                {/* Tooltip */}
                                <div className="absolute top-full mt-2 right-0 w-48 p-3 bg-slate-900/90 border border-slate-700 rounded-lg shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                    <p className="text-[10px] text-slate-300 leading-relaxed text-center">
                                        These daily credits will be utilised for using AI Tools.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <UserIcon className="h-4 w-4" />
                            </div>
                            <button
                                onClick={() => auth.signOut()}
                                className="flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20 transition-colors border border-cyan-500/20"
                        >
                            <LogIn className="h-4 w-4" />
                            <span>Login</span>
                        </Link>
                    )}
                </div>
            </div>
        </motion.header>
    )
}
