import { Injectable } from '@angular/core';
import { Master, Player, PitchShift } from 'tone';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  audioCtx;

  constructor() {}

  load(file, onload) {
    const player: Player = new Player(file, function() {
      player.pitchFx = new PitchShift();
      console.log('a', Master);
      player.chain(player.pitchFx, Master);
      console.log('b');
      onload(player);
    });
  }

  loadHtmlAudio(file, onload) {
    const audio = new Audio(file);
    audio.oncanplaythrough = () => onload(audio);
    audio.load();
  }

  loadPrerender(name, onload) {
    let count = 0;
    const players: any = {};
    for (let i = -4; i <= 9; i++) {
      players[i] = new Player('/assets/snd/prerender/' + name + i + '.mp3', function() {
        count++;
        if (count === 14) {
          onload(players);
        }
      }).toMaster();
    }
  }

}
