import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { distinctUntilChanged, Observable, Subject, Subscription, switchMap, takeUntil } from 'rxjs';
import { DataService, ParcoursService, StateService } from 'src/app/services';
import { SectionText, StackImage } from 'src/app/shared';

const fadeInOutAnimation = trigger('fadeInOut', [
  transition(':enter', [
    style({ bottom: '-33%', opacity: 0 }),
    animate('1s ease-in-out', style({ bottom: '0%', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('1s ease-in-out', style({ opacity: 0 }))
  ])
]);

@Component({
  selector: 'app-stack-fade',
  templateUrl: './stack-fade.component.html',
  styleUrls: ['./stack-fade.component.css'],
  animations: [fadeInOutAnimation]
})
export class StackFadeComponent implements AfterViewInit, OnInit, OnDestroy {

  debug = false;
  imageData: StackImage[] = [];    // urls / meta info for all images of parcours
  totalSize: number = 0;           // total filesize
  images: HTMLImageElement[] = []; // the image preload / display stack
  percent = 0;    // 0...100
  progress = 0;   // 0...1
  fade = 0;       // 0...1
  fetchIndex = 0; // which image in imagesUrls was loaded last?
  stackIndex = 0; // where in the stack are we?
  lastIndex = -1; // n-1 to determin direction
  nImages = 0;    // imageData.length
  glReady = false;
  textReady = true;

  loaders: Subscription[] = new Array(10);

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
    public state: StateService,
    private cd: ChangeDetectorRef,
    private parcoursService: ParcoursService,
  ) {
    this.cd.detach();
    for (let i = 0; i < 10; i++) {
      const img = new Image();
      // img.addEventListener('load', (ev: Event) => console.log('loaded an image', ev));
      this.images.push(img);
    }
  }

  ngOnInit(): void {
    this.dataService.getWalkText(1).subscribe(text => {
      this.text = text;
      this.textReady = true;
    });
    this.state.debugView.subscribe(state => {
      this.debug = state;
      this.cd.detectChanges();
    });
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

      this.initTracking();
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
    this.parcoursService.progress.pipe(
      takeUntil(this.destroy),
      distinctUntilChanged()
    ).subscribe(progress => {
      this.progress = progress;

      if (!this.glReady) {
        const initIndex = Math.floor((this.progress * this.nImages) - (this.images.length / 2));
        // preload images
        let preloaded = 0;
        for (let i = 0; i < this.preLoadCount; i++) {
          let fi = i + initIndex;
          if (fi < 0) fi = 0;
          if (fi >= this.nImages-1) fi = this.nImages-1;
          this.loaders[fi] = this.loadImage(i, this.imageData[fi].object_name).subscribe(complete => {
            preloaded++;
            if (preloaded === this.preLoadCount) {
              // debug view for preloaded images
              for (let i of this.images) {
                document.getElementById('dbgimg')?.appendChild(i)
              }
              // update data binding
              this.cd.detectChanges();
              // initialise WebGL context
              this.initContext();
            }
          });
          this.fetchIndex = fi;
        }
      }


      // select text based on progress
      const p = Math.floor(progress * 100);
      if (p !== this.percent || !this.textReady) {
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
          const offset = dir === 1 ? 4 : -5; // forward current i + 4, bw current i - 5
          // this.fetchIndex = this.stackIndex + (dir * this.preLoadCount); // forward = stackIndex+preLoadCount (load at end of loadstack), backward = stackIndex (load at beginning of loadstack)
          this.fetchIndex = this.stackIndex + offset;
          if (this.fetchIndex < 0) this.fetchIndex = 0;
          if (this.fetchIndex >= this.nImages-1) this.fetchIndex = this.nImages-1;
          this.lastIndex = this.stackIndex;
          // console.log('new stackIndex, fetchIndex', this.stackIndex, this.fetchIndex, pos_1, pos_2, load)
          // console.log('object_name', this.imageData[this.fetchIndex].object_name)
          // when walking backwards, load index needs to be offset by one (or it will load the image into next backward, which is one less)
          const loadIndex = (load + (dir ? 0:1)) % 10;
          // console.log('loadIndex', this.loaders[loadIndex] ? this.loaders[loadIndex].closed : 'empty');
          if (this.loaders[loadIndex] && !this.loaders[loadIndex].closed) {
            // console.log('cancelling', loadIndex)
            this.loaders[loadIndex].unsubscribe();
            this.loaders[loadIndex] = this.loadImage(loadIndex, this.imageData[this.fetchIndex].object_name).subscribe(x => {
              // force texture refresh when image resources is done loading
              // this doesn't work predictably, the loadTexture call should be
              // run on the currently displayed frame (and the next one), not on the index 9
              // this.loadTexture(0, this.images[pos_1]);
              // this.loadTexture(1, this.images[pos_2]);
              // if (x === (this.stackIndex + 4) % 10) this.loadTexture(0, this.images[pos_1]);
              // if (x === (this.stackIndex + 5) % 10) this.loadTexture(1, this.images[pos_2]);
            });
          } else {
            this.loaders[loadIndex] = this.loadImage(loadIndex, this.imageData[this.fetchIndex].object_name).subscribe();
          }
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
