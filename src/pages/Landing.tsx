import React from 'react';import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Users, 
  Github, 
  Moon, 
  Sun,
  Layout,
  Database,
  Layers,
  Cpu,
  Lock,
  MessageSquare,
  LucideIcon,
  CheckCircle2,
  Sparkles,
  Command,
  FileText,
  Share2,
  Globe,
  Code,
  Search,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDarkMode } from '../hooks/useDarkMode';
import { Logo, LogoIcon } from '../components/Logo';

// The Landing page is the first thing users see. 
// It features a hero section with a call to action, feature highlights, and a footer.
const BentoCard = ({ 
  icon: Icon, 
  title, 
  description, 
  className = "", 
  delay = 0,
  children 
}: { 
  icon: LucideIcon, 
  title: string, 
  description: string, 
  className?: string, 
  delay?: number,
  children?: React.ReactNode 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className={`group relative overflow-hidden p-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/50 transition-all duration-500 ${className}`}
  >
    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500">
      <Icon className="w-24 h-24" />
    </div>
    <div className="relative z-10">
      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-500">
        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
        {description}
      </p>
      {children}
    </div>
  </motion.div>
);

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
    <CheckCircle2 className="w-4 h-4 text-blue-500" />
    <span className="text-sm font-medium">{text}</span>
  </div>
);

