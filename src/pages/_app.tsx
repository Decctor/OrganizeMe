import { type AppType } from "next/app";
import { useState, useEffect } from "react";
import { api } from "~/utils/api";

import "~/styles/globals.css";

import { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
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
  // if (typeof document != "undefined") {
  //   // var { userId } = parseCookies(null);
  //   // console.log("COOKIE", userId);
  //   userId = JSON.parse(localStorage.getItem("user"));
  // }
  var { userId } = parseCookies(null);
  console.log("COOKIE", userId);
  // const { data: user, refetch: getUser } = api.users.getUser.useQuery(
  //   userId ? userId : "",
  //   {
  //     enabled: false,
  //   }
  // );
  useEffect(() => {
    if (!userId) router.push("/auth/login");
    // else {
    //   getUser();
    // }
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
