// import NextAuth from "next-auth";

// declare module "next-auth" {
//   interface Session {
//     user: {
//       id?: string;
//       name?: string;
//       email?: string;
//       role?: string;
//       [key: string]: any; // For other user properties
//     };
//     apiToken?: string;
//   }
  
//   interface User {
//     id: string;
//     name: string;
//     email: string;
//     role?: string;
//     token?: string; // API token
//     [key: string]: any; // For other user properties
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     id?: string;
//     name?: string;
//     email?: string;
//     role?: string;
//     apiToken?: string; // API token
//     [key: string]: any; // For other properties
//   }
// }