// components/sub-menu/sub-menu.tsx
import React from "react";
import Link from "next/link";
import { authClient } from "@/src/utils/auth-client";

interface SubMenuProps {
  links: { link: string; title: string }[];
  onSignInClick: () => void;
  onSignUpClick: () => void;
  onSignOutClick: () => void;
}

export const SubMenu: React.FC<SubMenuProps> = ({
  links,
  onSignInClick,
  onSignUpClick,
  onSignOutClick,
}) => {
  const { data: session } = authClient.useSession();

  return (
    <ul className="flex flex-col">
      {links.map(({ link, title }) => {
        if (title === "Log in") {
          if (session) return;
          return (
            <li key={link} className="px-4 py-2 hover:bg-gray-100">
              <button
                onClick={onSignInClick}
                className="w-full text-left cursor-pointer"
              >
                {title}
              </button>
            </li>
          );
        }

        // If it’s “Sign up”, call the onSignUpClick callback:
        if (title === "Sign up") {
          return (
            <li key={link} className="px-4 py-2 hover:bg-gray-100">
              <button
                onClick={onSignUpClick}
                className="w-full text-left cursor-pointer"
              >
                {title}
              </button>
            </li>
          );
        }

        // Otherwise (e.g. a “Sign out”), just call onSignOutClick:
        if (title === "Sign out") {
          if (!session) return;
          return (
            <li key={link} className="px-4 py-2 hover:bg-gray-100">
              <button
                onClick={onSignOutClick}
                className="w-full text-left cursor-pointer"
              >
                {title}
              </button>
            </li>
          );
        }

        // (In case you had other submenu links, you could fall back to <Link> here.)
        return (
          <li key={link} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
            <Link href={link}>{title}</Link>
          </li>
        );
      })}
    </ul>
  );
};
