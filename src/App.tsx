import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TetrisGame from './components/TetrisGame';
import Leaderboard from './components/Leaderboard';
import Contact from './components/Contact';

const App: React.FC = () => {
    return (
        <Router>
            <div className="h-screen flex flex-col bg-gray-900 text-white">
                <nav className="bg-gray-800 p-4 h-16">
                    <div className="container mx-auto flex justify-between items-center h-full">
                        <Link to="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300">
                            Tetris
                        </Link>
                        <div className="space-x-6">
                            <Link to="/" className="hover:text-blue-300 transition-colors">
                                게임하기
                            </Link>
                            <Link to="/leaderboard" className="hover:text-blue-300 transition-colors">
                                리더보드
                            </Link>
                            <Link to="/contact" className="hover:text-blue-300 transition-colors">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </nav>

                <main className="flex-1 overflow-hidden">
                    <Routes>
                        <Route path="/" element={<TetrisGame />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/contact" element={<Contact />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App; 