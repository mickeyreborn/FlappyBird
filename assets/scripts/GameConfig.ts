/** Flappy Bird 游戏常量（设计分辨率 360×640） */
export const GameConfig = {
    DESIGN_WIDTH: 360,
    DESIGN_HEIGHT: 640,

    GRAVITY: -1200,
    FLAP_VELOCITY: 380,
    MAX_FALL_SPEED: -600,

    PIPE_SPEED: 160,
    PIPE_SPAWN_INTERVAL: 1.6,
    PIPE_WIDTH: 60,
    PIPE_GAP: 150,
    PIPE_SPAWN_X: 420,

    BIRD_X: 80,
    BIRD_RADIUS: 18,

    GROUND_HEIGHT: 80,
    CEILING_Y: 640,

    GROUND_Y: 0,
    PLAY_AREA_BOTTOM: 80,
};

export enum GameState {
    Ready = 0,
    Playing = 1,
    GameOver = 2,
}

export interface RectBounds {
    left: number;
    right: number;
    bottom: number;
    top: number;
}

/** 供 PipeManager 调用，避免与 BirdController 循环引用 */
export interface IBirdController {
    getBounds(): RectBounds;
    isAlive(): boolean;
    die(): void;
}

/** 供 PipeManager 调用，避免与 GameManager 循环引用 */
export interface IGameManager {
    addScore(n: number): void;
}
