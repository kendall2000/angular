import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class CapturedImagesService {
    public capturedImages: string[] = [];

    constructor() { }

    addImage(image: string) {
        this.capturedImages.push(image);
    }

    getImages(): string[] {
        return this.capturedImages;
    }

}
