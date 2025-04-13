import React from 'react';
import { cn } from "@/lib/utils";

interface AvatarProps {
  src: string;
  alt: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, className }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        "w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-khetyar-olive", // Added border color
        className
      )}
    />
  );
};

export default Avatar;