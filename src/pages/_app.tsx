import { type AppType } from "next/app";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";

import "~/styles/globals.css";

import { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import LoadingPage from "~/components/utils/LoadingPage";
type User = {
  name: string;
  email: string;
  categories?: object;
  methods?: object;
  expenses?: object;
  budgets?: object;
};
const MyApp: AppType = ({ Component, pageProps }) => {
  const router = useRouter();

  var { userId } = parseCookies(null);

  useEffect(() => {
    if (!userId) router.push("/auth/login");
  }, [userId]);

  return (
    <>
      <Component
        {...pageProps}
        //  user={user}
      />
      <Toaster />
    </>
  );
};

export default api.withTRPC(MyApp);
