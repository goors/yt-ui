import { useMsal, useAccount } from "@azure/msal-react";
import { LogOut, User, Settings } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const UserProfile = () => {
    const { instance } = useMsal();
    const accounts = instance.getAllAccounts();
    const account = useAccount(accounts[0] || {});

    const firstName = account?.idTokenClaims?.given_name || "Nikola";
    const lastName = account?.idTokenClaims?.family_name || "";
    const initials = `${firstName.charAt(0)}${lastName.charAt(0) || ""}`.toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {/* Slimmed down to just the avatar for sidebar compatibility */}
                <button className="relative w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-[10px] font-bold bg-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-500 transition-all">
                    {initials}
                </button>
            </DropdownMenuTrigger>

            {/* Content stays 52w because it's a floating menu, not part of the sidebar rail */}
            <DropdownMenuContent side="right" align="end" sideOffset={12} className="w-52 p-2 border-zinc-800 bg-zinc-900 text-zinc-300 shadow-2xl">
                <DropdownMenuLabel className="px-2 py-1.5 text-xs text-zinc-500 font-normal">
                    {firstName} {lastName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1 bg-zinc-800" />
                <DropdownMenuItem className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 py-2 px-2">
                    <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800 py-2 px-2">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-zinc-800" />
                <DropdownMenuItem
                    onClick={() => instance.logoutRedirect()}
                    className="cursor-pointer text-red-400 hover:bg-red-950/30 focus:bg-red-950/30 py-2 px-2"
                >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};