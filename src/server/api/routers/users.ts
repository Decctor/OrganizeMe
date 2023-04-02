import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { hashSync, compareSync } from "bcrypt";
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
      let existingUserInDb = await ctx.prisma.user.findFirst({
        where: {
          email: input.email,
        },
      });
      if (existingUserInDb)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email já cadastrado.",
        });
      let hashedPassword = hashSync(input.password, 10);
      console.log("HASHED PASS", hashedPassword);
      await ctx.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
        },
      });
      return "Usuário criado com sucesso. Redirecionando para área de login.";
    }),
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .query(async ({ ctx, input }) => {
      const correspondingUserInDb = await ctx.prisma.user.findFirst({
        where: {
          email: input.email,
        },
        select: {
          id: true,
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
      let compareResult = compareSync(
        input.password,
        correspondingUserInDb?.password
      );
      if (!compareResult) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Senha incorreta.",
        });
      }
      const returninObj = { ...correspondingUserInDb, password: null };
      return returninObj;
    }),
  getUser: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input: id }) => {
      const user = await ctx.prisma.user.findFirst({
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
