import { Component, OnInit, ViewChild } from '@angular/core';
import { SoundService } from './sound.service';

declare const Chessboard: any;
declare const Chess: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  pgn = `[Event "Hoogovens Group A"]
[Site "Wijk aan Zee NED"]
[Date "1999.01.20"]
[EventDate "1999.01.16"]
[Round "4"]
[Result "1-0"]
[White "Garry Kasparov"]
[Black "Veselin Topalov"]
[ECO "B07"]
[WhiteElo "2812"]
[BlackElo "2700"]
[PlyCount "87"]

1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5
7. Nge2 Nbd7 8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7
12. Kb1 a6 13. Nc1 O-O-O 14. Nb3 exd4 15. Rxd4 c5 16. Rd1 Nb6
17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5 20. Qf4+ Ka7 21. Rhe1 d4
22. Nd5 Nbxd5 23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6
26. Qxd4+ Kxa5 27. b4+ Ka4 28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7
Qc4 31. Qxf6 Kxa3 32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2
35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7 38. Bxc4 bxc4 39. Qxh8
Rd3 40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5 43. Kc1 Rd2 44. Qa7 1-0
  `;
  text = 'Loading sounds...';

  chess;
  history;
  move = 0;

  pieces = [ 'P', 'N', 'B', 'R', 'Q', 'K', 'gameover' ];
  soundNames = { P: 'pawn', N: 'knightc', B: 'bishopd', R: 'rookb', Q: 'queenb', K: 'king', gameover: 'gameover' };
  sounds: any = {};
  loaded = 0;

  pitch = 0;
  maxPitch = 9;
  minPitch = -3;

  @ViewChild('boardElm') boardElm;
  board;

  timeout;
  playable = false;
  threeD = false;

  constructor(
    private soundService: SoundService
  ) {}

  ngOnInit() {
    this.board = Chessboard('board', {
      draggable: false,
      moveSpeed: 3000,
      snapbackSpeed: 500,
      snapSpeed: 100,
      position: 'start'
    });

    this.chess = Chess();
    for (const p of this.pieces) {
      this.load(p);
    }
  }

  load(p: string) {
    this.soundService.loadPrerender(this.soundNames[p], function(source) {
      this.sounds[p] = source;
      this.onSoundLoaded();
    }.bind(this));
  }

  onSoundLoaded() {
    this.loaded++;
    if (this.loaded < this.pieces.length) {
      this.text = 'Loading sounds...' + this.loaded + '/' + this.pieces.length;
    } else {
      this.text = 'Click "Read PGN" to start!';
    }
  }

  pause() {
    window.clearTimeout(this.timeout);
    this.timeout = null;
    this.playable = true;
  }

  resume() {
    this.playable = false;
    this.play();
  }

  start() {
    // reset
    this.pitch = 0;
    this.chess.reset();
    this.chess.load_pgn(this.pgn);
    this.history = this.chess.history({ verbose: true });
    this.move = 0;
    this.board.start(false);

    if (this.timeout) {
      window.clearTimeout(this.timeout);
      this.timeout = null;
    }

    this.play();
  }

  play() {
    const move = this.history[this.move];
    this.text = move.san;

    // play audio
    const player = this.sounds[move.piece.toUpperCase()][this.pitch];
    player.currentTime = 0;
    // player.pitchFx.pitch = this.pitch;
    player.start();

    // update pitch
    const d = 3; // 3 + 2 * Math.floor(Math.random() * 2);
    if (this.pitch + d > this.maxPitch) {
      this.pitch -= 11;
    } else {
      this.pitch += d;
    }

    // play move on board
    // TODO: what about enpassant??
    if (move.san === 'O-O') {
      if (move.color === 'w') {
        this.board.move('e1-g1', 'h1-f1');
      } else {
        this.board.move('e8-g8', 'h8-f8');
      }
    } else if (move.san === 'O-O-O') {
      if (move.color === 'w') {
        this.board.move('e1-c1', 'a1-d1');
      } else {
        this.board.move('e8-c8', 'a8-d8');
      }
    } else {
      this.board.move(move.from + '-' + move.to);
    }

    this.move++;
    if (this.history.length > this.move) {
      this.timeout = setTimeout(this.play.bind(this), 3428);
    } else {
      this.playable = false;
      this.timeout = setTimeout(function() {
        const gameoverPlayer = this.sounds['gameover'][this.pitch];
        gameoverPlayer.currentTime = 0;
        // player.pitchFx.pitch = this.pitch;
        gameoverPlayer.start();
      }.bind(this), 3428);
    }
  }

  set3d(val) {
    this.threeD = val;
  }

}
