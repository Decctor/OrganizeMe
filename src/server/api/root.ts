import { createTRPCRouter } from "~/server/api/trpc";
import { exampleRouter } from "~/server/api/routers/example";
import { financesRouter } from "./routers/finances";
import { usersRouter } from "./routers/users";
import { activitiesRouter } from "./routers/activities";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  finances: financesRouter,
  users: usersRouter,
  activities: activitiesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
