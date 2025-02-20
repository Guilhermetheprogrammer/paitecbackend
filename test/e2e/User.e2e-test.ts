/* eslint-disable no-param-reassign */
import { createHash } from "crypto";
import request from "supertest";
import { afterAll, beforeAll, describe, it } from "vitest";

import { RoleEnum } from "@/core/domain/enums/RoleEnum";
import { app } from "@/drivers/webserver/app";
import { faker } from "@faker-js/faker";
import { PrismaClient, User } from "@prisma/client";

import { prisma } from "./setup-e2e";

const path = "users";

function valueToHash(value: string): string {
  const hash = createHash("sha256");
  hash.update(value);

  return hash.digest("hex");
}

describe("[E2E] User Routes", () => {
  let adminAccessToken: string;
  let adminUser: User;

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe(`[GET] /${path}/me`, () => {
    beforeAll(async () => {
      await prisma.user.deleteMany();

      ({ adminUser, adminAccessToken } = await createAdminUserAndToken(
        adminUser,
        prisma,
        adminAccessToken
      ));
    });

    it("should return the user details by token properly", async () => {
      const response = await request(app.server)
        .get(`/${path}/me`)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(
        expect.objectContaining({
          id: adminUser.id,
          login: adminUser.login,
          name: adminUser.name,
          role: adminUser.role,
        })
      );
    });
  });

  describe(`[POST] /${path}`, () => {
    beforeAll(async () => {
      await prisma.user.deleteMany();

      ({ adminUser, adminAccessToken } = await createAdminUserAndToken(
        adminUser,
        prisma,
        adminAccessToken
      ));
    });

    it("should create a user properly", async () => {
      const login = faker.internet.userName();
      const name = faker.person.firstName();
      const password = faker.internet.password();
      const role = RoleEnum.PARENT;

      const response = await request(app.server)
        .post(`/${path}`)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send({
          login,
          name,
          password,
          role,
        });

      expect(response.status).toBe(201);

      const user = await prisma.user.findFirst({
        where: {
          login,
        },
      });

      expect(user).toStrictEqual(
        expect.objectContaining({
          login,
          name,
          role,
        })
      );
    });
  });

  describe(`[GET] /${path}`, () => {
    beforeAll(async () => {
      await prisma.user.deleteMany();

      ({ adminUser, adminAccessToken } = await createAdminUserAndToken(
        adminUser,
        prisma,
        adminAccessToken
      ));
    });

    it("should list the users properly", async () => {
      const quantityUsersToCreate = faker.number.int({
        min: 1,
        max: 5,
      });

      // eslint-disable-next-line arrow-body-style
      const userCreationPromises = Array.from({
        length: quantityUsersToCreate,
      }).map(() =>
        prisma.user.create({
          data: {
            login: faker.internet.userName(),
            name: faker.person.firstName(),
            passwordHash: valueToHash(faker.internet.password()),
            role: faker.helpers.enumValue(RoleEnum),
          },
        })
      );

      await Promise.all(userCreationPromises);

      const response = await request(app.server)
        .get(`/${path}`)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.totalItems).toEqual(
        quantityUsersToCreate + 1
      );
    });
  });

  describe(`[GET] /${path}/{id}`, () => {
    beforeAll(async () => {
      await prisma.user.deleteMany();

      ({ adminUser, adminAccessToken } = await createAdminUserAndToken(
        adminUser,
        prisma,
        adminAccessToken
      ));
    });

    it("should get the user properly", async () => {
      const name = faker.person.firstName();
      const login = faker.internet.userName();
      const role = RoleEnum.PARENT;

      const user = await prisma.user.create({
        data: {
          login,
          name,
          passwordHash: valueToHash(faker.internet.password()),
          role,
        },
      });

      const response = await request(app.server)
        .get(`/${path}/${user.id}`)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(
        expect.objectContaining({
          login,
          name,
          role,
        })
      );
    });
  });

  describe(`[PUT] /${path}/{id}`, () => {
    beforeAll(async () => {
      await prisma.user.deleteMany();

      ({ adminUser, adminAccessToken } = await createAdminUserAndToken(
        adminUser,
        prisma,
        adminAccessToken
      ));
    });

    it("should update the user properly", async () => {
      const name = faker.person.firstName();
      const login = faker.internet.userName();
      const role = RoleEnum.PARENT;

      const user = await prisma.user.create({
        data: {
          login,
          name,
          passwordHash: valueToHash(faker.internet.password()),
          role,
        },
      });

      const updatedName = faker.person.firstName();

      await request(app.server)
        .put(`/${path}/${user.id}`)
        .set("Authorization", `Bearer ${adminAccessToken}`)
        .send({
          name: updatedName,
        });

      const updatedUser = await prisma.user.findFirst({
        where: {
          id: user.id,
        },
      });

      expect(updatedUser).toStrictEqual(
        expect.objectContaining({
          name: updatedName,
        })
      );
    });
  });
});

async function createAdminUserAndToken(
  adminUser: User,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  prisma: PrismaClient,
  adminAccessToken: string
) {
  adminUser = await prisma.user.create({
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
  return { adminUser, adminAccessToken };
}
