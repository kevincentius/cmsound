import { Component, OnInit, ViewChild } from '@angular/core';
import { PgnParser } from '@chess-fu/pgn-parser';
import { PgnGame } from '@chess-fu/pgn-parser/dist/types/pgnGame';
import { MoveHistory } from '@chess-fu/pgn-parser/dist/types/pgnTypes';
import { SoundService } from './sound.service';
import { Chess } from 'chess.js';

declare const Chessboard: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  text = 'hi';

  game: PgnGame;
  move = 0;

  pieces = [ 'P', 'N', 'B', 'R', 'Q', 'K' ];
  soundNames = { P: 'pawn', N: 'knight', B: 'bishop', R: 'rook', Q: 'queen', K: 'king' };
  sounds: any = {};
  loaded = 0;

  pitch = 0;
  maxPitch = 9;
  minPitch = -3;

  @ViewChild('boardElm') boardElm;
  board;

  constructor(
    private soundService: SoundService
  ) {}

  ngOnInit() {
    this.boardElm.nativeElement.id = 'board1';
    this.board = Chessboard('board1', 'start');

    const parser = new PgnParser();
    [this.game] = parser.parse(`
      [Event "Hoogovens Group A"]
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
    `);

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
  }

  start() {
    const move: MoveHistory = this.game.moves()[this.move];
    this.game.move(this.move);
    console.log(move);

    this.text = move.raw;

    // play audio
    const player = this.sounds[move.piece][this.pitch];
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
    console.log(move.from + '-' + move.to);
    this.board.move(move.raw); //move.from + '-' + move.to);

    this.move++;
    if (this.game.moves().length > this.move) {
      setTimeout(this.start.bind(this), 3428);
    }
  }

}
