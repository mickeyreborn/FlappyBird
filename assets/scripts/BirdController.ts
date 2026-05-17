import { _decorator, Component, Graphics, Color, UITransform, Sprite } from 'cc';
import { GameConfig, GameState } from './GameConfig';

const { ccclass } = _decorator;

export const BIRD_DIED_EVENT = 'bird-died';

@ccclass('BirdController')
export class BirdController extends Component {
  private _velocityY = 0;
  private _alive = true;

  get velocityY(): number {
    return this._velocityY;
  }

  onLoad() {
    if (!this.getComponent(Sprite)) {
      this.drawBird();
    } else {
      const graphics = this.getComponent(Graphics);
      if (graphics) {
        graphics.destroy();
      }
    }
    const transform = this.getComponent(UITransform);
    if (transform) {
      transform.setContentSize(GameConfig.BIRD_RADIUS * 2, GameConfig.BIRD_RADIUS * 2);
    }
  }

  reset() {
    this._velocityY = 0;
    this._alive = true;
    this.node.setPosition(GameConfig.BIRD_X, GameConfig.DESIGN_HEIGHT / 2, 0);
    this.node.angle = 0;
  }

  flap() {
    if (!this._alive) return;
    this._velocityY = GameConfig.FLAP_VELOCITY;
  }

  updateBird(dt: number, state: GameState) {
    if (state === GameState.Ready) {
      const t = Date.now() * 0.003;
      const baseY = GameConfig.DESIGN_HEIGHT / 2;
      this.node.setPosition(GameConfig.BIRD_X, baseY + Math.sin(t) * 12, 0);
      this.node.angle = 0;
      return;
    }

    if (state !== GameState.Playing || !this._alive) return;

    this._velocityY += GameConfig.GRAVITY * dt;
    if (this._velocityY < GameConfig.MAX_FALL_SPEED) {
      this._velocityY = GameConfig.MAX_FALL_SPEED;
    }

    const pos = this.node.position;
    const newY = pos.y + this._velocityY * dt;
    this.node.setPosition(pos.x, newY, pos.z);

    const targetAngle = Math.max(-30, Math.min(90, -this._velocityY * 0.12));
    this.node.angle = targetAngle;

    if (newY <= GameConfig.PLAY_AREA_BOTTOM + GameConfig.BIRD_RADIUS) {
      this.die();
    } else if (newY >= GameConfig.CEILING_Y - GameConfig.BIRD_RADIUS) {
      this.die();
    }
  }

  die() {
    if (!this._alive) return;
    this._alive = false;
    this.node.emit(BIRD_DIED_EVENT);
  }

  getBounds() {
    const p = this.node.position;
    const r = GameConfig.BIRD_RADIUS;
    return { left: p.x - r, right: p.x + r, bottom: p.y - r, top: p.y + r };
  }

  isAlive(): boolean {
    return this._alive;
  }

  private drawBird() {
    let g = this.getComponent(Graphics);
    if (!g) g = this.addComponent(Graphics);
    g.clear();
    g.fillColor = new Color(255, 220, 0, 255);
    g.circle(0, 0, GameConfig.BIRD_RADIUS);
    g.fill();
    g.fillColor = new Color(255, 140, 0, 255);
    g.circle(GameConfig.BIRD_RADIUS * 0.35, -GameConfig.BIRD_RADIUS * 0.1, 6);
    g.fill();
    g.fillColor = new Color(30, 30, 30, 255);
    g.circle(GameConfig.BIRD_RADIUS * 0.5, GameConfig.BIRD_RADIUS * 0.15, 4);
    g.fill();
  }
}
