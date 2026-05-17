import {
  _decorator,
  Component,
  input,
  Input,
  EventTouch,
  KeyCode,
  EventKeyboard,
  sys,
} from 'cc';
import { GameState } from './GameConfig';
import { BirdController, BIRD_DIED_EVENT } from './BirdController';
import { PipeManager } from './PipeManager';
import { GameUI } from './GameUI';

const { ccclass, property } = _decorator;

const BEST_SCORE_KEY = 'flappy_best_score';

@ccclass('GameManager')
export class GameManager extends Component {
  @property(BirdController)
  bird: BirdController | null = null;

  @property(PipeManager)
  pipeManager: PipeManager | null = null;

  @property(GameUI)
  gameUI: GameUI | null = null;

  private _state = GameState.Ready;
  private _score = 0;
  private _best = 0;

  get state(): GameState {
    return this._state;
  }

  onLoad() {
    this._best = parseInt(sys.localStorage.getItem(BEST_SCORE_KEY) || '0', 10) || 0;
    this.resolveReferences();

    input.on(Input.EventType.TOUCH_START, this.onTap, this);
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }

  onDestroy() {
    input.off(Input.EventType.TOUCH_START, this.onTap, this);
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    if (this.bird) {
      this.bird.node.off(BIRD_DIED_EVENT, this.onBirdDied, this);
    }
  }

  start() {
    this.enterReady();
  }

  update(dt: number) {
    this.bird?.updateBird(dt, this._state);
    this.pipeManager?.updatePipes(dt, this._state);
  }

  onTap(_event: EventTouch) {
    this.handleAction();
  }

  onKeyDown(event: EventKeyboard) {
    if (event.keyCode === KeyCode.SPACE || event.keyCode === KeyCode.ENTER) {
      this.handleAction();
    }
  }

  private handleAction() {
    switch (this._state) {
      case GameState.Ready:
        this.startGame();
        break;
      case GameState.Playing:
        this.bird?.flap();
        break;
      case GameState.GameOver:
        this.enterReady();
        break;
    }
  }

  private startGame() {
    this._state = GameState.Playing;
    this._score = 0;
    this.bird?.flap();
    this.refreshUI();
  }

  enterReady() {
    this._state = GameState.Ready;
    this._score = 0;
    this.bird?.reset();
    this.pipeManager?.reset();
    this.refreshUI();
  }

  onBirdDied() {
    if (this._state !== GameState.Playing) return;
    this._state = GameState.GameOver;
    if (this._score > this._best) {
      this._best = this._score;
      sys.localStorage.setItem(BEST_SCORE_KEY, `${this._best}`);
    }
    this.refreshUI();
  }

  addScore(n: number) {
    this._score += n;
    this.refreshUI();
  }

  private refreshUI() {
    this.gameUI?.updateUI(this._state, this._score, this._best);
  }

  private resolveReferences() {
    const root = this.node;
    if (!this.bird) {
      this.bird = root.getComponentInChildren(BirdController);
    }
    if (!this.pipeManager) {
      this.pipeManager = root.getComponentInChildren(PipeManager);
    }
    if (!this.gameUI) {
      this.gameUI = root.getComponentInChildren(GameUI);
    }
    if (this.bird) {
      this.bird.node.off(BIRD_DIED_EVENT, this.onBirdDied, this);
      this.bird.node.on(BIRD_DIED_EVENT, this.onBirdDied, this);
    }
    if (this.pipeManager) {
      this.pipeManager.gameManager = this;
      if (!this.pipeManager.bird) {
        this.pipeManager.bird = this.bird;
      }
    }
  }
}
