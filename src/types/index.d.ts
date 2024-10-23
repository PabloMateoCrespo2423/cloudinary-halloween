export {};

declare global {
  interface Window {
    Echo: any;
    google: any; 
    cloudinary:any;// o más específico, si conoces la estructura
  }
}