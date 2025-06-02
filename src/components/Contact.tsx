import React from 'react';

const Contact: React.FC = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>
            <div className="bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-2xl">
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-500 p-3 rounded-full">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-300">이메일</h3>
                            <p className="text-gray-400">pruina@kentech.ac.kr</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="bg-green-500 p-3 rounded-full">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-300">전화번호</h3>
                            <p className="text-gray-400">010-3905-6168</p>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-gray-700 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-300 mb-2">문의사항</h3>
                        <p className="text-gray-400">
                            게임 관련 문의사항이나 버그 리포트는 이메일로 보내주시면 빠르게 답변 드리도록 하겠습니다.
                            여러분의 소중한 의견을 기다립니다!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact; 