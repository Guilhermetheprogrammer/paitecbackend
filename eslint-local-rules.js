module.exports = {
  "no-prisma-client-instantiation": {
    meta: {
      docs: {
        description:
          "Disallow instantiation of PrismaClient in .e2e-test.ts files",
        category: "Possible Errors",
        recommended: false,
      },
      schema: [],
    },
    create(context) {
      return {
        NewExpression(node) {
          const filename = context.getFilename();
          const isE2ETestFile = filename.endsWith(".e2e-test.ts");
          const isPrismaClient = node.callee.name === "PrismaClient";

          if (isE2ETestFile && isPrismaClient) {
            context.report({
              node,
              message:
                "Instantiation of PrismaClient is not allowed in .e2e-test.ts files.",
            });
          }
        },
      };
    },
  },
};
