import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const activitiesRouter = createTRPCRouter({
  createActivity: publicProcedure
    .input(
      z.object({
        title: z
          .string()
          .min(3, "Por favor, dê um título de ao menos 3 letras à atividade."),
        items: z.array(
          z.object({
            description: z.string(),
            done: z.boolean(),
          })
        ),
        userId: z.string({
          required_error: "Por favor, forneça o ID do usuário.",
          invalid_type_error: "Por favor, forneça um ID válido de usuário.",
        }),
        dueDate: z.string().datetime().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.activities.create({
          data: {
            title: input.title,
            dueDate: input.dueDate,
            items: {
              create: input.items,
            },
            user: {
              connect: {
                id: input.userId,
              },
            },
          },
        });
        return "Atividade criada com sucesso.";
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro na comunicação com o servidor. Por favor, tente novamente mais tarde.",
        });
      }
    }),
  getUserActivities: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        const activities = await ctx.prisma.activities.findMany({
          where: {
            userId: input,
          },
          include: {
            items: true,
          },
        });
        return activities;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro na comunicação com o servidor. Por favor, tente novamente mais tarde.",
        });
      }
    }),
  updateActivityItem: publicProcedure
    .input(z.object({ id: z.string(), done: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.activityItem.update({
          where: {
            id: input.id,
          },
          data: {
            done: input.done,
          },
        });
        return "Item concluído com sucesso.";
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Erro na comunicação com o servidor. Por favor, tente novamente mais tarde.",
        });
      }
    }),
});
