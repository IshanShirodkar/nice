import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Inter } from "next/font/google";
import { SideNav } from "~/components/SideNav";

import { api } from "~/utils/api";
import Head from "next/head";

import "~/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Nice</title>
        <meta name = "description" content = "Positive Twitter Clone"/>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="container mx-auto flex items-start sm: pr-4">
        <SideNav/>
        <div className="min-h-screen flex-grow border-x">
          <Component {...pageProps}/>
        </div>
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
