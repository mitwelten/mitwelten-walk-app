import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Vector } from 'vecti';

@Component({
  selector: 'app-mini-map',
  template: `
    <div class="mini-map" #image>
      <div #screen style="width 50px; height: 80px; border: 1px solid #444; background: #66666688"></div>
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

  @ViewChild('image')  image!:  ElementRef<HTMLDivElement>;
  @ViewChild('screen') screen!: ElementRef<HTMLDivElement>;

  private isDragging = false;
  private origin = new Vector(0, 0);
  private offset = new Vector(0, 0);
  private orientation?: 'landscape' | 'portrait';
  private screenDim?: Vector;
  private imageDim?: Vector;
  private screenRect?: Vector;
  private imageRect?: Vector;

  @Input()
  imgRef!: HTMLImageElement;

  ngAfterViewInit(): void {

    this.imgRef.onload = () => {
      this.imageDim = new Vector(this.imgRef.naturalWidth, this.imgRef.naturalHeight);
      this.screenDim = new Vector(this.imgRef.clientWidth, this.imgRef.clientHeight);
      this.orientation = this.screenDim.x < this.screenDim.y ? 'landscape' : 'portrait';

      const imgScale = this.orientation === 'landscape' ? this.imageDim.y / this.screenDim.y : this.imageDim.x / this.screenDim.x;
      this.screenRect = this.screenDim.divide(Math.min(this.imageDim.x, this.imageDim.y) / imgScale).multiply(100);
      this.imageRect = this.imageDim.divide(Math.max(this.imageDim.x, this.imageDim.y)).multiply(100);

      this.image.nativeElement.style.width = `${this.imageRect.x}px`;
      this.image.nativeElement.style.height = `${this.imageRect.y}px`;
      this.screen.nativeElement.style.width = `${this.screenRect.x}px`;
      this.screen.nativeElement.style.height = `${this.screenRect.y}px`;

      // center the screen element
      this.offset = this.imageRect.subtract(this.screenRect).divide(2);
      this.screen.nativeElement.style.transform = `translate(${this.offset.x}px, ${this.offset.y}px)`;

      this.image.nativeElement.style.backgroundImage = `url(${this.imgRef.src})`;
      this.image.nativeElement.style.backgroundSize = 'cover';
    }
  }

  @HostListener('mousedown', ['$event'])
  @HostListener('touchstart', ['$event'])
  onMouseDown(event: TouchEvent|MouseEvent) {
    this.isDragging = true;
    if (event instanceof TouchEvent) {
      this.origin = new Vector(event.touches[0].clientX, event.touches[0].clientY);
    } else {
      this.origin = new Vector(event.clientX, event.clientY);
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
    const delta = xy.subtract(this.origin); // distance of move (xy) to where i clicked (origin)
    this.origin = xy; // update origin
    this.offset = this.offset.add(delta);
    this.screen.nativeElement.style.transform = `translate(${this.offset.x}px, ${this.offset.y}px)`;

    const z = this.orientation === 'landscape' ? this.imageRect!.x / (this.imageRect!.x - this.screenRect!.x) : this.imageRect!.y / (this.imageRect!.y - this.screenRect!.y);
    const imageShift = this.offset.multiply(z);
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
