import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const usersRouter = createTRPCRouter({
  createUser: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log(input);
      return ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: input.password,
        },
      });
    }),
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .query(async ({ ctx, input }) => {
      let correspondingUserInDb = await ctx.prisma.user.findFirst({
        where: {
          email: input.email,
        },
        select: {
          id:true,
          name: true,
          email: true,
          categories: true,
          methods: true,
          expenses: true,
          password: true,
        },
      });
      console.log(correspondingUserInDb);
      if (!correspondingUserInDb) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuário não existente.",
        });
      }
      if (correspondingUserInDb.password != input.password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Senha incorreta.",
        });
      }
      let returninObj = { ...correspondingUserInDb, password: null };
      return returninObj;
    }),
  getUser: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: id }) => {
      let user = await ctx.prisma.user.findFirst({
        where: {
          id: id,
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
      return user;
    }),
});