export const Landing: React.FC = () => {
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header: Contains Logo, Dark Mode toggle, GitHub link, and Login button */}
      <header className="container mx-auto px-6 py-6 flex items-center justify-between backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 sticky top-0 z-50 border-b border-gray-200/50 dark:border-slate-800/50">
        <Logo size={44} />
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all hover:scale-105"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <a
            href="https://github.com/fyiclub-vitb/WorkLin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all hover:scale-105"
          >
            <Github size={18} />
            <span className="hidden sm:inline font-medium">GitHub</span>
          </a>
          <Link
            to="/login"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section: The main headline and primary call-to-action */}
      <section className="container mx-auto px-6 py-24 md:py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
            <Zap size={16} className="text-blue-600 dark:text-blue-400" />
            Open Source • Free Forever
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Your workspace,
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              reimagined
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            WorkLin is an open-source Notion alternative. Create pages, organize your thoughts,
            and collaborate with your team—all in one beautiful workspace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/login"
              className="hidden sm:block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20"
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section: Highlights key capabilities like 'Lightning Fast' and 'Privacy First' */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need to stay organized
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Powerful features, beautiful design, open source
          </p>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 md:pt-56 md:pb-40 overflow-hidden bg-white dark:bg-slate-950">
          {/* Technical Canvas Background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Refined Large Grid */}
            <div 
              className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1]"
              style={{ 
                backgroundImage: `
                  linear-gradient(to right, #94a3b8 1px, transparent 1px),
                  linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
                `,
                backgroundSize: '80px 80px',
              }}
            />

            {/* Top Spotlight */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px]"
              style={{
                background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1), transparent 70%)'
              }}
            />

            {/* Corner Brackets */}
            <div className="absolute inset-x-6 inset-y-12 md:inset-x-20 md:inset-y-24 border-slate-200/50 dark:border-slate-800/50 pointer-events-none">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-slate-200 dark:border-slate-800" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-slate-200 dark:border-slate-800" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-slate-200 dark:border-slate-800" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-slate-200 dark:border-slate-800" />
              
              {/* Metadata Labels */}
              <div className="absolute top-2 left-2 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest">System Ready</span>
              </div>
              <div className="absolute top-2 right-2">
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest">v1.0.4-stable</span>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest">Build: 2024.01</span>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-6 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-bold mb-8"
            >
              <Sparkles className="w-4 h-4" />
              Open Source • Free Forever
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-[0.9]"
            >
              Your thoughts, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">fully organized.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium"
            >
              The unified, open-source workspace that combines notes, tasks, and data. 
              Built for speed, privacy, and seamless collaboration.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-5 justify-center items-center"
            >
              <Link
                to="/login"
                className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/25 hover:-translate-y-1"
              >
                Start Building
                <ArrowRight className="w-6 h-6" />
              </Link>
              <a
                href="https://github.com/fyiclub-vitb/WorkLin"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:-translate-y-1"
              >
                <Github className="w-6 h-6" />
                Open Source
              </a>
            </motion.div>
          </div>
        </section>

        {/* Why WorkLin? Section */}
        <section className="py-24 border-y border-white/10 dark:border-slate-800/50 bg-slate-50/10 dark:bg-slate-900/10 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="p-8 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-slate-800/50 hover:border-blue-500/30 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Blazing Fast</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Built with performance in mind. No loading spinners, no lag. Just instant access to your thoughts and data.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-slate-800/50 hover:border-indigo-500/30 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Privacy Focused</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Your data belongs to you. We use end-to-end encryption and provide tools for you to export or self-host your workspace.
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-slate-800/50 hover:border-purple-500/30 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Open Standards</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  No vendor lock-in. WorkLin uses open data formats, making it easy to integrate with other tools in your digital ecosystem.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                Powerful blocks for <span className="text-blue-600">limitless creativity.</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                Everything you need to capture information, manage projects, and run your entire life or business.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              <BentoCard
                icon={Layout}
                title="Block-Based Editor"
                description="The core of WorkLin. Use headings, lists, code blocks, tables, and media embeds to structure your content exactly how you want it."
                delay={0.1}
              >
                <div className="mt-6 flex flex-wrap gap-2">
                  <FeatureItem text="Rich Text" />
                  <FeatureItem text="Code Highlighting" />
                  <FeatureItem text="Tables" />
                </div>
              </BentoCard>

              <BentoCard
                icon={Database}
                title="Advanced Databases"
                description="Go beyond simple notes. Create powerful databases with table, board, and calendar views. Filter, sort, and group your data effortlessly."
                delay={0.2}
              >
                <div className="mt-6 flex flex-wrap gap-2">
                  <FeatureItem text="Kanban Boards" />
                  <FeatureItem text="Custom Properties" />
                  <FeatureItem text="Relations" />
                </div>
              </BentoCard>

              <BentoCard
                icon={Cpu}
                title="AI Writing Assistant"
                description="Enhance your workflow with integrated AI. Summarize long documents, brainstorm new ideas, or improve your writing style in seconds."
                delay={0.3}
              >
                <div className="mt-6 flex flex-wrap gap-2">
                  <FeatureItem text="Context-Aware" />
                  <FeatureItem text="Smart Summaries" />
                  <FeatureItem text="Idea Generation" />
                </div>
              </BentoCard>

              <BentoCard
                icon={Shield}
                title="Privacy First"
                description="Your data is encrypted and secure. WorkLin is open-source, ensuring complete transparency and giving you total ownership of your information."
                delay={0.4}
              >
                <div className="mt-6 flex flex-wrap gap-2">
                  <FeatureItem text="MIT Licensed" />
                  <FeatureItem text="Self-Hostable" />
                  <FeatureItem text="Secure Auth" />
                </div>
              </BentoCard>

              <BentoCard
                icon={Users}
                title="Real-time Collaboration"
                description="Work together with your team as if you were in the same room. See cursors in real-time and edit documents simultaneously with no conflicts."
                delay={0.5}
              >
                <div className="mt-6 flex flex-wrap gap-2">
                  <FeatureItem text="Live Cursors" />
                  <FeatureItem text="Shared Workspaces" />
                  <FeatureItem text="Syncing" />
                </div>
              </BentoCard>

              <BentoCard
                icon={Command}
                title="Command Palette"
                description="Stay in the flow with keyboard-first navigation. Access any page, create blocks, or run commands instantly without touching your mouse."
                delay={0.6}
              >
                <div className="mt-6 flex flex-wrap gap-2">
                  <FeatureItem text="Quick Search" />
                  <FeatureItem text="Action Commands" />
                  <FeatureItem text="Hotkeys" />
                </div>
              </BentoCard>

  
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="py-32 overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-20">
              <div className="flex-1">
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-tight">
                  Organize your life, <br />
                  <span className="text-blue-600">one block at a time.</span>
                </h2>
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/20">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Capture Knowledge</h4>
                      <p className="text-slate-600 dark:text-slate-400">Quickly jot down ideas, meeting notes, or research. Everything is instantly searchable.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/20">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Structure Data</h4>
                      <p className="text-slate-600 dark:text-slate-400">Transform messy notes into organized databases, tasks, and project boards.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-600/20">
                      <Share2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Share & Collaborate</h4>
                      <p className="text-slate-600 dark:text-slate-400">Invite team members or publish pages to the web with a single click.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 relative group">
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl p-6 md:p-8 transition-all duration-500 group-hover:shadow-blue-500/10 group-hover:border-blue-500/30">
                  {/* Mock UI Header */}
                  <div className="flex items-center justify-between mb-8 border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 dark:bg-red-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 dark:bg-yellow-500/40" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 dark:bg-green-500/40" />
                      </div>
                      <div className="h-4 w-px bg-slate-200 dark:border-slate-800 mx-2" />
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Globe className="w-3 h-3" />
                        <span>Workspaces / Product</span>
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800" />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Page Title Area */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">Active Project</div>
                        <div className="text-[10px] text-slate-400 font-medium">Updated 2m ago</div>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Q1 Product Roadmap</h3>
                    </div>

                    {/* Task List */}
                    <div className="space-y-3">
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="h-14 w-full bg-blue-500/5 dark:bg-blue-500/10 rounded-2xl flex items-center justify-between px-5 gap-3 border border-blue-500/20 group/task cursor-pointer hover:bg-blue-500/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Finalize UI Kit tokens</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-white/50 dark:bg-slate-800/50 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/10 uppercase tracking-wider">High</div>
                      </motion.div>

                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="h-14 w-full bg-white/40 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between px-5 gap-3 border border-slate-200/50 dark:border-slate-700/50 group/task cursor-pointer hover:border-blue-500/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-6 h-6 rounded-lg border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center transition-colors group-hover/task:border-blue-500" />
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Implement auth flow</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medium</div>
                      </motion.div>
                    </div>

                    {/* Grid/Gallery Blocks */}
                    <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/50 grid grid-cols-2 gap-4">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-slate-800 dark:to-slate-900/50 p-4 border border-white/20 dark:border-slate-700/50 relative overflow-hidden group/block"
                      >
                        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover/block:opacity-100 transition-opacity" />
                        <div className="relative z-10 h-full flex flex-col justify-between">
                          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="space-y-1.5">
                            <div className="h-1.5 w-2/3 bg-slate-400/30 rounded-full" />
                            <div className="h-1.5 w-1/2 bg-slate-400/20 rounded-full" />
                          </div>
                        </div>
                      </motion.div>

                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 p-4 border border-white/20 dark:border-slate-700/50 relative overflow-hidden group/block"
                      >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/block:opacity-100 transition-opacity" />
                        <div className="relative z-10 h-full flex flex-col justify-between">
                          <div className="w-8 h-8 rounded-lg bg-white/80 dark:bg-slate-800/80 shadow-sm flex items-center justify-center">
                            <Layers className="w-4 h-4 text-indigo-500" />
                          </div>
                          <div className="space-y-1.5">
                            <div className="h-1.5 w-3/4 bg-indigo-400/30 rounded-full" />
                            <div className="h-1.5 w-1/3 bg-indigo-400/20 rounded-full" />
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/10 blur-[100px] -z-10 animate-pulse" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/10 blur-[60px] -z-10" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/10 blur-[60px] -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Insights Section */}
        <section className="py-32 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row-reverse items-center gap-20">
              <div className="flex-1">
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-tight">
                  Insights at your <br />
                  <span className="text-indigo-600">fingertips.</span>
                </h2>
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/20">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Advanced Search</h4>
                      <p className="text-slate-600 dark:text-slate-400">Never lose a thought again. Search through your entire workspace with powerful filters, tags, and fuzzy matching that understands context.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/20">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Built-in Analytics</h4>
                      <p className="text-slate-600 dark:text-slate-400">Visualize your progress and workspace health. From project completion rates to habit tracking, our analytics keep you on top of your goals.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 md:p-8">
                  <div className="space-y-6">
                    {/* Mock Search Bar */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="w-full bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-400 font-medium backdrop-blur-sm shadow-inner">
                        Search your second brain...
                      </div>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-1.5">
                        <div className="px-1.5 py-0.5 rounded border border-white/20 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 backdrop-blur-sm">⌘</div>
                        <div className="px-1.5 py-0.5 rounded border border-white/20 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 backdrop-blur-sm">K</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2 p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/50 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Productivity Score</span>
                          </div>
                          <div className="text-[10px] font-bold text-blue-600 bg-blue-500/10 dark:bg-blue-900/40 px-2.5 py-1 rounded-full uppercase border border-blue-500/20">Weekly View</div>
                        </div>
                        <div className="relative h-32 w-full">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Area Fill */}
                        <motion.path
                          initial={{ d: "M 0 100 Q 50 100 100 100 T 200 100 T 300 100 T 400 100 V 100 H 0 Z" }}
                          whileInView={{ d: "M 0 80 Q 50 20 100 60 T 200 30 T 300 70 T 400 40 V 100 H 0 Z" }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          fill="url(#chartGradient)"
                        />
                        {/* Line */}
                        <motion.path
                          initial={{ pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          transition={{ duration: 2, ease: "easeOut" }}
                          d="M 0 80 Q 50 20 100 60 T 200 30 T 300 70 T 400 40"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        {/* Data Points */}
                        {[
                          { x: 0, y: 80 }, { x: 100, y: 60 }, { x: 200, y: 30 }, { x: 300, y: 70 }, { x: 400, y: 40 }
                        ].map((point, i) => (
                          <motion.circle
                            key={i}
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            transition={{ delay: 1 + i * 0.1 }}
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            fill="white"
                            stroke="#3b82f6"
                            strokeWidth="2"
                          />
                        ))}
                      </svg>
                    </div>
                      </div>
                      
                      <div className="p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                          <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Storage</span>
                        </div>
                        <div className="relative w-16 h-16 mx-auto mb-4">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200/50 dark:text-slate-700/50" />
                            <motion.circle 
                              cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="8" fill="transparent" 
                              strokeDasharray="175.9"
                              initial={{ strokeDashoffset: 175.9 }}
                              whileInView={{ strokeDashoffset: 175.9 * (1 - 0.65) }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="text-indigo-600" 
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white">65%</div>
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/20 dark:border-slate-700/50 backdrop-blur-sm text-center flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2 mb-4 w-full">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Growth</span>
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">+24%</div>
                        <div className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <ArrowRight className="w-3 h-3 -rotate-45" />
                          Trending
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-600/10 blur-[100px] -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="py-24 bg-white dark:bg-slate-950">
          <div className="container mx-auto px-6 text-center">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-12">
              Built with modern technology
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Real-time collaboration coming soon. Share workspaces and work together seamlessly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Open Source Section: Emphasizes the open-source nature of the project */}
      <section className="container mx-auto px-6 py-20">
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center text-white overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative z-10"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Code size={40} className="text-white" />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-32 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                Frequently Asked <span className="text-blue-600">Questions</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                Everything you need to know about the platform.
              </p>
            </div>

            <div className="max-w-4xl mx-auto grid gap-6">
              {[
                {
                  q: "Is WorkLin free?",
                  a: "Yes! WorkLin is open-source under the MIT license. You can use the hosted version for free or self-host it on your own infrastructure."
                },
                {
                  q: "How secure is my data?",
                  a: "Security is our top priority. All data is encrypted at rest and in transit. Since it's open-source, the community can audit our security practices at any time."
                },
                {
                  q: "Can I export my data?",
                  a: "Absolutely. We believe in data portability. You can export your entire workspace as Markdown or JSON at any time. No vendor lock-in, ever."
                },
                {
                  q: "Does it support real-time collaboration?",
                  a: "Yes, WorkLin supports real-time editing with live cursors, making it perfect for teams and collaborative projects."
                }
              ].map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-slate-800/50 rounded-3xl hover:border-blue-500/30 transition-all duration-300"
                >
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{faq.q}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-40 relative">
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 md:p-24 text-white shadow-2xl shadow-blue-600/30 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <LogoIcon size={300} className="rotate-12" />
              </div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter leading-[0.9]">
                  Start your digital <br />second brain.
                </h2>
                <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto font-medium opacity-90">
                  Join the open-source movement. Fast, secure, and completely free to start.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    to="/login"
                    className="px-12 py-5 bg-white text-blue-600 rounded-2xl font-bold text-xl hover:bg-blue-50 transition-all shadow-xl shadow-black/10 hover:-translate-y-1"
                  >
                    Get Started Free
                  </Link>
                  <a
                    href="https://github.com/fyiclub-vitb/WorkLin"
                    className="px-12 py-5 bg-blue-800/50 text-white rounded-2xl font-bold text-xl hover:bg-blue-800/70 transition-all border border-white/20 hover:-translate-y-1"
                  >
                    View Source
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-24 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <Logo size={32} className="mb-6" />
              <p className="text-slate-500 dark:text-slate-400 max-w-sm text-lg leading-relaxed">
                The open-source workspace built for the next generation of knowledge workers. 
                Simple, powerful, and privacy-first.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-slate-900 dark:text-white uppercase tracking-wider text-xs">Resources</h5>
              <ul className="space-y-4 text-sm">
                <li><a href="https://github.com/fyiclub-vitb/WorkLin/blob/main/README.md" className="text-slate-500 hover:text-blue-600 transition-colors">Documentation</a></li>
                <li><a href="https://github.com/fyiclub-vitb/WorkLin/blob/main/CONTRIBUTING.md" className="text-slate-500 hover:text-blue-600 transition-colors">Contributing</a></li>
                <li><a href="https://github.com/fyiclub-vitb/WorkLin/blob/main/LICENSE" className="text-slate-500 hover:text-blue-600 transition-colors">License</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-slate-900 dark:text-white uppercase tracking-wider text-xs">Community</h5>
              <ul className="space-y-4 text-sm">
                <li><a href="https://github.com/fyiclub-vitb/WorkLin" className="text-slate-500 hover:text-blue-600 transition-colors">GitHub</a></li>
                <li><a href="https://github.com/fyiclub-vitb/WorkLin/issues" className="text-slate-500 hover:text-blue-600 transition-colors">Issues</a></li>
                <li><a href="https://github.com/fyiclub-vitb/WorkLin/discussions" className="text-slate-500 hover:text-blue-600 transition-colors">Discussions</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-slate-100 dark:border-slate-900">
            <div className="flex items-center gap-6">
              <a 
                href="https://github.com/fyiclub-vitb/WorkLin" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <Github className="w-6 h-6" />
              </a>
            </div>

            <p className="text-slate-500 dark:text-slate-500 text-sm font-medium">
              © {new Date().getFullYear()} WorkLin, FYI Club, VIT Bhopal, MIT Licensed.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

