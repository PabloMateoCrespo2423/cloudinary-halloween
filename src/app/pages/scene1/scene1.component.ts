import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  ViewChild,
} from '@angular/core';
import { Cloudinary, CloudinaryImage } from '@cloudinary/url-gen';
import { environments } from '../../environment/environment';
import { fill } from '@cloudinary/url-gen/actions/resize';
import {
  brightness,
  contrast,
  improve,
} from '@cloudinary/url-gen/actions/adjust';
import { CloudinaryModule } from '@cloudinary/ng';
import { VisionService } from '../../shared/services/vision.service';
import { compass } from '@cloudinary/url-gen/qualifiers/gravity';
import { Effect } from '@cloudinary/url-gen/actions';
import { name } from '@cloudinary/url-gen/actions/namedTransformation';
import { blackwhite } from '@cloudinary/url-gen/actions/effect';

@Component({
  selector: 'app-scene1',
  standalone: true,
  imports: [CommonModule, CloudinaryModule],
  templateUrl: './scene1.component.html',
  styleUrl: './scene1.component.scss',
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Scene1Component {
  //private router = inject(Router)
  private visionService = inject(VisionService);
  imgUrlPlaceHolder!: string;
  isBrowser: boolean = false;
  isBlackAndWhite: boolean = false;
  img!: CloudinaryImage;
  cloudName = environments.CLOUD_NAME;
  imgUrl!: string;
  cld!: Cloudinary;
  @ViewChild('container') container!: ElementRef;
  showModal: boolean = true; // Mostrar modal por defecto
  // Propiedad para almacenar los objetos detectados
  detectedObjects: any[] = [];

  // Propiedad para las zonas interactivas
  interactiveZones: any[] = [];

  closeModal(event?: MouseEvent) {
    // Cierra el modal si se hace clic en el botón o fuera del modal
    if (!event || event.target === event.currentTarget) {
      this.showModal = false;
    }
  }

  constructor() {
    this.isBrowser = typeof window !== 'undefined'; // Verifica si `window` está disponible
  }

  // Escuchar el evento de redimensionamiento de la ventana
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.containerWidth = window.innerWidth; // Actualiza el ancho del contenedor
    this.containerHeight = window.innerHeight; // Actualiza la altura del contenedor
    this.updateImageForScreenSize();
    //  this.transformBackWhite(); // Llama al método cuando se redimensiona la ventana
  }

  imageWidth = 1368; // Ancho original de la imagen
  imageHeight = 768; // Alto original de la imagen
  containerWidth = 0; // Ancho del contenedor
  containerHeight = 0; // Alto del contenedor
  width = 0;
  height = 0;
  ngOnInit() {
    if (this.isBrowser) {
      this.containerWidth = window.innerWidth; // Ancho de la ventana
      this.containerHeight = window.innerHeight; // Alto de la ventana
      this.cld = new Cloudinary({
        cloud: {
          cloudName: 'dxqb4pyxs',
        },
      });
      this.imgUrlPlaceHolder =
        'https://res.cloudinary.com/dxqb4pyxs/image/upload/f_auto,q_auto/v1/appcloud/placeholder';
      this.updateImageForScreenSize();
      //  this.transformBackWhite(); // Llama al método cuando se redimensiona la ventana
    }
  }



  // Método para actualizar la imagen según el tamaño de la pantalla y detectar objetos
  updateImageForScreenSize() {
    // Configura la imagen
    this.img = this.cld.image('appcloud/bauf3gbi7f8pz6d9cmnp');

    // Obtén el tamaño actual de la ventana
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Ajusta la imagen con un enfoque en la gravedad
    this.img
      .resize(
        fill() // O usa fit() si no quieres recortar
          .width(this.width) // Redimensiona según el ancho de la ventana
          .height(this.height) // Redimensiona según el alto de la ventana
          .gravity(compass('north_east')) // Ajusta el enfoque a la esquina superior derecha
      )
      .adjust(brightness().level(50)) // Aumenta el brillo
      .adjust(contrast().level(-20)) // Disminuye el contraste
      .adjust(improve().mode('outdoor').blend(100)); // Mejora la imagen

    // Generar la URL de la imagen
    this.imgUrl = this.img.toURL();

    // Detectar objetos en la imagen
    this.detectObjects(this.imgUrl);
  }

  detectObjects(imageUrl: string) {
    this.visionService.detectObjects(this.imgUrl).subscribe((result) => {
      // this.detectedObjects = result.objects; // Usa result.objects para obtener los objetos
      //  console.log(result);
      this.detectedObjects = result.objects;
      this.createInteractiveZones();
    });
    //   const response = await this.http.get(`/detect-objects?url=${encodeURIComponent(imageUrl)}`).toPromise();
  }

  createInteractiveZones() {
    this.interactiveZones = this.detectedObjects.map((object) => {
      const boundingBox = object.boundingPoly;
      return {
        name: object.name,
        position: this.calculatePosition(boundingBox),
        action: this.getActionForObject(object.name),
      };
    });
  }

  getBackgroundImageSize(): { width: number; height: number } {
    const container = this.container.nativeElement as HTMLElement; // Accede al contenedor a través de ViewChild
    const computedStyle = window.getComputedStyle(container);
    const backgroundSize = computedStyle
      .getPropertyValue('background-size')
      .split(' ');

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const imageAspectRatio = this.imageWidth / this.imageHeight;
    let bgWidth, bgHeight;

    // Calcula la proporción del contenedor
    const containerAspectRatio = containerWidth / containerHeight;

    if (backgroundSize[0] === 'cover') {
      // Para 'cover', ajusta el tamaño para llenar el contenedor manteniendo la proporción
      if (containerAspectRatio > imageAspectRatio) {
        bgWidth = containerWidth;
        bgHeight = containerWidth / imageAspectRatio;
      } else {
        bgHeight = containerHeight;
        bgWidth = containerHeight * imageAspectRatio;
      }
    } else if (backgroundSize[0] === 'contain') {
      // Para 'contain', ajusta el tamaño para caber dentro del contenedor manteniendo la proporción
      if (containerAspectRatio < imageAspectRatio) {
        bgWidth = containerWidth;
        bgHeight = containerWidth / imageAspectRatio;
      } else {
        bgHeight = containerHeight;
        bgWidth = containerHeight * imageAspectRatio;
      }
    } else {
      // Si se especifican tamaños específicos o valores de fondo no válidos
      bgWidth = parseFloat(backgroundSize[0]) || containerWidth; // Toma el valor especificado o el ancho del contenedor
      bgHeight = parseFloat(backgroundSize[1]) || containerHeight; // Toma el valor especificado o la altura del contenedor

      // Asegúrate de que las dimensiones se ajusten a la proporción de la imagen
      const specifiedAspectRatio = bgWidth / bgHeight;
      if (specifiedAspectRatio !== imageAspectRatio) {
        if (specifiedAspectRatio > imageAspectRatio) {
          bgHeight = bgWidth / imageAspectRatio; // Ajustar altura para mantener la proporción
        } else {
          bgWidth = bgHeight * imageAspectRatio; // Ajustar ancho para mantener la proporción
        }
      }
    }

    return { width: bgWidth, height: bgHeight };
  }

  calculatePosition(boundingPoly: any) {
    const backgroundSize = this.getBackgroundImageSize();
    const imageWidth = backgroundSize.width;
    const imageHeight = backgroundSize.height;

    const containerWidth = this.container.nativeElement.clientWidth;
    const containerHeight = this.container.nativeElement.clientHeight;

    // Calcular las proporciones de escala
    const scaleX = containerWidth / imageWidth;
    const scaleY = containerHeight / imageHeight;

    // Utiliza la escala más pequeña para evitar deformación
    const scale = Math.min(scaleX, scaleY);

    // Ajustar el offset según la proporción del contenedor y la imagen
    const offsetX = (containerWidth - imageWidth * scale) / 2;
    const offsetY = (containerHeight - imageHeight * scale) / 2;

    // Calcula los valores mínimos y máximos de las coordenadas (normalizados entre 0 y 1)
    const xMin = Math.min(
      ...boundingPoly.map((point: any) => point.x * imageWidth)
    );
    const yMin = Math.min(
      ...boundingPoly.map((point: any) => point.y * imageHeight)
    );
    const xMax = Math.max(
      ...boundingPoly.map((point: any) => point.x * imageWidth)
    );
    const yMax = Math.max(
      ...boundingPoly.map((point: any) => point.y * imageHeight)
    );

    // Ajustar los valores finales con un escalado y los offsets
    const finalTop = yMin * scale + offsetY;
    const finalLeft = xMin * scale + offsetX;
    const finalWidth = (xMax - xMin) * scale;
    const finalHeight = (yMax - yMin) * scale;

    // Asegúrate de no retornar valores negativos o fuera de límites
    return {
      top: Math.max(0, finalTop) + 'px',
      left: Math.max(0, finalLeft) + 'px',
      width: Math.max(0, finalWidth) + 'px',
      height: Math.max(0, finalHeight) + 'px',
    };
  }

  getActionForObject(objectName: string) {
    return () => {
      switch (objectName) {
        case 'Lighting':
          // Acción para la lámpara
          this.lampZone();
          break;

        case 'Lamp':
          // Acción para la lámpara
          this.lampZone();
          break;
        case 'Window':
          // Acción para la ventana
          this.windowZone();
          break;
        case 'Person':
          // Acción para la ventana
          this.girlZone();
          break;
        case 'Bed':
          // Acción para la ventana
          this.girlZone();
          break;
        case 'Picture frame':
          // Acción para la ventana
          this.boxZone();
          break;
        case 'Nightstand':
          // Acción para la ventana
          this.stand();
          break;
        // Agrega más casos según los objetos que tengas
        default:
          break;
      }
    };
  }

  effectDefault() {}

  playAudio(){
    let audio = new Audio()
    audio.src = '../assets/audio/susurro.mp3'
    audio.load()
    audio.play()
  }

  stand() {
    this.img = this.cld.image('appcloud/cahk90dgnpvzhllvgl9s');
    this.img
      .resize(
        fill() // O usa fit() si no quieres recortar
          .width(this.width) // Redimensiona según el ancho de la ventana
          .height(this.height) // Redimensiona según el alto de la ventana
          .gravity(compass('north_east')) // Ajusta el enfoque a la esquina superior derecha
      )
      .effect(Effect.blackwhite().threshold(50)) // Disminuir el desenfoque para que no esté tan difusa
      .adjust(brightness().level(80)) // Ajustar brillo
      .adjust(contrast().level(40));

    this.imgUrl = this.img.toURL();
    setTimeout(() => {
      this.changeBlackWhite(60)
    }, 700);
  }

  transform(): string {
    const transforms = [
      'girl1',
      'desapear',
      'monja',
      'diferent',
      'deform',
      'happy',
      'bulging',
      'black',
      'teeth',
      'mouth',
    ];
    const randomIndex = Math.floor(Math.random() * transforms.length);
    return transforms[randomIndex];
  }

  lampZone() {
    this.playAudio()
    this.img = this.cld.image('appcloud/svic6ooh7ufxpwnoa1xh');
    // Ajusta la imagen con un enfoque en la gravedad
    this.img
      .resize(
        fill() // O usa fit() si no quieres recortar
          .width(this.width) // Redimensiona según el ancho de la ventana
          .height(this.height) // Redimensiona según el alto de la ventana
          .gravity(compass('north_east')) // Ajusta el enfoque a la esquina superior derecha
      )
      .effect(Effect.blackwhite().threshold(10)) // Disminuir el desenfoque para que no esté tan difusa
      .adjust(brightness().level(80)) // Ajustar brillo
      .adjust(contrast().level(40));

    // Aumentar el contraste para que resalte más // Escala de grises leve para un toque oscuro

    this.imgUrl = this.img.toURL();

    setTimeout(() => {
      this.img = this.cld
        .image('appcloud/bauf3gbi7f8pz6d9cmnp')
        .namedTransformation(name(this.transform()));

      // Aplicar efectos
      this.img
        .resize(
          fill() // O usa fit() si no quieres recortar
            .width(this.width) // Redimensiona según el ancho de la ventana
            .height(this.height) // Redimensiona según el alto de la ventana
            .gravity(compass('north_east')) // Ajusta el enfoque a la esquina superior derecha
        )
        .adjust(brightness().level(50)) // Aumenta el brillo
        .adjust(contrast().level(-20)) // Disminuye el contraste
        .adjust(improve().mode('outdoor').blend(100)); // Mejora la imagen
      // Aumentar el contraste para que resalte más // Escala de grises leve para un toque oscuro
      this.imgUrl = this.img.toURL();
    }, 500);
  }

  girlZone() {
    this.img = this.cld.image('appcloud/orxvljuahx6jc8otkgrx.jpg');

    // Aplicar efectos
    this.img

      .effect(Effect.blackwhite().threshold(30)) // Disminuir el desenfoque para que no esté tan difusa
      .adjust(brightness().level(15)) // Ajustar brillo
      .adjust(contrast().level(40)); // Aumentar el contraste para que resalte más// Escala de grises leve para un toque oscuro

    this.imgUrl = this.img.toURL();

    setTimeout(() => {
      this.changeBlackWhite(50);
    }, 700);
  }

  changeBlackWhite(num: number) {
    this.img = this.cld.image('appcloud/bauf3gbi7f8pz6d9cmnp');

    // Aplicar efectos
    this.img
      .resize(
        fill() // O usa fit() si no quieres recortar
          .width(this.width) // Redimensiona según el ancho de la ventana
          .height(this.height) // Redimensiona según el alto de la ventana
          .gravity(compass('north_east')) // Ajusta el enfoque a la esquina superior derecha
      )
      .effect(blackwhite().threshold(num));
    // Aumentar el contraste para que resalte más // Escala de grises leve para un toque oscuro
    this.imgUrl = this.img.toURL();
  }

  windowZone() {
    this.img = this.cld
      .image('appcloud/bauf3gbi7f8pz6d9cmnp')
      .namedTransformation(name('scene1cruz'));

    this.img
      .effect(Effect.blackwhite().threshold(60)) // Disminuir el desenfoque para que no esté tan difusa
      .adjust(brightness().level(15)) // Ajustar brillo
      .adjust(contrast().level(40)); // Aumentar el contraste para que resalte más// Escala de grises leve para un toque oscuro

    this.imgUrl = this.img.toURL();

    setTimeout(() => {
      this.changeBlackWhite(30);
    }, 700);
  }

  boxZone() {
    this.img = this.cld
      .image('appcloud/bauf3gbi7f8pz6d9cmnp')
      .namedTransformation(name('ritual'));

    this.img
      .effect(Effect.blackwhite().threshold(40)) // Disminuir el desenfoque para que no esté tan difusa
      .adjust(brightness().level(15)) // Ajustar brillo
      .adjust(contrast().level(40)); // Aumentar el contraste para que resalte más// Escala de grises leve para un toque oscuro

    this.imgUrl = this.img.toURL();

    setTimeout(() => {
      this.changeBlackWhite(40);
    }, 700);
  }
}
