import React from 'react';
import { House, LayoutDashboard, SquareKanban, Users } from 'lucide-react';
import { FloatingNav } from './ui/floating-navbar';

const Navbar = () => {
    const navItems = [
        {
            name : "Home",
            link : "/home",
            icon : <House className='h-4 w-4 text-neutral-500 dark:text-white'/>
        },
        {
            name : "Dahboard",
            link : "/dashboard",
            icon : <LayoutDashboard className='h-4 w-4 text-neutral-500 dark:text-white'/>
        },
        {
            name : "Communities",
            link : "/communities",
            icon : <Users className='h-4 w-4 text-neutral-500 dark:text-white'/>
        },
        {
            name : "Projects",
            link : "/projects",
            icon : <SquareKanban className='h-4 w-4 text-neutral-500 dark:text-white'/>
        }
    ]
    return (
        <>
            <FloatingNav navItems={navItems} className='h-10'/>
        </>
    );
}

export default Navbar;
