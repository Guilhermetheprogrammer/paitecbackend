/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
import request from "supertest";
import { afterAll, beforeAll, describe, it } from "vitest";

import { RoleEnum } from "@/core/domain/enums/RoleEnum";
import { app } from "@/drivers/webserver/app";
import { faker } from "@faker-js/faker";

import { prisma } from "./setup-e2e";
import { createAdminUserAndToken } from "./utils/CreateAdminUserAndToken";
import { valueToHash } from "./utils/ValueToHash";

const path = "stats";

describe("[E2E] Stats Routes", () => {
  let adminAccessToken: string;

  beforeAll(async () => {
    await app.ready();
    ({ adminAccessToken } = await createAdminUserAndToken(
      app,
      prisma,
      adminAccessToken
    ));
  });

  afterAll(async () => {
    await app.close();
  });

  describe(`[GET] /${path}`, () => {
    it("should return the number of users, schools, and classrooms correctly", async () => {
      const createEntities = async (
        quantity: number,
        createFn: () => Promise<any>
      ) => {
        const promises = Array.from({ length: quantity }).map(createFn);
        await Promise.all(promises);
      };

      const quantityUsersToCreate = faker.number.int({ min: 1, max: 5 });
      await createEntities(quantityUsersToCreate, () =>
        prisma.user.create({
          data: {
            login: faker.internet.userName(),
            name: faker.person.firstName(),
            passwordHash: valueToHash(faker.internet.password()),
            role: faker.helpers.enumValue(RoleEnum),
          },
        })
      );

      const quantitySchoolsToCreate = faker.number.int({ min: 1, max: 5 });
      await createEntities(quantitySchoolsToCreate, () =>
        prisma.school.create({
          data: {
            name: faker.lorem.word(),
          },
        })
      );

      const quantityClassroomsToCreate = faker.number.int({ min: 1, max: 5 });
      const school = await prisma.school.findFirst();
      await createEntities(quantityClassroomsToCreate, () =>
        prisma.classroom.create({
          data: {
            name: faker.lorem.word(),
            schoolId: school!.id,
          },
        })
      );

      const response = await request(app.server)
        .get(`/${path}`)
        .set("Authorization", `Bearer ${adminAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.totalUsers).toEqual(quantityUsersToCreate + 1);
      expect(response.body.totalSchools).toEqual(quantitySchoolsToCreate);
      expect(response.body.totalClassrooms).toEqual(quantityClassroomsToCreate);
    });
  });
});
