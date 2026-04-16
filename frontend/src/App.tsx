import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import Home from './pages/Home'
import MemeFundPage from './pages/MemeFundPage'
import ResearchPage from './pages/ResearchPage'
import LendingPage from './pages/LendingPage'
import LendPage from './pages/LendPage'
import ChatPage from './pages/ChatPage'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0d0d1a' }}>
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/"         element={<Home />} />
            <Route path="/fund"     element={<MemeFundPage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/borrow"   element={<LendingPage />} />
            <Route path="/lend"     element={<LendPage />} />
            <Route path="/chat"     element={<ChatPage />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
