import React, { useEffect, useState } from 'react';

interface ScoreEntry {
    id: number;
    playerName: string;
    score: number;
    level: number;
    date: string;
}

const Leaderboard: React.FC = () => {
    const [scores, setScores] = useState<ScoreEntry[]>([]);

    useEffect(() => {
        // 로컬 스토리지에서 점수 데이터 불러오기
        const savedScores = localStorage.getItem('tetrisScores');
        if (savedScores) {
            setScores(JSON.parse(savedScores));
        }
    }, []);

    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">리더보드</h1>
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden w-full max-w-2xl">
                <table className="w-full">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                순위
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                플레이어
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                점수
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                레벨
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                날짜
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {scores.length > 0 ? (
                            scores
                                .sort((a, b) => b.score - a.score)
                                .map((score, index) => (
                                    <tr key={score.id} className="hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {score.playerName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {score.score.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {score.level}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {new Date(score.date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                                    아직 기록이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard; 