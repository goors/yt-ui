import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import './index.css'
import {InteractionType, PublicClientApplication} from "@azure/msal-browser";
import {msalConfig} from "@/auth-config";
export const msalInstance = new PublicClientApplication(msalConfig);
import {MsalAuthenticationTemplate, MsalProvider} from "@azure/msal-react";
import { useIsAuthenticated } from "@azure/msal-react";
import Clients from "@/pages/clients.tsx";
import Navbar from "@/components/navbar.tsx";
import Candidates from "@/pages/candidates.tsx";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "@/client/query-qlient";
import {Toaster} from "@/components/ui/sonner.tsx";
import AddCandidate from "@/pages/add-candidate.tsx";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useIsAuthenticated();

    if (!isAuthenticated) {
        // Redirect to login or show unauthorized
        return <div>Please log in to continue.</div>;
    }

    return <>{children}</>;
};

// 1. Create a Root Layout with the Navbar INSIDE
const rootRoute = createRootRoute({
    component: () => (
        <MsalAuthenticationTemplate interactionType={InteractionType.Redirect}>
            <QueryClientProvider client={queryClient}>
            {/* Flex container creates the side-by-side layout */}
                <div className="flex w-full h-screen overflow-hidden">

                    {/* Fixed-width sidebar */}
                    <Navbar />

                    {/* Scrollable content area for your table */}
                    <main className="flex-1 overflow-y-auto bg-zinc-50">
                        <Toaster />
                        <Outlet />
                    </main>

                </div>
            </QueryClientProvider>
        </MsalAuthenticationTemplate>
    ),
})

// 2. Define your specific routes (Keep these as they were)
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Clients,
})
const candidatesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/candidates',
    component: Candidates,
})
const addCandidateRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/add-candidate',
    component: AddCandidate,
})

// 3. Create the router tree
const routeTree = rootRoute.addChildren([indexRoute, candidatesRoute, addCandidateRoute])
const router = createRouter({ routeTree })

// 4. Render ONLY the Provider
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <MsalProvider instance={msalInstance}>
        <RouterProvider router={router} />
        </MsalProvider>
    </React.StrictMode>
)