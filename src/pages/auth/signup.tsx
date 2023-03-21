import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { z } from "zod";
import FullScreenWrapper from "~/components/wrappers/FullScreenWrapper";
import { api } from "~/utils/api";
const userInput = z.object({
  name: z
    .string()
    .min(5, { message: "Por favor, preencha um nome com ao menos 5 letras" }),
  email: z.string().email({ message: "Por favor, preencha um email válido." }),
  password: z.string().min(5, {
    message: "Por favor, preencha um senha com ao menos 5 caractéres",
  }),
});
function SignUpPage() {
  const router = useRouter();
  const [signUpInfo, setSignUpInfo] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { mutate } = api.users.createUser.useMutation({
    onSuccess: async (resposne) => {
      toast.success(
        "Usuário criado com sucesso. Redirecionando para área de login."
      );
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    },
  });
  async function handleSignUp() {
    let result = await userInput.safeParseAsync(signUpInfo);
    if (result.success === false) {
      toast.error(
        result.error.issues[0]?.message
          ? result.error.issues[0]?.message
          : "Por favor, confira os dados preenchidos."
      );
    } else {
      mutate(signUpInfo);
    }
  }
  return (
    <FullScreenWrapper>
      <div className="flex w-full grow flex-col">
        <section className="bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
            <div className="w-full rounded-lg bg-white shadow dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-md md:mt-0 xl:p-0">
              <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
                  Crie sua conta{" "}
                  <strong className="text-[#2790b0]">OrganizeMe</strong>
                </h1>
                <form
                  className="space-y-4 md:space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSignUp();
                  }}
                >
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Seu nome
                    </label>
                    <input
                      value={signUpInfo.name}
                      onChange={(e) =>
                        setSignUpInfo({ ...signUpInfo, name: e.target.value })
                      }
                      type="text"
                      name="name"
                      id="name"
                      className="focus:ring-primary-600 focus:border-primary-600 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                      placeholder="ex: João das Neves"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Seu email
                    </label>
                    <input
                      value={signUpInfo.email}
                      onChange={(e) =>
                        setSignUpInfo({ ...signUpInfo, email: e.target.value })
                      }
                      type="email"
                      name="email"
                      id="email"
                      className="focus:ring-primary-600 focus:border-primary-600 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                      placeholder="nome@email.com"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Senha
                    </label>
                    <input
                      value={signUpInfo.password}
                      onChange={(e) =>
                        setSignUpInfo({
                          ...signUpInfo,
                          password: e.target.value,
                        })
                      }
                      type="password"
                      name="password"
                      id="password"
                      placeholder="••••••••"
                      className="focus:ring-primary-600 focus:border-primary-600 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  {/* <div>
                    <label
                      htmlFor="confirm-password"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Confirme sua senha
                    </label>
                    <input
                      type="confirm-password"
                      name="confirm-password"
                      id="confirm-password"
                      placeholder="••••••••"
                      className="focus:ring-primary-600 focus:border-primary-600 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm"
                    />
                  </div> */}
                  {/* <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input
                        id="terms"
                        aria-describedby="terms"
                        type="checkbox"
                        className="focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 h-4 w-4 rounded border border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="terms"
                        className="font-light text-gray-500 dark:text-gray-300"
                      >
                        I accept the{" "}
                        <a
                          className="text-primary-600 dark:text-primary-500 font-medium hover:underline"
                          href="#"
                        >
                          Terms and Conditions
                        </a>
                      </label>
                    </div>
                  </div> */}
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700  focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 w-full rounded-lg px-5 py-2.5 text-center text-sm font-medium text-[#2790b0]  focus:outline-none focus:ring-4"
                  >
                    Criar conta
                  </button>
                  <p className="flex items-center text-sm font-light text-gray-500 dark:text-gray-400">
                    Já tem uma conta?{" "}
                    <Link href="/auth/login">
                      <p className="text-primary-600 dark:text-primary-500 pl-2 font-medium text-[#94ba65] hover:underline">
                        Entre aqui!
                      </p>
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </FullScreenWrapper>
  );
}

export default SignUpPage;
