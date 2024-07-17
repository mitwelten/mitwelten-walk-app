import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Vector } from 'vecti';

@Component({
  selector: 'app-mini-map',
  template: `
    <div class="mini-map" #image>
      <div #screen></div>
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
    .mini-map div {
      border: 1px solid #444;
      background: #4caf5052
    }
    `
  ]
})
export class MiniMapComponent implements AfterViewInit {

  /** reference to the element (rectangle) in the mini map representing the image */
  @ViewChild('image')
  image!:  ElementRef<HTMLDivElement>;

  /** reference to the element (rectangle) in the mini map representing the screen */
  @ViewChild('screen')
  screen!: ElementRef<HTMLDivElement>;

  /** dragging in progress flag */
  private isDragging = false;
  /** coordinates of the current drag origin / last drag destination */
  private origin?: Vector;
  /** offset of screen rectangle */
  private offset = new Vector(0, 0);
  /** screen orientation */
  private orientation?: 'landscape' | 'portrait';
  /** original screen dimensions (viewport of image display component) */
  private screenDim?: Vector;
  /** original image dimensions (intrinsic width/height) */
  private imageDim?: Vector;
  /** dimensions of the screen rectangle in the minimap */
  private screenRect?: Vector;
  /** dimensions of the image rectangle in the minimap */
  private imageRect?: Vector;

  /** reference to the image the mini map is displayed for */
  @Input()
  imgRef!: HTMLImageElement;

  ngAfterViewInit(): void {

    this.imgRef.onload = () => {
      this.setup();
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
    const delta = xy.subtract(this.origin!); // distance of move (xy) to where i clicked (origin)
    this.origin = xy; // update origin

    // constrain the movement to the bounds of the image
    const min = new Vector(0, 0);
    const max = this.imageRect!.subtract(this.screenRect!);
    const shifted = this.offset.add(delta);
    const xs = shifted.x < min.x ? min.x : shifted.x > max.x ? max.x : shifted.x;
    const ys = shifted.y < min.y ? min.y : shifted.y > max.y ? max.y : shifted.y;
    this.offset = new Vector(xs, ys);

    // shift the screen rectangle, -1 to account for border
    this.screen.nativeElement.style.transform = `translate(${this.offset.x-1}px, ${this.offset.y-1}px)`;

    const z = this.orientation === 'landscape' ? this.imageRect!.x / (this.imageRect!.x - this.screenRect!.x) : this.imageRect!.y / (this.imageRect!.y - this.screenRect!.y);
    const imageShift = this.offset.multiply(z);
    this.imgRef.style.objectPosition = `${imageShift.x}% ${imageShift.y}%`;
    return false;
  }

  @HostListener('mouseup', ['$event'])
  @HostListener('touchend', ['$event'])
  onMouseUp(event: TouchEvent|MouseEvent) {
    this.isDragging = false;
    return false;
  }

  private setup() {
    this.imageDim = new Vector(this.imgRef.naturalWidth, this.imgRef.naturalHeight);
    this.screenDim = new Vector(this.imgRef.clientWidth, this.imgRef.clientHeight);
    this.orientation = this.screenDim.x < this.screenDim.y ? 'landscape' : 'portrait';

    /** factor by which the original image is scaled to fit the screen (result of `object-fit: cover`). use for zoom when implemented */
    const imgScale = this.orientation === 'landscape' ? this.imageDim.y / this.screenDim.y : this.imageDim.x / this.screenDim.x;

    // normalise the dimensions of the screen to the rectangle representation of the image
    const imgRatio = this.imageDim.x / this.imageDim.y;
    const screenRatio = this.screenDim.x / this.screenDim.y;
    this.imageRect = this.imageDim.divide(Math.max(this.imageDim.x, this.imageDim.y)).multiply(100);
    if (screenRatio > 1 === imgRatio > 1) {
      /** long side of screen over long side of image */
      const norm = Math.max(this.screenDim.x, this.screenDim.y) / Math.max(this.imageRect.x, this.imageRect.y);
      this.screenRect = this.screenDim.divide(norm);
    } else {
      /** long side of screen over short side of image */
      const norm = Math.max(this.screenDim.x, this.screenDim.y) / Math.min(this.imageRect.x, this.imageRect.y);
      this.screenRect = this.screenDim.divide(norm);
    }

    this.image.nativeElement.style.width = `${this.imageRect.x}px`;
    this.image.nativeElement.style.height = `${this.imageRect.y}px`;
    this.screen.nativeElement.style.width = `${this.screenRect.x}px`;
    this.screen.nativeElement.style.height = `${this.screenRect.y}px`;

    // center the screen element, -1 to account for border
    this.offset = this.imageRect.subtract(this.screenRect).divide(2);
    this.screen.nativeElement.style.transform = `translate(${this.offset.x-1}px, ${this.offset.y-1}px)`;

    // set background of mini map to target image
    this.image.nativeElement.style.backgroundImage = `url(${this.imgRef.src})`;
    this.image.nativeElement.style.backgroundSize = 'cover';
  }

}
