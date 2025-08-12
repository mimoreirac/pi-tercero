import dotenv from "dotenv";
import { vi } from "vitest";

dotenv.config();

const mockUsers = {
  conductor: {
    uid: "conductor-firebase-uid",
    email: "conductor@test.com",
    name: "Conductor de Pruebas",
  },
  pasajero: {
    uid: "pasajero-firebase-uid",
    email: "pasajero@test.com",
    name: "Pasajero de Pruebas",
  },
  otro: {
    uid: "otro-firebase-uid",
    email: "otro@test.com",
    name: "Otro de Pruebas",
  },
};

// Para los tests, estamos implementando un firebase-admin falso
vi.mock("firebase-admin", () => {
  const mockAuth = {
    verifyIdToken: vi.fn().mockImplementation((token) => {
      if (token === "conductor-token") {
        return Promise.resolve(mockUsers.conductor);
      }
      if (token === "pasajero-token") {
        return Promise.resolve(mockUsers.pasajero);
      }
      if (token === "otro-token") {
        return Promise.resolve(mockUsers.otro);
      }
      return Promise.resolve(mockUsers.conductor); // Default mock user
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