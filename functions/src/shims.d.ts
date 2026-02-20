declare module 'firebase-admin' {
  const admin: any;
  export = admin;
}

declare module 'firebase-functions/v2/firestore' {
  export const onDocumentWritten: any;
}

declare module 'firebase-functions/v2/storage' {
  export const onObjectFinalized: any;
}

declare module 'firebase-functions/v2/https' {
  export const onCall: any;
  export class HttpsError extends Error {
    constructor(code: string, message: string);
  }
}

declare module 'pdf-parse' {
  const pdfParse: any;
  export default pdfParse;
}
