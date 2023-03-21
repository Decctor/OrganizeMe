import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const financesRouter = createTRPCRouter({
  createExpense: publicProcedure
    .input(
      z.object({
        description: z.string(),
        category: z.string(),
        method: z.string(),
        value: z.number(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log(input);
      return ctx.prisma.expenses.create({
        data: {
          description: input.description,
          category: input.category,
          method: input.method,
          value: input.value,
          user: {
            connect: {
              id: input.userId,
            },
          },
        },
      });
    }),
  getExpenses: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      let expenses = await ctx.prisma.expenses.findMany({
        where: {
          userId: input,
        },
      });
      return expenses;
    }),
  createCategory: publicProcedure
    .input(
      z.object({
        name: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let response = await ctx.prisma.categories.create({
        data: {
          name: input.name,
          user: {
            connect: {
              id: input.userId,
            },
          },
        },
      });
      let user = await ctx.prisma.user.findFirst({
        where: {
          id: input.userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          categories: true,
          methods: true,
          expenses: true,
        },
      });
      console.log("RESPONSE", user);
      return user;
    }),
  createMethod: publicProcedure
    .input(
      z.object({
        name: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.methods.create({
        data: {
          name: input.name,
          user: {
            connect: {
              id: input.userId,
            },
          },
        },
      });
    }),
});
