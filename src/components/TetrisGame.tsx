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
    const [isPlaying, setIsPlaying] = useState(false);

    // 게임 상태
    const [board, setBoard] = useState<number[][]>(
        Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
    );
    const [currentBlock, setCurrentBlock] = useState<{
        type: BlockType;
        position: { x: number; y: number };
        shape: number[][];
    } | null>(null);

    // 새로운 블록 생성
    const createNewBlock = useCallback(() => {
        const types: BlockType[] = ['I', 'O', 'T', 'L', 'J', 'S', 'Z'];
        const type = types[Math.floor(Math.random() * types.length)];
        const shape = BLOCKS[type];

        setCurrentBlock({
            type,
            position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(shape[0].length / 2), y: 0 },
            shape
        });
    }, []);

    // 게임 오버 처리 함수 추가
    const handleGameOver = useCallback(() => {
        setGameOver(true);
        setIsPlaying(false);
        setScore(0);
    }, []);

    // 게임 시작
    const startGame = useCallback(() => {
        setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
        setScore(0);
        setGameOver(false);
        setIsPlaying(true);
        createNewBlock();
    }, [createNewBlock]);

    // 이동 가능 여부 확인
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

    // 블록 배치
    const placeBlock = useCallback(() => {
        if (!currentBlock) return;

        const newBoard = [...board];
        for (let y = 0; y < currentBlock.shape.length; y++) {
            for (let x = 0; x < currentBlock.shape[y].length; x++) {
                if (currentBlock.shape[y][x]) {
                    const boardY = currentBlock.position.y + y;
                    const boardX = currentBlock.position.x + x;

                    // 게임 오버 조건: 블록이 화면 상단을 벗어나거나 다른 블록과 겹칠 때
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

    // 블록 이동
    const moveBlock = useCallback((dx: number, dy: number) => {
        if (!currentBlock || gameOver) return;

        const newPosition = {
            x: currentBlock.position.x + dx,
            y: currentBlock.position.y + dy
        };

        // 충돌 검사
        if (isValidMove(newPosition, currentBlock.shape)) {
            setCurrentBlock({
                ...currentBlock,
                position: newPosition
            });
        } else if (dy > 0) {
            // 바닥에 닿았을 때
            placeBlock();
        }
    }, [currentBlock, gameOver, isValidMove, placeBlock]);

    // 블록 회전
    const rotateBlock = useCallback(() => {
        if (!currentBlock || gameOver) return;

        const rotated = currentBlock.shape[0].map((_, i) =>
            currentBlock.shape.map(row => row[i]).reverse()
        );

        if (isValidMove(currentBlock.position, rotated)) {
            setCurrentBlock({
                ...currentBlock,
                shape: rotated
            });
        }
    }, [currentBlock, gameOver, isValidMove]);

    // 라인 체크 및 제거
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
            setScore(prev => prev + linesCleared * 100);
            setBoard(newBoard);
        }
    }, []);

    // 하드 드롭 함수
    const hardDrop = useCallback(() => {
        if (!currentBlock || gameOver) return;

        let dropDistance = 0;
        const shape = currentBlock.shape;
        const startPosition = currentBlock.position;

        // 최대 이동 가능 거리 계산
        while (
            isValidMove({ x: startPosition.x, y: startPosition.y + dropDistance + 1 }, shape)
        ) {
            dropDistance++;
        }

        // 최종 위치
        const finalPosition = {
            x: startPosition.x,
            y: startPosition.y + dropDistance
        };

        // 블록을 보드에 바로 고정
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

    // 게임 루프
    useEffect(() => {
        if (!isPlaying) return;

        const gameLoop = setInterval(() => {
            moveBlock(0, 1);
        }, 1000);

        return () => clearInterval(gameLoop);
    }, [isPlaying, moveBlock]);

    // 키보드 이벤트 처리
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

    // 캔버스 렌더링
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 캔버스 초기화
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 보드 그리기
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                if (board[y][x]) {
                    ctx.fillStyle = '#666';
                    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                }
            }
        }

        // 현재 블록 그리기
        if (currentBlock) {
            ctx.fillStyle = COLORS[currentBlock.type];
            for (let y = 0; y < currentBlock.shape.length; y++) {
                for (let x = 0; x < currentBlock.shape[y].length; x++) {
                    if (currentBlock.shape[y][x]) {
                        ctx.fillRect(
                            (currentBlock.position.x + x) * BLOCK_SIZE,
                            (currentBlock.position.y + y) * BLOCK_SIZE,
                            BLOCK_SIZE - 1,
                            BLOCK_SIZE - 1
                        );
                    }
                }
            }
        }
    }, [board, currentBlock]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-4xl font-bold mb-4">테트리스</h1>
            <div className="mb-4">
                <p className="text-xl">점수: {score}</p>
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