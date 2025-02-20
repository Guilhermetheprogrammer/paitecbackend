/* eslint-disable no-param-reassign */
import { FastifyInstance } from "fastify";

import { RoleEnum } from "@/core/domain/enums/RoleEnum";
import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";

import { valueToHash } from "./ValueToHash";

export async function createAdminUserAndToken(
  // eslint-disable-next-line @typescript-eslint/no-shadow
  app: FastifyInstance,
  prisma: PrismaClient,
  adminAccessToken: string
) {
  const adminUser = await prisma.user.create({
    data: {
      login: faker.internet.userName(),
      name: faker.person.firstName(),
      passwordHash: valueToHash(faker.internet.password()),
      role: RoleEnum.ADMIN,
    },
  });

  adminAccessToken = app.jwt.sign(
    {
      role: adminUser.role,
      login: adminUser.login,
    },
    {
      sub: adminUser.id,
    }
  );
  return { adminAccessToken };
}
