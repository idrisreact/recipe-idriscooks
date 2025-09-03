"use client";
import { Button } from "../../../components/ui/button";
import Link from "next/link";

export default function HeroButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md">
      <Link href="/recipes" className="flex-1">
        <Button
          variant="icon"
          className="murakamicity-button w-full font-semibold text-base"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2"
          >
            <path
              d="M10 2C7.23858 2 5 4.23858 5 7C5 8.65685 6.34315 10 8 10H12C13.6569 10 15 8.65685 15 7C15 4.23858 12.7614 2 10 2Z"
              fill="currentColor"
            />
            <path
              d="M3 16C3 13.7909 6.58172 12 10 12C13.4183 12 17 13.7909 17 16V17C17 17.5523 16.5523 18 16 18H4C3.44772 18 3 17.5523 3 17V16Z"
              fill="currentColor"
            />
          </svg>
          Explore Recipes
        </Button>
      </Link>
      <Button
        variant="icon"
        className="murakamicity-button-outline w-full sm:flex-1 font-semibold text-base"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mr-2"
        >
          <path
            d="M10 2V4M10 16V18M4.22 4.22L5.64 5.64M14.36 14.36L15.78 15.78M2 10H4M16 10H18M4.22 15.78L5.64 14.36M14.36 5.64L15.78 4.22M10 6A4 4 0 1 1 6 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        View Ideas
      </Button>
    </div>
  );
}
