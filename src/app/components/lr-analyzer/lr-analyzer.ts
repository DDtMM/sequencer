import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, signal, afterNextRender, DestroyRef, inject } from '@angular/core';
import { SequencerService } from '../../services/sequencer.service';

@Component({
  selector: 'app-lr-analyzer',
  imports: [],
  templateUrl: './lr-analyzer.html',
  styleUrl: './lr-analyzer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LrAnalyzer {
  private readonly sequencer = inject(SequencerService);
  leftLevel = signal<number>(0);
  rightLevel = signal<number>(0);
  
  private animationFrameId: number | undefined = undefined;

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      if (this.animationFrameId !== undefined) {
        cancelAnimationFrame(this.animationFrameId);
      }
    });
    afterNextRender(() => {
      this.startAnimation();
    })
  }

  private startAnimation(): void {
    const update = () => {
      const leftDb = this.sequencer.getLeftLevel();
      const rightDb = this.sequencer.getRightLevel();
      
      // Convert from dB to 0-100 range for visualization
      // Clamp between -60dB and 0dB
      const leftPercent = Math.max(0, Math.min(100, ((leftDb + 60) / 60) * 100));
      const rightPercent = Math.max(0, Math.min(100, ((rightDb + 60) / 60) * 100));
      
      this.leftLevel.set(leftPercent);
      this.rightLevel.set(rightPercent);
      
      this.animationFrameId = requestAnimationFrame(update);
    };
    
    update();
  }
}
