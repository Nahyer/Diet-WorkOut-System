"use client";

import { usePathname } from "next/navigation";
import Footer from "./footer";
import Navbar from "./Navbar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isDashboard =
		pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
	return (
		<div className='flex min-h-screen flex-col'>
			<Navbar />
			<main className='flex-1'>{children}</main>
			{!isDashboard && <Footer />}
		</div>
	);
}
