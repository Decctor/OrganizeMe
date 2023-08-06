import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const financesRouter = createTRPCRouter({
  getUserPaymentMethods: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const userId = input;
      try {
        const paymentMethods = await ctx.prisma.methods.findMany({
          where: {
            userId: userId,
          },
        });
        return paymentMethods;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar métodos de pagamento do usuário",
        });
      }
    }),
  getUserExpenseCategories: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const userId = input;
      try {
        const expenseCategories = await ctx.prisma.categories.findMany({
          where: {
            userId: userId,
          },
        });
        return expenseCategories;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar categorias de gasto do usuário",
        });
      }
    }),
  getUserFinancialBalance: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const currentDate = new Date();
      try {
        const expenses = await ctx.prisma.expenses.groupBy({
          where: {
            userId: input,
            paymentDate: { lte: currentDate },
          },
          by: ["userId"],
          _sum: {
            value: true,
          },
        });
        const earnings = await ctx.prisma.earnings.groupBy({
          where: {
            userId: input,
            date: { lte: currentDate },
          },
          by: ["userId"],
          _sum: {
            value: true,
          },
        });
        const totalExpenses = expenses[0]?._sum.value
          ? expenses[0]?._sum.value
          : 0;
        const totalEarnings = earnings[0]?._sum.value
          ? earnings[0]?._sum.value
          : 0;
        return totalEarnings - totalExpenses;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro na comunicação com o servidor. Por favor, tente novamente mais tarde.",
        });
      }
    }),
  createExpense: publicProcedure
    .input(
      z.object({
        description: z.string(),
        category: z.string(),
        method: z.string(),
        value: z.number(),
        purchaseDate: z.date(),
        paymentDate: z.date(),
        installments: z.number().nullable(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.expenses.create({
          data: {
            description: input.description,
            category: input.category,
            method: input.method,
            value: input.value,
            purchaseDate: input.purchaseDate,
            installments: input.installments,
            paymentDate: input.paymentDate,
            user: {
              connect: {
                id: input.userId,
              },
            },
          },
        });
        return "Gasto adicionado com sucesso!";
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro na comunicação com o servidor. Por favor, tente novamente mais tarde.",
        });
      }
    }),
  createManyExpenses: publicProcedure
    .input(
      z.array(
        z.object({
          description: z.string(),
          category: z.string(),
          method: z.string(),
          value: z.number(),
          purchaseDate: z.date(),
          paymentDate: z.date(),
          installments: z.number(),
          installmentIdentifier: z.number(),
          userId: z.string(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.expenses.createMany({
          data: input,
        });
        return "Gasto adicionado com sucesso!";
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro na comunicação com o servidor. Por favor, tente novamente mais tarde.",
        });
      }
    }),
  getExpenses: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        const expenses = await ctx.prisma.expenses.findMany({
          where: {
            userId: input,
          },
        });
        return expenses;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro na comunicação com o servidor. Por favor, tente novamente mais tarde.",
        });
      }
    }),
  getMonthExpenses: publicProcedure
    .input(
      z.object({
        id: z.string(),
        date: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { date } = input;
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      try {
        const firstFisterItems = await ctx.prisma.expenses.findMany({
          where: {
            userId: input.id,
            AND: [
              {
                paymentDate: { gte: firstDay },
              },
              {
                paymentDate: { lte: lastDay },
              },
            ],
          },
          orderBy: {
            paymentDate: "asc",
          },
        });
        return firstFisterItems;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro na comunicação com o servidor. Por favor, tente novamente mais tarde.",
        });
      }
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
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro na comunicação com o servidor. Por favor, tente novamente mais tarde.",
        });
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
      try {
        await ctx.prisma.earnings.create({
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
        return "Ganho adicionado com sucesso!";
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro na comunicação com o servidor. Por favor, tente novamente mais tarde.",
        });
      }
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
  getMonthEarnings: publicProcedure
    .input(
      z.object({
        id: z.string(),
        date: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { date } = input;
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      console.log(firstDay, lastDay);
      const firstFisterItems = await ctx.prisma.earnings.findMany({
        where: {
          userId: input.id,
          AND: [
            {
              date: { gte: firstDay },
            },
            {
              date: { lte: lastDay },
            },
          ],
        },
        orderBy: {
          date: "asc",
        },
      });
      return firstFisterItems;
    }),
  deleteEarning: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.earnings.delete({
          where: {
            id: input,
          },
        });
        return "Ganho excluído!";
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro na comunicação com o servidor. Por favor, tente novamente mais tarde.",
        });
      }
    }),
  createCategory: publicProcedure
    .input(
      z.object({
        name: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
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
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro na comunicação com o servidor. Por favor, tente novamente mais tarde.",
        });
      }
    }),
  createMethod: publicProcedure
    .input(
      z.object({
        name: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
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
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro na comunicação com o servidor. Por favor, tente novamente mais tarde.",
        });
      }
    }),
  getAnalytics: publicProcedure
    .input(
      z.object({
        id: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = input;
      try {
        const expenses = await ctx.prisma.expenses.findMany({
          where: {
            userId: input.id,
            AND: [
              {
                paymentDate: { gte: startDate },
              },
              {
                paymentDate: { lte: endDate },
              },
            ],
          },
        });
        const earnings = await ctx.prisma.earnings.findMany({
          where: {
            userId: input.id,
            AND: [
              {
                date: { gte: startDate },
              },
              {
                date: { lte: endDate },
              },
            ],
          },
        });
        return {
          expenses: expenses,
          earnings: earnings,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro na comunicação com o servidor. Por favor, tente novamente mais tarde.",
        });
      }
    }),
});
