import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CapturedImagesService } from '../captured-images.service';


@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent implements AfterViewInit {
  @ViewChild('video', { static: false }) video!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
  videoDevices: MediaDeviceInfo[] = [];
  capturedImages: string[] = [];
  selectedDeviceId: string = '';
  errorMessage: string = '';
  resolution = { width: 640, height: 480 };
  isLoading = false;
  uploadError: string = '';
  SelectJson: any[] = [];

  constructor(private capturedImagesService: CapturedImagesService) {}

  ngAfterViewInit() {
    this.initCamera();
  }

  async initCamera() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.videoDevices = devices.filter(device => device.kind === 'videoinput');

      if (this.videoDevices.length > 0) {
        this.selectedDeviceId = this.videoDevices[0].deviceId;
        this.startCamera();
      } else {
        this.errorMessage = 'No video devices found.';
      }
    } catch (err) {
      this.errorMessage = 'Error accessing media devices.';
      console.error('Error accessing media devices.', err);
    }
  }

  async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: this.selectedDeviceId ? { exact: this.selectedDeviceId } : undefined,
          width: this.resolution.width,
          height: this.resolution.height
        }
      });
      this.video.nativeElement.srcObject = stream;
      this.errorMessage = '';
    } catch (err) {
      this.errorMessage = 'Error starting camera.';
      console.error('Error starting camera.', err);
    }
  }

  onDeviceChange(event: any) {
    this.selectedDeviceId = event.target.value;
    this.startCamera();
  }

  async captureImage() {
    const context = this.canvas.nativeElement.getContext('2d');
    context!.drawImage(this.video.nativeElement, 0, 0, this.resolution.width, this.resolution.height);
    const imageData = this.canvas.nativeElement.toDataURL('image/png');
    this.capturedImagesService.addImage(imageData);

    // Extraer la parte base64 del Data URL
    const base64Image = imageData.split(',')[1]; // Parte después de 'data:image/png;base64,'
    const mimeType = 'image/png';

    // Convertir base64 a Blob
    const imageBlob = this.base64ToBlob(base64Image, mimeType);

    console.log('Captured Image (Blob):', { image: imageBlob });

    // Iniciar el proceso de carga y mostrar el loader
    this.isLoading = true;
    this.uploadError = '';

    try {
      const url= await this.uploadImage({ image: imageBlob });
    } catch (error) {
      this.uploadError = 'Error al subir la imagen';
      console.error('Error al subir la imagen:', error);
    } finally {
      this.isLoading = false;
    }




  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  private async uploadImage(imageData: { image: Blob }): Promise<any> {
    // Crea una instancia de FormData
    const formData = new FormData();

    // Añade el Blob al FormData
    formData.append('image', imageData.image, 'image.png'); // El tercer parámetro es el nombre del archivo

    try {
      // Envía la solicitud con el FormData
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData, // No necesitas establecer Content-Type ya que FormData lo hace automáticamente
      });

      // Verifica si la respuesta es exitosa
      if (response.ok) {
        console.log('data aqui')
        const responseData = await response.json();
       const DataJson= await this.sendUrl(responseData)
        await  this.sendJson(DataJson)
        return DataJson; // Devuelve la respuesta parseada como JSON si es necesario
      } else {
        const errorData = await response.text(); // O usa .text() para obtener el cuerpo del error
        throw new Error(`Error al subir la imagen: ${errorData}`);
      }
    } catch (error) {
      console.error('Error:', error);
      throw error; // Vuelve a lanzar el error para manejarlo en un nivel superior
    }
  }


  private async sendUrl({ url }: { url: string } ): Promise<any> {

    //let newUrl = {image_url:url}
    //console.log(newUrl)
    try {
      const response = await fetch('http://172.29.99.28:5000/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Establece el tipo de contenido como JSON
        },
        body: JSON.stringify({ image_url:url }), // Convierte el objeto a una cadena JSON
      });

      // Verifica si la respuesta es exitosa
      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData)
        this.SelectJson.push(responseData)

        return responseData;
      } else {
        const errorData = await response.text(); // O usa .text() para obtener el cuerpo del error
        throw new Error(`Error al enviar la URL: ${errorData}`);
      }
    } catch (error) {
      console.error('Error:', error);
      throw error; // Vuelve a lanzar el error para manejarlo en un nivel superior
    }
  }


  private async sendJson( json : any): Promise<any> {

    //let newUrl = {image_url:url}
    let newU
    console.log(json)
    try {
      const response = await fetch('http://localhost:5034/api/v1/Articles/create-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Establece el tipo de contenido como JSON
        },
        body: JSON.stringify(json), // Convierte el objeto a una cadena JSON
      });

      // Verifica si la respuesta es exitosa
      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData)
        return responseData;
      } else {
        const errorData = await response.text(); // O usa .text() para obtener el cuerpo del error
        throw new Error(`Error al enviar la URL: ${errorData}`);
      }
    } catch (error) {
      console.error('Error:', error);
      throw error; // Vuelve a lanzar el error para manejarlo en un nivel superior
    }
  }


}
