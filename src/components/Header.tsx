import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { destroyCookie } from "nookies";
import React from "react";
import Logo from "../utils/images/logo.png";
import { toast } from "react-hot-toast";
import { MdOutlineLogout } from "react-icons/md";
function Header() {
  const router = useRouter();
  // async function logout() {
  //   try {
  //     await router.push("/auth/login");
  //     return;
  //   } catch (error) {
  //     toast.error("Oops, error.");
  //   }
  // }
  return (
    <div className="sticky top-0 z-10 h-[70px] w-full border-b border-gray-200 bg-[#fff]">
      <div className="flex h-full w-full items-center justify-between px-2">
        <div className="w-1/3"></div>
        <div className="flex w-1/3 items-center justify-center">
          <Link href={"/"}>
            <div className="flex h-[60px] w-[70px] items-center justify-center">
              <Image src={Logo} alt="OrganizeMe Logo" width={100} height={60} />
            </div>
          </Link>
        </div>
        <div className="flex w-1/3 items-center justify-end">
          <button
            onClick={() => {
              void (async () => {
                destroyCookie(null, "userId");
                const x = await router.push("/auth/login");
                console.log("UEPA");
                return;
              })();
            }}
            className="text-[25px] text-[#00c16c]"
          >
            <MdOutlineLogout />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Header;
