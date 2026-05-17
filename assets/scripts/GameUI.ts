import { _decorator, Component, Label } from 'cc';
import { GameState } from './GameConfig';

const { ccclass, property } = _decorator;

@ccclass('GameUI')
export class GameUI extends Component {
  @property(Label)
  scoreLabel: Label | null = null;

  @property(Label)
  hintLabel: Label | null = null;

  @property(Label)
  gameOverLabel: Label | null = null;

  @property(Label)
  bestLabel: Label | null = null;

  updateUI(state: GameState, score: number, best: number) {
    if (this.scoreLabel) {
      this.scoreLabel.string = state === GameState.Playing ? `${score}` : '';
    }
    if (this.hintLabel) {
      this.hintLabel.string =
        state === GameState.Ready ? '点击屏幕开始' : state === GameState.GameOver ? '点击重玩' : '';
    }
    if (this.gameOverLabel) {
      this.gameOverLabel.string = state === GameState.GameOver ? '游戏结束' : '';
    }
    if (this.bestLabel) {
      this.bestLabel.string =
        state === GameState.GameOver ? `最高分: ${best}` : state === GameState.Ready && best > 0 ? `最高: ${best}` : '';
    }
  }
}
