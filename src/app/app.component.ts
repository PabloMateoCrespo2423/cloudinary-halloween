import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
// Import the CloudinaryModule.
import {CloudinaryModule} from '@cloudinary/ng';

// Import the Cloudinary classes.
import {Cloudinary, CloudinaryImage} from '@cloudinary/url-gen';
import {fill} from "@cloudinary/url-gen/actions/resize";
import { UploadWidgetComponent } from './upload-widget/upload-widget.component';
import { IntroductionPageComponent } from "./pages/introduction-page/introduction-page.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, CloudinaryModule, UploadWidgetComponent, IntroductionPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Angular Quick Start';
  img!: CloudinaryImage;

  ngOnInit() {

    // Create a Cloudinary instance and set your cloud name.
    const cld = new Cloudinary({
      cloud: {
        cloudName: 'dxqb4pyxs'
      }
    });

        // Instantiate a CloudinaryImage object for the image with the public ID, 'docs/models'.
        this.img = cld.image('docs/models');

        // Resize to 250 x 250 pixels using the 'fill' crop mode.
        this.img.resize(fill().width(250).height(250));
  }


  initButton(){
    
  }
}
