import { User } from "@prisma/client";
import express from "express";


// declare module 'express'{
//     export interface Request {
//         user?: User
//     }
// }


declare global {
    namespace Express {
      interface Request {
        user?: User & {
          role?: {
            name: string;
          };
        }; // Add this line to declare the user property
      }
    }
  }
  
