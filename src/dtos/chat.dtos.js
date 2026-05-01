import { z } from 'zod';

export const createGroupDTO = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
  members: z.array(z.string()).min(1, "At least one member required")
});

export const createContactDTO = z.object({
  name: z.string().min(1),
  email: z.string().email()
});