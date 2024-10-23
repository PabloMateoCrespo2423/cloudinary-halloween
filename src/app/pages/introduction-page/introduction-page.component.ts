import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
} from '@angular/core';
import { CldImageComponent } from '../../cld-image/cld-image.component';
import { Cloudinary, CloudinaryImage } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { CloudinaryModule, placeholder } from '@cloudinary/ng';
import { brightness, contrast } from '@cloudinary/url-gen/actions/adjust';
import { blackwhite, Effect } from '@cloudinary/url-gen/actions/effect';
import { environments } from '../../environment/environment';
import { Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-introduction-page',
  standalone: true,
  imports: [CommonModule, CldImageComponent, CloudinaryModule,RouterModule],
  templateUrl: './introduction-page.component.html',
  styleUrl: './introduction-page.component.scss',
})
export class IntroductionPageComponent {
  private router = inject(Router)
  imgUrl!: string;
  isBrowser: boolean = false;
  isBlackAndWhite: boolean = false;
  img!: CloudinaryImage;
  cloudName = environments.CLOUD_NAME;
  i = 5;
  imgUrlPlaceHolder!:string

  constructor(private cdr: ChangeDetectorRef) {
    this.isBrowser = typeof window !== 'undefined'; // Verifica si `window` está disponible
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.imgUrlPlaceHolder = 'https://res.cloudinary.com/dxqb4pyxs/image/upload/f_auto,q_auto/v1/appcloud/placeholder'
      this.updateImageForScreenSize();
      this.transformBackWhite(); // Llama al método cuando se redimensiona la ventana
    }
  }

  // Escuchar el evento de redimensionamiento de la ventana
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.i = 5;
    this.updateImageForScreenSize();
    this.transformBackWhite(); // Llama al método cuando se redimensiona la ventana
  }

  // Método para actualizar la imagen según el tamaño de la pantalla
  updateImageForScreenSize() {
    const screenWidth = window.innerWidth;

    const cld = new Cloudinary({
      cloud: {
        cloudName: this.cloudName,
      },
    });

    this.img = cld.image('appcloud/background');
    // Verificar el tamaño de la pantalla y ajustar la imagen
    if (screenWidth <= 768) {
      // Para móviles - aún más pequeño
      this.img = this.img.resize(fill().width(400).height(600)); // Ajusta a 400x600
    } else {
      // Para pantallas más grandes - aún más pequeño
      this.img = this.img.resize(fill().width(640).height(628)); // Ajusta a 1024x576
    }

    // Aplicar efectos
    this.img
      .effect(Effect.blur(20)) // Desenfoque
      .adjust(brightness().level(20)) // Aumentar brillo
      .adjust(contrast().level(30)) // Ajustar contraste
      .effect(Effect.grayscale()); // Escala de grises (opcional)

    // Generar la URL de la imagen
    this.imgUrl = this.img.toURL();
  }

  transformBackWhite() {
    const updateImage = () => {
      if (this.i <= 10) {
        // Crear una nueva instancia de la imagen en cada ciclo
        const cld = new Cloudinary({
          cloud: {
            cloudName: 'dxqb4pyxs',
          },
        });

        // Recrear la imagen para forzar la actualización visual
        const imgClone = cld.image('appcloud/background');

        // Aplicar el efecto con el threshold actual
        imgClone.effect(blackwhite().threshold(this.i));

        // Generar la URL de la imagen y actualizar el imgUrl
        this.imgUrl = imgClone.toURL();

        console.log(`Threshold aplicado: ${this.i}`);

        // Incrementar el valor del threshold para la siguiente iteración
        this.i++;

        // Llamar a la función nuevamente después de 2 segundos
        setTimeout(updateImage, 2000);
      } else {
        console.log('Proceso completado');
      }
    };

    // Iniciar el ciclo de cambios de la imagen
    updateImage();
  }

  navigateToRegister(){
    this.playAudio()
    this.router.navigate(['/exorcism']);
  }

  playAudio(){
    let audio = new Audio()
    audio.src = '../assets/audio/sound.mp3'
    audio.loop=true
    audio.load()
    audio.play()

  }
}
