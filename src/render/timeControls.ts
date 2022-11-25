import { GhostSamples } from "../App";

export class TimeControls {

  dom: HTMLDivElement;
  barContainer: HTMLDivElement;
  bar: HTMLDivElement;

  ghost: GhostSamples
  currentTime: number = 0;
  endTime: number;

  mouseDown: boolean = false;

  onReset?: () => void;

  listeners: any = {};

  constructor(ghost: GhostSamples) {
    this.dom = document.createElement("div");

    const barHeight = '8px';
    const borderRadius = '0px';
    
    this.barContainer = document.createElement("div");
    this.barContainer.style.width = "calc(100% - 20px)";
    this.barContainer.style.height = barHeight;
    this.barContainer.style.background = "#ffffff";
    this.barContainer.style.position = "absolute";
    this.barContainer.style.bottom = "10px";
    this.barContainer.style.left = "10px";
    this.barContainer.style.borderRadius = borderRadius;
    this.dom.appendChild(this.barContainer);
    
    this.bar = document.createElement("div");
    this.bar.style.width = "0%";
    this.bar.style.height = barHeight;
    this.bar.style.background = "#ff0000";
    this.bar.style.borderTopLeftRadius = borderRadius;
    this.bar.style.borderBottomLeftRadius = borderRadius;
    this.barContainer.appendChild(this.bar);
    
    const moveTime = (e: MouseEvent) => {
      const containerRect = this.barContainer.getBoundingClientRect();
      const ratio = Math.max(0, Math.min((e.clientX - containerRect.x) / containerRect.width, 1));

      this.currentTime = ratio * this.endTime;

      this.onReset?.();
    }

    this.listeners.mousedown = (e: MouseEvent) => {
      this.mouseDown = true;
      moveTime(e);

      e.stopPropagation();
    };

    this.listeners.mouseup = (e: MouseEvent) => {
      this.mouseDown = false;
    };

    this.listeners.mousemove = (e: MouseEvent) => {
      if (this.mouseDown) moveTime(e);
    };

    this.barContainer.addEventListener("mousedown", this.listeners.mousedown);
    document.addEventListener("mouseup", this.listeners.mouseup);
    document.addEventListener("mousemove", this.listeners.mousemove);

    this.ghost = ghost;

    this.endTime = ghost.samples[ghost.samples.length - 1].timestamp / 1000;
  }

  update(t: number) {
    if (!this.mouseDown) this.currentTime += t;

    if (this.currentTime > this.endTime) {
      this.currentTime = 0;
      this.onReset?.();
    }

    const ratio = 1 - ((this.endTime - this.currentTime) / this.endTime);
    this.bar.style.width = (ratio * 100).toString() + '%';
  }

  sample() {
    let sampleIndex = this.ghost.samples.findIndex(
      (sample) => sample.timestamp > this.currentTime * 1000
    );

    const sample = this.ghost.samples[sampleIndex] || this.ghost.samples[this.ghost.samples.length - 1];
    const nextSample = this.ghost.samples[sampleIndex + 1] || sample;

    return {sample, nextSample};
  }

  dispose() {
    this.barContainer.removeEventListener("mousedown", this.listeners.mousedown);
    document.removeEventListener("mouseup", this.listeners.mouseup);
    document.removeEventListener("mousemove", this.listeners.mousemove);
  }
}