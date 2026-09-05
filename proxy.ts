import NextAuth from "next-auth";

import {
  authConfig,
} from "./auth.config";

export default NextAuth(
  authConfig,
).auth;

export const config = {
  matcher: [
    "/connexion",
    "/dashboard/:path*",
    "/territoires/:path*",
    "/indicateurs/:path*",
    "/diagnostics/:path*",
    "/veille/:path*",
    "/comparaison/:path*",
    "/cartographie/:path*",
    "/assistant/:path*",
    "/prospective/:path*",
    "/parametres/:path*",
    "/conseil-municipal/:path*",
    "/espace-metiers/:path*",
    "/rapport/:path*",
  ],
};
