import { z } from 'zod';

export const registerUserDTO = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const loginUserDTO = z.object({
    // there might be email or username
    usernameOrEmail: z.string().min(3, "Username or Email must be at least 3 characters"),
//   email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters")
});