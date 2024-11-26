import { z } from "zod";

const socialLinkSchema = z.object({
  platform: z.string().trim().min(1, { message: "Platform is required" }),
  url: z
    .string()
    .trim()
    .url({ message: "Invalid URL format" })
    .min(1, { message: "URL is required" }),
});

const signupSchema = z.object({
  username: z
    .string({ message: "username is requiredd" })
    .trim()
    .min(4, { message: "Username must be of 4 characters" })
    .max(50, { message: "Username cannot exceed 50 characters" }),
  fullName: z
    .string({ message: "fullName is required" })
    .trim()
    .min(1, { message: "fullName is required" })
    .max(100, { message: "fullName cannot exceed 100 characters" }),

  email: z
    .string({ message: "email is required" })
    .trim()
    .email({ message: "Invalid email format" })
    .min(1, { message: "Email is required" }),

  password: z
    .string({ message: "password is required" })
    .trim()
    .min(7, { message: "Password must be at least 7 characters long" }),

  profileImage: z.string().default(""),

  bio: z
    .string()
    .trim()
    .max(250, { message: "Bio cannot exceed 250 characters" })
    .optional(),

  socialLinks: z.array(socialLinkSchema).optional(), // Social links are optional
});

const loginSchema = z.object({
  email: z
    .string({ message: "email is required" })
    .trim()
    .email({ message: "Invalid email format" })
    .min(1, { message: "Email is required" }),

  password: z
    .string({ message: "password is required" })
    .trim()
    .min(7, { message: "Password must be at least 7 characters long" }),
});

export default { signupSchema, loginSchema };
