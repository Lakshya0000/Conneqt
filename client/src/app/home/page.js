"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { Network, HeartPulse, Shield, Lightbulb, ArrowRight, ChevronDown } from 'lucide-react';
import DNAAnimation from '../components/DnaAnimation';

export default function Home() {

  const router = useRouter();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white overflow-x-hidden relative">
      <DNAAnimation />
      
     {/* Navigation */}
     <motion.nav 
  initial={{ y: -100 }}
  animate={{ y: 0 }}
  transition={{ duration: 0.6 }}
  className="fixed top-0 left-0 w-full bg-black backdrop-blur-md z-50 shadow-lg"
>
  <div className="container mx-auto px-6 py-4">
    <div className="flex items-center justify-between">
      <motion.div 
        className="flex items-center space-x-2 group"
        whileHover={{ scale: 1.05 }}
      >
        <Link href="/">
          <div className="relative cursor-pointer flex items-center">
            <Network className="w-8 h-8 text-purple-500 transition-transform group-hover:rotate-180 duration-700" />
            <span 
              className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent"
            >
              Conneqt
            </span>
          </div>
        </Link>
      </motion.div>
      <div className="hidden md:flex space-x-8">
        <Link href="#how-it-works">
          <motion className="hover:text-purple-400 transition-colors" >
            How It Works
          </motion>
        </Link>
        <Link href="#projects">
          <motion className="hover:text-purple-400 transition-colors" >
            Projects
          </motion>
        </Link>
        <Link href="#collaboration">
          <motion className="hover:text-purple-400 transition-colors" >
            Collaboration
          </motion>
        </Link>
        <motion.button 
          className="px-6 py-2 bg-purple-600 rounded-full hover:bg-purple-700 transition-all transform hover:shadow-lg hover:shadow-purple-500/25 hover:cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/")}
        >
          Connect Wallet
        </motion.button>
      </div>
    </div>
  </div>
</motion.nav>

      {/* Content wrapper with higher z-index */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center relative px-6">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial="initial"
            animate="animate"
            variants={staggerChildren}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 relative"
              variants={fadeInUp}
            >
              <motion.span 
                className="inline-block bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text"
                animate={{ y: [-10, 0, -10] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                Decentralized Hope:
              </motion.span>
              <br />
              <motion.span 
                className="inline-block bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-transparent bg-clip-text"
                animate={{ y: [-10, 0, -10] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              >
                Funding Research, Saving Lives
              </motion.span>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-300 mb-8"
              variants={fadeInUp}
            >
              Revolutionizing medical research funding through blockchain technology and collective action
            </motion.p>
            <motion.div 
              className="flex flex-col md:flex-row gap-4 justify-center"
              variants={fadeInUp}
            >
              <motion.button 
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:shadow-lg hover:shadow-purple-500/25"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Funding <ArrowRight className="ml-2 w-5 h-5 inline-block" />
              </motion.button>
              <motion.button 
                className="px-8 py-4 bg-transparent border-2 border-purple-500 rounded-full text-lg font-semibold hover:bg-purple-500/10 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </motion.div>
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <ChevronDown className="w-8 h-8 text-purple-400" />
          </motion.div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 px-6">
          <div className="container mx-auto">
            <motion.h2 
              className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              How It Works
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                {
                  icon: <Shield className="w-12 h-12 text-purple-500" />,
                  title: "Secure Smart Contracts",
                  description: "Transparent and immutable funding allocation through blockchain technology"
                },
                {
                  icon: <HeartPulse className="w-12 h-12 text-purple-500" />,
                  title: "Direct Impact",
                  description: "Track your contribution's impact in real-time with verified research milestones"
                },
                {
                  icon: <Lightbulb className="w-12 h-12 text-purple-500" />,
                  title: "Community Governance",
                  description: "Participate in funding decisions and research direction through DAO voting"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="group bg-purple-900/20 p-8 rounded-2xl backdrop-blur-lg border border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/25"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div 
                    className="mb-4"
                    whileHover={{ rotate: 12, scale: 1.1 }}
                  >
                    {item.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Live Projects */}
        <section id="projects" className="py-20 px-6 bg-gradient-to-b from-transparent to-purple-900/20">
          <div className="container mx-auto">
            <motion.h2 
              className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Active Research Projects
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-2 gap-8"
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                {
                  title: "Novel ALS Treatment Research",
                  image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800",
                  progress: 76,
                  raised: "2.4M",
                  goal: "3.2M"
                },
                {
                  title: "Early Cancer Detection AI",
                  image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800",
                  progress: 45,
                  raised: "1.8M",
                  goal: "4.0M"
                }
              ].map((project, index) => (
                <motion.div
                  key={index}
                  className="group bg-purple-900/20 rounded-2xl overflow-hidden backdrop-blur-lg border border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/25"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="relative overflow-hidden">
                    <motion.img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-48 object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.7 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1f] to-transparent opacity-60"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold mb-4">{project.title}</h3>
                    <div className="w-full bg-purple-900/50 rounded-full h-4 mb-4 overflow-hidden">
                      <motion.div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${project.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        viewport={{ once: true }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Raised: ${project.raised}</span>
                      <span>Goal: ${project.goal}</span>
                    </div>
                    <motion.button 
                      className="mt-6 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Fund This Project
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}