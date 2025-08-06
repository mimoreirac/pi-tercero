import dotenv from "dotenv";
import { vi } from "vitest";

dotenv.config();

// Para los tests, estamos implementando un firebase-admin falso
vi.mock("firebase-admin", () => {
  const mockAuth = {
    verifyIdToken: vi.fn().mockResolvedValue({
      uid: "test-firebase-uid",
      email: "test@example.com",
      name: "Test User",
    }),
  };

  const mockAdmin = {
    initializeApp: vi.fn(),
    credential: {
      cert: vi.fn(),
    },
    auth: () => mockAuth,
  };

  return {
    // Handle `import admin from 'firebase-admin'`
    default: mockAdmin,
    // Handle named exports if they are used elsewhere
    initializeApp: mockAdmin.initializeApp,
    credential: mockAdmin.credential,
    auth: mockAdmin.auth,
  };
});