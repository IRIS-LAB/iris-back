/// <reference types="express" />
declare namespace Express {

  export interface Request {
    __iris?: {
      maxSize?: number
      defaultSize?: number
    }
  }
}

