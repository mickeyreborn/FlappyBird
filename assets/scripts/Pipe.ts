import { _decorator, Component, Node, Graphics, Color, UITransform } from 'cc';
import { GameConfig } from './GameConfig';

const { ccclass } = _decorator;

export interface PipeBounds {
  topRect: { left: number; right: number; bottom: number; top: number };
  bottomRect: { left: number; right: number; bottom: number; top: number };
  scored: boolean;
}

@ccclass('Pipe')
export class Pipe extends Component {
  private _gapCenterY = 0;
  private _scored = false;
  private _active = false;

  get gapCenterY(): number {
    return this._gapCenterY;
  }

  get scored(): boolean {
    return this._scored;
  }

  set scored(v: boolean) {
    this._scored = v;
  }

  get active(): boolean {
    return this._active;
  }

  init(gapCenterY: number) {
    this._gapCenterY = gapCenterY;
    this._scored = false;
    this._active = true;
    this.node.setPosition(GameConfig.PIPE_SPAWN_X, 0, 0);
    this.rebuildGraphics();
  }

  deactivate() {
    this._active = false;
    this.node.setPosition(-500, 0, 0);
  }

  move(dt: number) {
    if (!this._active) return;
    const pos = this.node.position;
    this.node.setPosition(pos.x - GameConfig.PIPE_SPEED * dt, pos.y, pos.z);
    if (pos.x < -GameConfig.PIPE_WIDTH) {
      this.deactivate();
    }
  }

  getBounds(): PipeBounds {
    const x = this.node.position.x;
    const halfW = GameConfig.PIPE_WIDTH / 2;
    const left = x - halfW;
    const right = x + halfW;
    const gapHalf = GameConfig.PIPE_GAP / 2;
    const gapBottom = this._gapCenterY - gapHalf;
    const gapTop = this._gapCenterY + gapHalf;

    return {
      topRect: { left, right, bottom: gapTop, top: GameConfig.DESIGN_HEIGHT },
      bottomRect: { left, right, bottom: GameConfig.PLAY_AREA_BOTTOM, top: gapBottom },
      scored: this._scored,
    };
  }

  private rebuildGraphics() {
    const container = this.node;
    container.removeAllChildren();

    const gapHalf = GameConfig.PIPE_GAP / 2;
    const gapBottom = this._gapCenterY - gapHalf;
    const gapTop = this._gapCenterY + gapHalf;

    this.createPipeSegment('Top', gapTop, GameConfig.DESIGN_HEIGHT - gapTop);
    this.createPipeSegment('Bottom', GameConfig.PLAY_AREA_BOTTOM, gapBottom - GameConfig.PLAY_AREA_BOTTOM);
  }

  private createPipeSegment(name: string, bottomY: number, height: number) {
    if (height <= 0) return;

    const seg = new Node(name);
    seg.setParent(this.node);
    seg.setPosition(0, bottomY + height / 2, 0);

    const transform = seg.addComponent(UITransform);
    transform.setContentSize(GameConfig.PIPE_WIDTH, height);
    transform.setAnchorPoint(0.5, 0.5);

    const g = seg.addComponent(Graphics);
    g.fillColor = new Color(115, 191, 68, 255);
    g.rect(-GameConfig.PIPE_WIDTH / 2, -height / 2, GameConfig.PIPE_WIDTH, height);
    g.fill();
    g.strokeColor = new Color(80, 140, 50, 255);
    g.lineWidth = 2;
    g.rect(-GameConfig.PIPE_WIDTH / 2, -height / 2, GameConfig.PIPE_WIDTH, height);
    g.stroke();

    const capH = 24;
    g.fillColor = new Color(90, 160, 55, 255);
    const capY = name === 'Top' ? -height / 2 + capH / 2 : height / 2 - capH / 2;
    g.rect(-GameConfig.PIPE_WIDTH / 2 - 4, capY - capH / 2, GameConfig.PIPE_WIDTH + 8, capH);
    g.fill();
  }
}
