import { Component, ElementRef, ViewChild, HostListener, Output, OnInit, AfterViewInit, EventEmitter, Input } from '@angular/core';
import { Vector } from 'vecti';

@Component({
  selector: 'app-mini-map',
  template: `
    <div class="mini-map" #miniMap>
      <div #port style="width 50px; height: 80px; border: 1px solid #444; background: #66666688"></div>
    </div>
  `,
  styles: [
    `
    .mini-map {
      position: absolute;
      top: 0;
      right: 0;
      width: 100px;
      height: 100px;
      opacity: 0.6;
      overflow: hidden;
      border: 1px solid #4caf50;
      box-shadow: 0 0 4px #444;
    }
    `
  ]
})
export class MiniMapComponent implements AfterViewInit {

  @ViewChild('miniMap') miniMap!: ElementRef<HTMLDivElement>;
  @ViewChild('port') port!: ElementRef<HTMLDivElement>;

  private isDragging = false;
  private localStart = new Vector(0, 0);
  private localShift = new Vector(0, 0);
  private orientation?: 'landscape' | 'portrait';
  private screenDim?: Vector;
  private imageDim?: Vector;
  private screenRect?: Vector;
  private imageRect?: Vector;

  @Input()
  imgRef!: HTMLImageElement;

  @Output()
  shift = new EventEmitter<[number, number]>();

  ngAfterViewInit(): void {

    this.imgRef.onload = () => {
      this.imageDim = new Vector(this.imgRef.naturalWidth, this.imgRef.naturalHeight);
      this.screenDim = new Vector(this.imgRef.clientWidth, this.imgRef.clientHeight);
      this.orientation = this.screenDim.x < this.screenDim.y ? 'landscape' : 'portrait';

      const imgScale = this.orientation === 'landscape' ? this.imageDim.y / this.screenDim.y : this.imageDim.x / this.screenDim.x;
      this.screenRect = this.screenDim.divide(Math.min(this.imageDim.x, this.imageDim.y) / imgScale).multiply(100);
      this.imageRect = this.imageDim.divide(Math.max(this.imageDim.x, this.imageDim.y)).multiply(100);

      this.miniMap.nativeElement.style.width = `${this.imageRect.x}px`;
      this.miniMap.nativeElement.style.height = `${this.imageRect.y}px`;
      this.port.nativeElement.style.width = `${this.screenRect.x}px`;
      this.port.nativeElement.style.height = `${this.screenRect.y}px`;
      // center the port
      this.localShift = this.imageRect.subtract(this.screenRect).divide(2);
      this.port.nativeElement.style.transform = `translate(${this.localShift.x}px, ${this.localShift.y}px)`;

      this.miniMap.nativeElement.style.backgroundImage = `url(${this.imgRef.src})`;
      this.miniMap.nativeElement.style.backgroundSize = 'cover';
    }
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onMouseDown(event: TouchEvent|MouseEvent) {
    this.isDragging = true;
    if (event instanceof TouchEvent) {
      this.localStart = new Vector(event.touches[0].clientX, event.touches[0].clientY);
    } else {
      this.localStart = new Vector(event.clientX, event.clientY);
    }
    return false;
  }

  @HostListener('mousemove', ['$event'])
  @HostListener('touchmove', ['$event'])
  onMouseMove(event: TouchEvent|MouseEvent) {
    if (!this.isDragging) return;
    const x = event instanceof TouchEvent ? event.touches[0].clientX : event.clientX;
    const y = event instanceof TouchEvent ? event.touches[0].clientY : event.clientY;
    const xy = new Vector(x, y); // to where i moved
    const delta = xy.subtract(this.localStart); // distance of movedTo to where i clicked (localStart)
    this.localStart = xy; // update localStart
    this.localShift = this.localShift.add(delta);
    this.port.nativeElement.style.transform = `translate(${this.localShift.x}px, ${this.localShift.y}px)`;

    const z = this.orientation === 'landscape' ? this.imageRect!.x / (this.imageRect!.x - this.screenRect!.x) : this.imageRect!.y / (this.imageRect!.y - this.screenRect!.y);
    const imageShift = this.localShift.multiply(z);
    this.imgRef.style.objectPosition = `${imageShift.x}% ${imageShift.y}% `;
    return false;
  }

  @HostListener('mouseup', ['$event'])
  @HostListener('touchend', ['$event'])
  onMouseUp(event: TouchEvent|MouseEvent) {
    this.isDragging = false;
    return false;
  }

}
