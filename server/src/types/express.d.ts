declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: bigint;
        role: string;
        employeeId?: bigint | null;
        mustChangePassword: boolean;
      };
    }
  }
}

export {};
