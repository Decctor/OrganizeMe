import { TRPCError } from "@trpc/server";
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
        purchaseDate: z.date(),
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
          purchaseDate: input.purchaseDate,
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
      const expenses = await ctx.prisma.expenses.findMany({
        where: {
          userId: input,
        },
      });
      return expenses;
    }),
  deleteExpense: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.expenses.delete({
          where: {
            id: input,
          },
        });
        return "Gasto excluído!";
      } catch (error) {
        return new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  createEarning: publicProcedure
    .input(
      z.object({
        description: z.string(),
        value: z.number(),
        date: z.date(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.earnings.create({
        data: {
          description: input.description,
          value: input.value,
          date: input.date,
          user: {
            connect: {
              id: input.userId,
            },
          },
        },
      });
    }),
  getEarnings: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const earnings = await ctx.prisma.earnings.findMany({
        where: {
          userId: input,
        },
      });
      return earnings;
    }),
  createCategory: publicProcedure
    .input(
      z.object({
        name: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.categories.create({
        data: {
          name: input.name,
          user: {
            connect: {
              id: input.userId,
            },
          },
        },
      });
      const user = await ctx.prisma.user.findFirst({
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
      const user = await ctx.prisma.user.findFirst({
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
});
