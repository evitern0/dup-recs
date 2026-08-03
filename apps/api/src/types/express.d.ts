declare namespace Express {
  interface User {
    id: string;
    email: string;
    username: string;
    passwordHash?: string;
  }

  interface Request {
    requestId?: string;
  }
}
