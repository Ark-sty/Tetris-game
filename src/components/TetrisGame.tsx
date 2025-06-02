// (생략된 import 및 기본 설정은 유지)

import React, { useEffect, useRef, useState, useCallback } from 'react';

// 테트리스 블록 타입 정의
type BlockType = 'I' | 'O' | 'T' | 'L' | 'J' | 'S' | 'Z';

// 블록 모양 정의
const BLOCKS = {
    I: [[1, 1, 1, 1]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    L: [[1, 0], [1, 0], [1, 1]],
    J: [[0, 1], [0, 1], [1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]]
};

// 블록 색상 정의
const COLORS = {
    I: '#00f0f0',
    O: '#f0f000',
    T: '#a000f0',
    L: '#f0a000',
    J: '#0000f0',
    S: '#00f000',
    Z: '#f00000'
};

// 게임 보드 크기
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

const TetrisGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(0);
    const [linesClearedTotal, setLinesClearedTotal] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [lockDelayTimer, setLockDelayTimer] = useState<NodeJS.Timeout | null>(null);
    const [dropInterval, setDropInterval] = useState<NodeJS.Timeout | null>(null);
    const [lastDropTime, setLastDropTime] = useState<number>(Date.now());
    const [nextBlockType, setNextBlockType] = useState<BlockType | null>(null);

    const [board, setBoard] = useState<number[][]>(
        Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
    );
    const [currentBlock, setCurrentBlock] = useState<{
        type: BlockType;
        position: { x: number; y: number };
        shape: number[][];
    } | null>(null);

    const createNewBlock = useCallback(() => {
        const types: BlockType[] = ['I', 'O', 'T', 'L', 'J', 'S', 'Z'];
        const nextType = nextBlockType || types[Math.floor(Math.random() * types.length)];
        const shape = BLOCKS[nextType];

        setCurrentBlock({
            type: nextType,
            position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2), y: 0 },
            shape
        });

        const newType = types[Math.floor(Math.random() * types.length)];
        setNextBlockType(newType);
    }, [nextBlockType]);

    const handleGameOver = useCallback(() => {
        setGameOver(true);
        setIsPlaying(false);

        // 게임 오버 시 점수 저장
        const playerName = prompt('플레이어 이름을 입력해주세요:') || 'Anonymous';
        const newScore = {
            id: Date.now(),
            playerName,
            score,
            level,
            date: new Date().toISOString()
        };

        const savedScores = localStorage.getItem('tetrisScores');
        const scores = savedScores ? JSON.parse(savedScores) : [];
        scores.push(newScore);
        localStorage.setItem('tetrisScores', JSON.stringify(scores));

        setScore(0);
    }, [score, level]);

    const startGame = useCallback(() => {
        setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
        setScore(0);
        setLevel(0);
        setLinesClearedTotal(0);
        setGameOver(false);
        setIsPlaying(true);
        setLastDropTime(Date.now());

        const types: BlockType[] = ['I', 'O', 'T', 'L', 'J', 'S', 'Z'];
        setNextBlockType(types[Math.floor(Math.random() * types.length)]);
        createNewBlock();
    }, [createNewBlock]);

    const isValidMove = useCallback((position: { x: number; y: number }, shape: number[][]) => {
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = position.x + x;
                    const boardY = position.y + y;

                    if (
                        boardX < 0 ||
                        boardX >= BOARD_WIDTH ||
                        boardY >= BOARD_HEIGHT ||
                        (boardY >= 0 && board[boardY][boardX])
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    }, [board]);

    const placeBlock = useCallback(() => {
        if (!currentBlock) return;

        const newBoard = [...board];
        for (let y = 0; y < currentBlock.shape.length; y++) {
            for (let x = 0; x < currentBlock.shape[y].length; x++) {
                if (currentBlock.shape[y][x]) {
                    const boardY = currentBlock.position.y + y;
                    const boardX = currentBlock.position.x + x;

                    if (boardY < 0 || (boardY < BOARD_HEIGHT && newBoard[boardY][boardX] === 1)) {
                        handleGameOver();
                        return;
                    }

                    if (boardY < BOARD_HEIGHT) {
                        newBoard[boardY][boardX] = 1;
                    }
                }
            }
        }

        setBoard(newBoard);
        checkLines(newBoard);
        createNewBlock();
    }, [currentBlock, board, createNewBlock, handleGameOver]);

    const isTouchingGround = useCallback(() => {
        if (!currentBlock) return false;
        const testPosition = {
            x: currentBlock.position.x,
            y: currentBlock.position.y + 1
        };
        return !isValidMove(testPosition, currentBlock.shape);
    }, [currentBlock, isValidMove]);

    const moveBlock = useCallback((dx: number, dy: number) => {
        if (!currentBlock || gameOver) return;

        const newPosition = {
            x: currentBlock.position.x + dx,
            y: currentBlock.position.y + dy
        };

        if (isValidMove(newPosition, currentBlock.shape)) {
            setCurrentBlock({ ...currentBlock, position: newPosition });

            if (dy !== 0 && isTouchingGround()) {
                // 이미 lockDelayTimer가 있으면 새로 만들지 않는다!
                if (!lockDelayTimer) {
                    const timer = setTimeout(() => {
                        placeBlock();
                        setLockDelayTimer(null);
                    }, 500);
                    setLockDelayTimer(timer);
                }
            } else if (!isTouchingGround() && lockDelayTimer) {
                // 바닥에서 떨어지면 타이머 취소
                clearTimeout(lockDelayTimer);
                setLockDelayTimer(null);
            }
        } else if (dy > 0) {
            if (!lockDelayTimer) {
                const timer = setTimeout(() => {
                    placeBlock();
                    setLockDelayTimer(null);
                }, 500);
                setLockDelayTimer(timer);
            }
        }
    }, [currentBlock, gameOver, isValidMove, placeBlock, lockDelayTimer, isTouchingGround]);

    // 점수 계산 함수 (NES 스타일)
    const calculateScore = (lines: number, level: number): number => {
        switch (lines) {
            case 1: return 40 * (level + 1);
            case 2: return 100 * (level + 1);
            case 3: return 300 * (level + 1);
            case 4: return 1200 * (level + 1);
            default: return 0;
        }
    };

    // SRS 회전을 위한 벽킥 시도
    const tryWallKick = (position: { x: number; y: number }, rotated: number[][]): { x: number; y: number } | null => {
        const offsets = [0, -1, 1, -2, 2];
        for (const dx of offsets) {
            const testPos = { x: position.x + dx, y: position.y };
            if (isValidMove(testPos, rotated)) return testPos;
        }
        return null;
    };

    // 회전 함수 수정 (SRS 적용)
    const rotateBlock = useCallback(() => {
        if (!currentBlock || gameOver) return;

        const rotated = currentBlock.shape[0].map((_, i) =>
            currentBlock.shape.map(row => row[i]).reverse()
        );

        const kicked = tryWallKick(currentBlock.position, rotated);
        if (kicked) {
            setCurrentBlock({ ...currentBlock, shape: rotated, position: kicked });

            if (isTouchingGround()) {
                if (!lockDelayTimer) {
                    const timer = setTimeout(() => {
                        placeBlock();
                        setLockDelayTimer(null);
                    }, 500);
                    setLockDelayTimer(timer);
                }
            } else if (!isTouchingGround() && lockDelayTimer) {
                clearTimeout(lockDelayTimer);
                setLockDelayTimer(null);
            }
        }
    }, [currentBlock, gameOver, isValidMove, lockDelayTimer, isTouchingGround, placeBlock]);

    // checkLines 함수 수정 (점수 및 레벨)
    const checkLines = useCallback((newBoard: number[][]) => {
        let linesCleared = 0;

        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            if (newBoard[y].every(cell => cell === 1)) {
                newBoard.splice(y, 1);
                newBoard.unshift(Array(BOARD_WIDTH).fill(0));
                linesCleared++;
                y++;
            }
        }

        if (linesCleared > 0) {
            setScore(prev => prev + calculateScore(linesCleared, level));
            setLinesClearedTotal(prev => {
                const total = prev + linesCleared;
                setLevel(Math.floor(total / 10));
                return total;
            });
            setBoard(newBoard);
        }
    }, [level]);

    const hardDrop = useCallback(() => {
        if (!currentBlock || gameOver) return;

        let dropDistance = 0;
        const shape = currentBlock.shape;
        const startPosition = currentBlock.position;

        while (isValidMove({ x: startPosition.x, y: startPosition.y + dropDistance + 1 }, shape)) {
            dropDistance++;
        }

        const finalPosition = {
            x: startPosition.x,
            y: startPosition.y + dropDistance
        };

        const newBoard = [...board];
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = finalPosition.x + x;
                    const boardY = finalPosition.y + y;

                    if (boardY < 0 || (boardY < BOARD_HEIGHT && newBoard[boardY][boardX] === 1)) {
                        handleGameOver();
                        return;
                    }

                    if (boardY < BOARD_HEIGHT) {
                        newBoard[boardY][boardX] = 1;
                    }
                }
            }
        }

        setBoard(newBoard);
        checkLines(newBoard);
        createNewBlock();
    }, [currentBlock, board, gameOver, isValidMove, handleGameOver, checkLines, createNewBlock]);

    // 게임 루프 수정 (레벨 기반 속도)
    const gameLoop = useCallback(() => {
        if (!isPlaying) return;

        const now = Date.now();
        const speed = Math.max(1000 - level * 100, 100); // 최소 속도 제한
        if (now - lastDropTime >= speed) {
            moveBlock(0, 1);
            setLastDropTime(now);
        }
    }, [isPlaying, moveBlock, lastDropTime, level]);

    useEffect(() => {
        if (!isPlaying) {
            if (dropInterval) {
                clearInterval(dropInterval);
                setDropInterval(null);
            }
            return;
        }

        const interval = setInterval(gameLoop, 16); // 약 60fps
        setDropInterval(interval);

        return () => {
            clearInterval(interval);
            setDropInterval(null);
        };
    }, [isPlaying, gameLoop]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (!isPlaying) return;

            switch (e.key) {
                case 'ArrowLeft':
                    moveBlock(-1, 0);
                    break;
                case 'ArrowRight':
                    moveBlock(1, 0);
                    break;
                case 'ArrowDown':
                    moveBlock(0, 1);
                    break;
                case 'ArrowUp':
                    rotateBlock();
                    break;
                case ' ':
                    hardDrop();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isPlaying, moveBlock, rotateBlock, hardDrop]);

    // 고스트 블록 위치 계산 함수 추가
    const getGhostPosition = useCallback(() => {
        if (!currentBlock) return null;
        let dropY = currentBlock.position.y;
        while (
            isValidMove({ x: currentBlock.position.x, y: dropY + 1 }, currentBlock.shape)
        ) {
            dropY++;
        }
        return { x: currentBlock.position.x, y: dropY };
    }, [currentBlock, isValidMove]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 보드 그리기
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                if (board[y][x]) {
                    // 그라데이션 생성
                    const gradient = ctx.createLinearGradient(
                        x * BLOCK_SIZE,
                        y * BLOCK_SIZE,
                        (x + 1) * BLOCK_SIZE,
                        (y + 1) * BLOCK_SIZE
                    );
                    gradient.addColorStop(0, '#666');
                    gradient.addColorStop(1, '#444');

                    // 블록 그리기
                    ctx.fillStyle = gradient;
                    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);

                    // 하이라이트 효과
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, 2);
                    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, 2, BLOCK_SIZE - 1);
                }
            }
        }

        if (currentBlock) {
            // 고스트 블럭 먼저 그리기 (반투명)
            const ghostPos = getGhostPosition();
            if (ghostPos) {
                const ghostGradient = ctx.createLinearGradient(
                    ghostPos.x * BLOCK_SIZE,
                    ghostPos.y * BLOCK_SIZE,
                    (ghostPos.x + 1) * BLOCK_SIZE,
                    (ghostPos.y + 1) * BLOCK_SIZE
                );
                ghostGradient.addColorStop(0, COLORS[currentBlock.type] + '40');
                ghostGradient.addColorStop(1, COLORS[currentBlock.type] + '20');

                ctx.fillStyle = ghostGradient;
                for (let y = 0; y < currentBlock.shape.length; y++) {
                    for (let x = 0; x < currentBlock.shape[y].length; x++) {
                        if (currentBlock.shape[y][x]) {
                            ctx.fillRect(
                                (ghostPos.x + x) * BLOCK_SIZE,
                                (ghostPos.y + y) * BLOCK_SIZE,
                                BLOCK_SIZE - 1,
                                BLOCK_SIZE - 1
                            );
                        }
                    }
                }
            }

            // 실제 블럭 그리기
            for (let y = 0; y < currentBlock.shape.length; y++) {
                for (let x = 0; x < currentBlock.shape[y].length; x++) {
                    if (currentBlock.shape[y][x]) {
                        const blockX = (currentBlock.position.x + x) * BLOCK_SIZE;
                        const blockY = (currentBlock.position.y + y) * BLOCK_SIZE;

                        // 그라데이션 생성
                        const gradient = ctx.createLinearGradient(
                            blockX,
                            blockY,
                            blockX + BLOCK_SIZE,
                            blockY + BLOCK_SIZE
                        );
                        gradient.addColorStop(0, COLORS[currentBlock.type]);
                        gradient.addColorStop(1, adjustColor(COLORS[currentBlock.type], -30));

                        // 블록 그리기
                        ctx.fillStyle = gradient;
                        ctx.fillRect(blockX, blockY, BLOCK_SIZE - 1, BLOCK_SIZE - 1);

                        // 하이라이트 효과
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                        ctx.fillRect(blockX, blockY, BLOCK_SIZE - 1, 2);
                        ctx.fillRect(blockX, blockY, 2, BLOCK_SIZE - 1);

                        // 그림자 효과
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                        ctx.fillRect(blockX + BLOCK_SIZE - 2, blockY, 2, BLOCK_SIZE - 1);
                        ctx.fillRect(blockX, blockY + BLOCK_SIZE - 2, BLOCK_SIZE - 1, 2);
                    }
                }
            }
        }
    }, [board, currentBlock, getGhostPosition]);

    // 색상 밝기 조절 함수
    const adjustColor = (color: string, amount: number): string => {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
            <h1 className="text-4xl font-bold mb-4">테트리스</h1>
            <div className="mb-4">
                <p className="text-xl">점수: {score}</p>
                <p className="text-sm text-gray-300">레벨: {level}</p>
                {nextBlockType && (
                    <div className="mt-2 text-sm text-gray-300">
                        <p>다음 블럭:</p>
                        <div className="inline-block p-2 border border-gray-400">
                            {BLOCKS[nextBlockType].map((row, y) => (
                                <div key={y} className="flex">
                                    {row.map((cell, x) => (
                                        <div
                                            key={x}
                                            style={{
                                                width: 12,
                                                height: 12,
                                                backgroundColor: cell ? COLORS[nextBlockType] : 'transparent',
                                                border: cell ? '1px solid #444' : '1px solid transparent'
                                            }}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <canvas
                ref={canvasRef}
                width={BOARD_WIDTH * BLOCK_SIZE}
                height={BOARD_HEIGHT * BLOCK_SIZE}
                className="border-2 border-gray-600"
            />
            {!isPlaying && (
                <button
                    onClick={startGame}
                    className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
                >
                    {gameOver ? '다시 시작' : '게임 시작'}
                </button>
            )}
            {gameOver && (
                <div className="mt-4 text-red-500 text-xl">
                    게임 오버!
                </div>
            )}
        </div>
    );
};

export default TetrisGame;
