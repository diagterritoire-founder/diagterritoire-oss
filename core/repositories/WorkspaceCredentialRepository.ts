import {
  compare,
  hash,
} from "bcryptjs";

import {
  prisma,
} from "@/lib/prisma";

const PASSWORD_SALT_ROUNDS = 12;

export class WorkspaceCredentialRepository {
  static async setPassword(
    userId: string,
    password: string,
  ): Promise<void> {
    const passwordHash =
      await hash(
        password,
        PASSWORD_SALT_ROUNDS,
      );

    await prisma.workspaceCredential.upsert({
      where: {
        userId,
      },
      update: {
        passwordHash,
        updatedAt: new Date(),
      },
      create: {
        id: `credential-${userId}`,
        userId,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  static async verifyPassword(
    userId: string,
    password: string,
  ): Promise<boolean> {
    const credential =
      await prisma.workspaceCredential.findUnique({
        where: {
          userId,
        },
      });

    if (!credential) {
      return false;
    }

    return compare(
      password,
      credential.passwordHash,
    );
  }
}
