import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-8 flex items-center justify-center font-[family-name:var(--font-geist-sans)]">
      <div className="p-8 rounded-lg shadow-lg max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-8">
        <div className="flex justify-center items-center w-full sm:w-1/2">
          {/* 
             Because it's in public/images/198550-200.png, 
             you can reference it at "/images/198550-200.png" 
           */}
          <Image
            src="/images/198550-200.png"
            alt="Lithuanian Image"
            width={300}
            height={300}
          />
        </div>

        <div className="flex flex-col gap-6 w-full sm:w-1/2 text-black">
          <h1 className="text-4xl font-bold">Vocab Voyage: Lithuanian</h1>
          <div className="border-t border-gray-400 my-4" />
          <p className="text-lg">Learn Lithuanian, Your Journey Begins Here!</p>
          <div className="border-t border-gray-400 my-4" />
          <div className="flex flex-col gap-4">
            <Link
              href="/signup"
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}