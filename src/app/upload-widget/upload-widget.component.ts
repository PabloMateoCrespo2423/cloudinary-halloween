import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { environments } from '../environment/environment';
import { ScriptService } from '../shared/services/script.service';

@Component({
  selector: 'app-upload-widget',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './upload-widget.component.html',
  styleUrl: './upload-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadWidgetComponent implements OnInit{
  uploadedImage = '';
  isDisabled = false;
  uploadedImages: string[] = [];
  cloudName = environments.CLOUD_NAME;
  //uploadPreset = environments.UPLOAD_PRESET;

  constructor(private scriptService: ScriptService) {
   
  }
  ngOnInit(): void {
    this.scriptService.load('uw').then(() => {
      console.log('Cloudinary Upload Widget script loaded.');
    }).catch((error) => {
      console.error('Script loading error:', error);
    });
  }

  processResults = (error: any, result: any): void => {
    if (result.event === 'close') {
      this.isDisabled = false;
    }
    if (result && result.event === 'success') {
      const secureUrl = result.info.secure_url;
      const previewUrl = secureUrl.replace('/upload/', '/upload/w_400/');
      this.uploadedImages.push(previewUrl);
      this.isDisabled = false;
    }
    if (error) {
      this.isDisabled = false;
    }
  };

  

  uploadWidget = (): void => {
    this.isDisabled = true;
    window.cloudinary.openUploadWidget(
      {
        cloudName: this.cloudName,
    //    uploadPreset: this.uploadPreset,
        sources: ['local', 'url'],
        tags: ['myphotoalbum-angular'],
        clientAllowedFormats: ['image'],
        resourceType: 'image',
      },
      this.processResults
    );
  };
 }
