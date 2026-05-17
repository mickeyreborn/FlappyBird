import { _decorator, Component, Node } from 'cc';
import { GameConfig, GameState, IBirdController, IGameManager } from './GameConfig';
import { Pipe } from './Pipe';

const { ccclass } = _decorator;

function rectsOverlap(
  a: { left: number; right: number; bottom: number; top: number },
  b: { left: number; right: number; bottom: number; top: number },
): boolean {
  return a.left < b.right && a.right > b.left && a.bottom < b.top && a.top > b.bottom;
}

@ccclass('PipeManager')
export class PipeManager extends Component {
  /** 由 GameManager.resolveReferences() 注入，不用 @property 避免循环引用 */
  gameManager: Component | null = null;

  /** 由 GameManager.resolveReferences() 注入 */
  bird: Component | null = null;

  private _pipes: Pipe[] = [];
  private _spawnTimer = 0;

  onLoad() {
    for (let i = 0; i < 4; i++) {
      const node = new Node(`Pipe_${i}`);
      node.setParent(this.node);
      this._pipes.push(node.addComponent(Pipe));
      this._pipes[i].deactivate();
    }
  }

  private get birdCtrl(): IBirdController | null {
    return this.bird as unknown as IBirdController | null;
  }

  private get gameMgr(): IGameManager | null {
    return this.gameManager as unknown as IGameManager | null;
  }

  reset() {
    this._spawnTimer = GameConfig.PIPE_SPAWN_INTERVAL * 0.5;
    for (const pipe of this._pipes) {
      pipe.deactivate();
    }
  }

  updatePipes(dt: number, state: GameState) {
    if (state !== GameState.Playing) return;

    this._spawnTimer -= dt;
    if (this._spawnTimer <= 0) {
      this.spawnPipe();
      this._spawnTimer = GameConfig.PIPE_SPAWN_INTERVAL;
    }

    const bird = this.birdCtrl;
    const birdBounds = bird?.getBounds();
    for (const pipe of this._pipes) {
      if (!pipe.active) continue;
      pipe.move(dt);
      if (!birdBounds || !bird?.isAlive()) continue;

      const bounds = pipe.getBounds();
      if (
        rectsOverlap(birdBounds, bounds.topRect) ||
        rectsOverlap(birdBounds, bounds.bottomRect)
      ) {
        bird.die();
        return;
      }

      if (!bounds.scored && birdBounds.left > bounds.topRect.left + GameConfig.PIPE_WIDTH / 2) {
        pipe.scored = true;
        this.gameMgr?.addScore(1);
      }
    }
  }

  private spawnPipe() {
    const margin = 80;
    const minY = GameConfig.PLAY_AREA_BOTTOM + GameConfig.PIPE_GAP / 2 + margin;
    const maxY = GameConfig.CEILING_Y - GameConfig.PIPE_GAP / 2 - margin;
    const gapY = minY + Math.random() * (maxY - minY);

    let pipe = this._pipes.find((p) => !p.active);
    if (!pipe) {
      const node = new Node('Pipe_extra');
      node.setParent(this.node);
      pipe = node.addComponent(Pipe);
      this._pipes.push(pipe);
    }
    pipe.init(gapY);
  }
}
