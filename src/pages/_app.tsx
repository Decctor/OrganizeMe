import { type AppType } from "next/app";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";

import "~/styles/globals.css";

import { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
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
  var storedId: undefined | string;
  if (typeof document != "undefined")
    storedId = JSON.parse(localStorage.getItem("user"));
  const { data: user, refetch: getUser } = api.users.getUser.useQuery(
    storedId,
    {
      enabled: false,
    }
  );
  useEffect(() => {
    if (!storedId) router.push("/auth/login");
    else {
      getUser();
    }
  }, [storedId]);
  console.log("USER IN APP", user);
  return (
    <>
      <Component {...pageProps} user={user} /> <Toaster />
    </>
  );
};

export default api.withTRPC(MyApp);
