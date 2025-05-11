'use client';
import Link from 'next/link';

const Logo = ({ href = '/dashboard' }) => {
  return (
    <Link href={href} className="text-white-text text-3xl font-bold">
      <span>amMENT</span>
      <span className="text-primary-yellow">&lt;</span>
      <span className="text-primary-yellow">&gt;</span>
      <span>R</span>
    </Link>
  );
};

export default Logo;