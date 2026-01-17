import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Users, Code, Github, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDarkMode } from '../hooks/useDarkMode';
import { Logo, LogoIcon } from '../components/Logo';

export const Landing: React.FC = () => {
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
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

      {/* Hero Section */}
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
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all font-semibold text-lg flex items-center gap-2 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
            >
              Start Creating
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://github.com/fyiclub-vitb/WorkLin"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-900 dark:text-white rounded-xl transition-all font-semibold text-lg flex items-center gap-2 hover:scale-105 shadow-lg"
            >
              <Github size={20} />
              View on GitHub
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need to stay organized
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Powerful features, beautiful design, open source
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <Zap size={28} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Lightning Fast
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Built with React and Vite for instant page loads and smooth interactions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-800 hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
              <Shield size={28} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Privacy First
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Your data stays yours. Open source means you control your information.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="group p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-slate-700 hover:border-green-200 dark:hover:border-green-800 hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
              <Users size={28} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Collaborate
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Real-time collaboration coming soon. Share workspaces and work together seamlessly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Open Source Section */}
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
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Open Source & Free</h2>
            <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              WorkLin is open source and free forever. Join our community of contributors
              and help shape the future of workspace tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/fyiclub-vitb/WorkLin"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-xl hover:scale-105"
              >
                <Github size={20} />
                Contribute on GitHub
              </a>
              <Link
                to="/login"
                className="px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 hover:scale-105"
              >
                Get Started
                <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Logo size={32} />
          <div className="flex gap-6 text-gray-600 dark:text-gray-400">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              Issues
            </a>
            <a
              href="https://github.com/fyiclub-vitb/WorkLin"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <Github size={16} />
              GitHub
            </a>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-500 dark:text-gray-500 text-sm">
          <p>© 2024 WorkLin. Open source under MIT License.</p>
        </div>
      </footer>
    </div>
  );
};
