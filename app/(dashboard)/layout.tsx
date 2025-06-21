'use client'
import Navbar from "../components/layout/Navbar";

import { ReactNode } from "react";
import { MenteeProvider } from "../context/menteeContext";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <MenteeProvider>
      {children}
        </MenteeProvider>
      </main>
    </div>
  );
};

export default DashboardLayout;