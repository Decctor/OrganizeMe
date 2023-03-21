import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { MdOutlineLogout } from "react-icons/md";
function Header() {
  const router = useRouter();
  function logout() {
    localStorage.removeItem("user");
    router.push("/auth/login");
  }
  return (
    <div className="sticky top-0 h-[70px] w-full border-b border-gray-200">
      <div className="flex h-full w-full items-center justify-between px-2">
        <div></div>
        <div className="flex items-center justify-center">
          <Link href={"/"}>
            <h1 className="font-bold text-[#00c16c]">OrganizeMe</h1>
          </Link>
        </div>
        <div>
          <button onClick={logout} className="text-[#00c16c]">
            <MdOutlineLogout />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Header;
