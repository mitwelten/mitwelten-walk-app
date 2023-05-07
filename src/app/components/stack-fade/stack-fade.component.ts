import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { distinctUntilChanged, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { DataService, SectionText, StackImage, TrackProgressService } from 'src/app/shared';

@Component({
  selector: 'app-stack-fade',
  templateUrl: './stack-fade.component.html',
  styleUrls: ['./stack-fade.component.css']
})
export class StackFadeComponent implements AfterViewInit, OnInit, OnDestroy {

  imageData: StackImage[] = [];
  totalSize: number = 0;
  images: HTMLImageElement[] = [];
  percent = 0;    // 0...100
  progress = 0;   // 0...1
  fade = 0;       // 0...1
  fetchIndex = 0; // which image in imagesUrls was loaded last?
  stackIndex = 0; // where in the stack are we?
  lastIndex = -1; // n-1 to determin direction
  nImages = 0;
  glReady = false;

  text: SectionText[] = [];
  textDisplay: SectionText | null = null;

  @ViewChild('stack', {static: true})
  stack?: ElementRef<HTMLCanvasElement>;

  private preLoadCount = 10;
  private gl?: WebGLRenderingContext;
  private textures: WebGLTexture[] = [];
  private destroy = new Subject();

  constructor(
    private ngZone: NgZone,
    private dataService: DataService,
    private cd: ChangeDetectorRef,
    private trackProgress: TrackProgressService,
  ) {
    this.cd.detach();
    for (let i = 0; i < 10; i++) {
      const img = new Image();
      // img.addEventListener('load', (ev: Event) => console.log('loaded an image', ev));
      this.images.push(img);
    }
  }

  ngOnInit(): void {
    this.dataService.getWalkText(1).subscribe(text => this.text = text);
  }

  ngAfterViewInit(): void {
    /* ideal startup procedure:
    - attach to tracking
    - when position is known (any), preload images
    - initialize gl context / filter (ok)
    */

    this.dataService.getImageStack().subscribe((list: StackImage[]) => {
      this.imageData = list;
      this.totalSize = list.reduce((a,b) => a + b.file_size, 0)
      this.nImages = this.imageData.length;

      // TODO: do this after initTracking completes!
      // preload images
      for (let i = 0; i < this.preLoadCount; i++) {
        this.loadImage(i, this.imageData[i].object_name).subscribe(complete => {
          if (complete === (this.preLoadCount - 1)) {
            // start tracking progress once images are preloaded
            this.initTracking();
          }
        });
        this.fetchIndex = i;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy.next(null);
    this.destroy.complete();
  }

  // load images
  loadImage(index: number, url: string) {
    return this.dataService.getImageResource(url).pipe(
      switchMap(blob => {
        // TODO: think about when to call URL.revokeObjectURL (+/- 100 images?)
        // onload: one eventlistener, simple override
        // another global one is added once with addEventListener (above)
        return new Observable<number>(observer => {
          const blobUrl = URL.createObjectURL(blob);
          this.images[index].onload = () => {
            URL.revokeObjectURL(blobUrl);
            observer.next(index);
            observer.complete();
          };
          this.images[index].src = blobUrl;
        });
      })
    );
  }

  private initTracking() {
    this.trackProgress.progress.pipe(
      takeUntil(this.destroy),
      distinctUntilChanged()
    ).subscribe(progress => {
      this.progress = progress;

      // initialise WebGL context
      if (!this.glReady) this.initContext();

      // select text based on progress
      const p = Math.floor(progress * 100);
      if (p !== this.percent) {
        this.percent = p;
        const t = this.text.filter((t: SectionText) => t.percent_in <= p && t.percent_out > p);
        if (t.length === 0) {
          if (this.textDisplay !== null) {
            this.textDisplay = null;
          }
        }
        else {
          if (this.textDisplay === null || (this.textDisplay !== null && t[0].text_id !== this.textDisplay.text_id)) {
            this.textDisplay = t[0];
          }
        }
      }
    });
  }

  private initContext() {
    this.glReady = true;
    if (this.stack === undefined) throw new Error('no canvas');

    const gl = this.stack.nativeElement.getContext('webgl');
    if (gl === null) throw new Error('no webgl context');

    // initialise textures
    for (let i = 0; i < 2; i++) {
      const texture = gl.createTexture();
      if (texture) {
        this.textures.push(texture)
        gl.activeTexture(i ? gl.TEXTURE1 : gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      }
      else throw new Error('initialising textures failed');
    }

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, VERTEX_SHADER_SOURCE);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(vertexShader)!)
    };

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, FRAGMENT_SHADER_SOURCE);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(fragmentShader)!)
    };

    const prg = gl.createProgram()!;
    gl.attachShader(prg, vertexShader);
    gl.attachShader(prg, fragmentShader);
    gl.linkProgram(prg);
    if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(prg)!)
    };

    // clip-space vertex coordinates
    // -1/-1 - 1/1
    const x1 = -1;
    const x2 = x1 + 2;
    const y1 = -1;
    const y2 = y1 + 2;
    const vertexCoordinates = new Float32Array([
        x1,y1 , x2,y1 , x1,y2 ,
        x2,y1 , x1,y2 , x2,y2 ,
    ]);

    // texture coordinates are not clip-space coordinates!
    // 0/0 - 1/1
    const textureCoordinates = new Float32Array([
        0,0 , 1,0 , 0,1 ,
        1,0 , 0,1 , 1,1 ,
    ]);

    const vertrexCoordinatesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertrexCoordinatesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexCoordinates, gl.STATIC_DRAW);

    const a_position_loc = gl.getAttribLocation(prg, 'a_position');
    gl.enableVertexAttribArray(a_position_loc);
    gl.vertexAttribPointer(
        a_position_loc,
        2,            // 2 values per vertex shader iteration
        gl.FLOAT,     // data is 32bit floats
        false,        // don't normalize
        0,            // stride (0 = auto)
        0,            // offset into buffer
    );

    const textureCoorinatesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoorinatesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW);

    const a_texture_coordinate_loc = gl.getAttribLocation(prg, 'a_texture_coordinate');
    gl.enableVertexAttribArray(a_texture_coordinate_loc);
    gl.vertexAttribPointer(a_texture_coordinate_loc, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(prg);

    const u_texture_0_location = gl.getUniformLocation(prg, 'u_texture_0');
    const u_texture_1_location = gl.getUniformLocation(prg, 'u_texture_1');
    const u_progress_location = gl.getUniformLocation(prg, 'u_progress');

    gl.uniform1i(u_texture_0_location, 0);
    gl.uniform1i(u_texture_1_location, 1);
    gl.uniform1f(u_progress_location, 0.);

    this.ngZone.runOutsideAngular(() => {
      const filter = new SmoothingFilter(this.progress * this.nImages, 150);
      let frameTime = 0;
      let fade_n1 = 0;
      const render = (time: number) => {
        const absProgress = filter.f(this.progress * this.nImages);
        this.stackIndex = Math.floor(absProgress);
        this.fade = absProgress % 1.;

        const pos_1 = (this.stackIndex + 4) % 10;
        const pos_2 = (this.stackIndex + 5) % 10;
        const load  = (this.stackIndex + 9) % 10;

        // direction change doesn't work if delta is identical
        // jumping (delta > 1) will not work
        // start and end need to be fixed, don't read over the end of this.imageUrls
        if (this.stackIndex !== this.lastIndex && this.imageData.length) {
          const dir = (this.stackIndex - this.lastIndex) > 0 ? 1 : 0; // 1 = forward, 0 = backward
          this.fetchIndex = this.stackIndex + (dir * this.preLoadCount);
          this.lastIndex = this.stackIndex;
          this.loadImage(load, this.imageData[this.fetchIndex].object_name).subscribe();
          this.loadTexture(0, this.images[pos_1]);
          this.loadTexture(1, this.images[pos_2]);
          this.cd.detectChanges();
        } else if ((time - frameTime) > 100) {
          if (this.fade !== fade_n1) {
            this.cd.detectChanges();
            fade_n1 = this.fade;
          }
          frameTime = time;
        }

        gl.uniform1f(u_progress_location, this.fade);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);
    });

    this.gl = gl;
  }

  private loadTexture(index: number, image: HTMLImageElement) {
    if (this.gl === undefined) throw new Error('no gl context');
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[index]);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
  }
}

