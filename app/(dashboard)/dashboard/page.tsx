'use client';

import { useAuth } from "@/app/context/authcontext";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import MenteeDashboard from "./(dashboards)/Mentee";
import MentorDashboard from "./(dashboards)/Mentor";

const DashboardPage = () => {
    const { userRole, isLoggedIn } = useAuth();
    const router = useRouter();
    const ismentor = userRole === 'Mentor';

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/');
            return;
        }
    }, [isLoggedIn, router]);

    if (!isLoggedIn) {
        return null; 
    }

    return ismentor ? <MentorDashboard /> : <MenteeDashboard />;
};

export default DashboardPage;