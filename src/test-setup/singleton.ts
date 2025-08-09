import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy} from 'jest-mock-extended'
import prisma from "../lib/prisma";

// This tells Jest to replace the module at '../lib/prisma' with a mock
jest.mock('../lib/prisma', ()=> ({
    __esModule: true,
    default: mockDeep<PrismaClient>(),
}))

// This ensures that between each test, the mock is reset to a clean state
beforeEach(()=> {
    mockReset(prismaMock)
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>