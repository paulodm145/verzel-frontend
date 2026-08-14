export type Role = "CUSTOMER" | "ORGANIZER" | "GATE";

export interface SessionUser {
  id: string;
  name: string;
  role: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}
