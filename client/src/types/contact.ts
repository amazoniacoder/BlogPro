export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;

  message: string;
  createdAt: Date | string | null;
}

export interface InsertContact {
  firstName: string;
  lastName: string;
  email: string;

  message: string;
}
