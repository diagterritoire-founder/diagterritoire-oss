import type {
  NextAuthConfig,
} from "next-auth";

const protectedRoutes = [
  "/dashboard",
  "/territoires",
  "/indicateurs",
  "/diagnostics",
  "/veille",
  "/comparaison",
  "/cartographie",
  "/assistant",
  "/prospective",
  "/parametres",
  "/conseil-municipal",
  "/espace-metiers",
  "/rapport",
];

export const authConfig = {
  pages: {
    signIn: "/connexion",
  },

  callbacks: {
    authorized({
      auth,
      request: {
        nextUrl,
      },
    }) {
      const isLoggedIn =
        Boolean(auth?.user);

      const isProtected =
        protectedRoutes.some(
          (route) =>
            nextUrl.pathname === route ||
            nextUrl.pathname.startsWith(
              `${route}/`,
            ),
        );

      if (isProtected) {
        return isLoggedIn;
      }

      if (
        nextUrl.pathname === "/connexion" &&
        isLoggedIn
      ) {
        return Response.redirect(
          new URL(
            "/dashboard",
            nextUrl,
          ),
        );
      }

      return true;
    },
  },

  providers: [],
} satisfies NextAuthConfig;
