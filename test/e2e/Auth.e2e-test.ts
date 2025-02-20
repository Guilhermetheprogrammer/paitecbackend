import { createHash } from "crypto";
import request from "supertest";
import { afterAll, beforeAll, describe, it } from "vitest";

import { RoleEnum } from "@/core/domain/enums/RoleEnum";
import { app } from "@/drivers/webserver/app";
import { faker } from "@faker-js/faker";

import { prisma } from "./setup-e2e";

const path = "auth";

function valueToHash(value: string): string {
  const hash = createHash("sha256");
  hash.update(value);

  return hash.digest("hex");
}

describe("[E2E] Auth Routes", () => {
  const password = faker.internet.password();
  const login = faker.internet.userName();
  // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
  let createdUser;

  beforeAll(async () => {
    await app.ready();

    createdUser = await prisma.user.create({
      data: {
        login,
        name: faker.person.firstName(),
        passwordHash: valueToHash(password),
        role: RoleEnum.ADMIN,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe(`[POST] /${path}/login`, () => {
    it("should authenticate correctly when user and password are correctly ", async () => {
      const response = await request(app.server).post(`/${path}/login`).send({
        login,
        password,
      });

      expect(response.status).toBe(200);
      expect(response.body.token).toEqual(expect.any(String));
    });

    it("should not authenticate when user does not exist", async () => {
      const response = await request(app.server).post(`/${path}/login`).send({
        login: "invalid",
        password,
      });

      expect(response.status).toBe(401);
    });
  });
});