const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;
attribute vec2 a_texture_coordinate;

varying vec2 v_texture_coordinate;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texture_coordinate = a_texture_coordinate;
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision highp float;

varying vec2 v_texture_coordinate;

uniform sampler2D u_texture_0;
uniform sampler2D u_texture_1;

uniform float u_progress;

void main() {
  gl_FragColor = mix(texture2D(u_texture_0, v_texture_coordinate), texture2D(u_texture_1, v_texture_coordinate), u_progress);
}
`;

class SmoothingFilter {

  /** history buffer */
  private hh: number[] = [];
  /** impulse response */
  private ir: number[] = [];

  /**
   * Smooth signal with a half cosine impulse response
   * @param initial start value, i.e. initial progress
   * @param l lenght of filter
   */
  constructor(initial: number = 0, private l: number = 100) {
    for (var i=0; i<this.l; i++) {
      this.hh.push(initial);
      this.ir.push(Math.cos((i / this.l * Math.PI * 2) + Math.PI) * 0.5 + 0.5)
    }
    const sum = this.ir.reduce((m,n) => m+n, 0);
    this.ir = this.ir.map(v => v / sum);
  }

  /** filter function */
  f(x: number) {
    this.hh.unshift(x);
    this.hh.pop();
    return this.hh.reduce((a,b,i) => (b * this.ir[i]) + a, 0);
  }

  reset(initial: number = 0) {
    this.hh.fill(initial);
  }

}
