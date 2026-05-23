import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router'
import './index.css'
import Home from "@/pages/home.tsx";
import ForensicAudit from "@/pages/audit.tsx";
import About from "@/pages/about.tsx";
import Navbar from "@/components/navbar.tsx";
import Cms from "@/pages/cms.tsx";
import EditPodcast from "@/pages/edit.tsx";

// 1. Create a Root Layout with the Navbar INSIDE
const rootRoute = createRootRoute({
    component: () => (
        <>
            {/* The Navbar is now inside the Router context! */}
            {/*<Navbar />*/}

            {/* This is where your pages (Home, Audit, About) will render */}
            <main >
                <Outlet />
            </main>
        </>
    ),
})

// 2. Define your specific routes (Keep these as they were)
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Cms,
})

const auditRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/audit/$auditId',
    component: ForensicAudit,
})

const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/about',
    component: About,
})

const cmsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/cms',
    component: Cms,
})

const editRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/edit/$auditId',
    component: EditPodcast,
})

// 3. Create the router tree
const routeTree = rootRoute.addChildren([indexRoute, auditRoute, aboutRoute, editRoute, cmsRoute])
const router = createRouter({ routeTree })

// 4. Render ONLY the Provider
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)