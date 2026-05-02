// import { z } from 'zod';

// export const createGroupDTO = z.object({
//   name: z.string().min(1, "Group name is required"),
//   description: z.string().optional(),
//   members: z.array(z.string()).min(1, "At least one member required")
// });

// export const createContactDTO = z.object({
//   name: z.string().min(1),
//   email: z.string().email()
// });

import { z } from 'zod';

// members can come as a single string or array from FormData
const membersSchema = z.union([
  z.string().min(1),
  z.array(z.string().min(1)).min(1, 'At least one member required'),
]);

export const createGroupDTO = z.object({
  name:        z.string().min(1, 'Group name is required'),
  description: z.string().optional(),
  members:     membersSchema,
});

// name removed — backend fetches it from DB via email lookup
export const createContactDTO = z.object({
  email: z.string().email('Invalid email format'),
});