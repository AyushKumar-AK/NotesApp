import Image from "next/image";
import logo from "@/assests/logo.jpg"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  // const{userId}= auth();

  // if (userId) redirect("/notes");

  return (
    <main className="flex flex-col h-screen items-center justify-center gap-5">
      <div className="flex items-center gap-4">
        <Image src={logo} alt="NotesApp Logo" width={100} height={100} />
        <span className="font-extrabold tracking-tight text-4xl lg:text-5xl">NotesApp</span>
      </div>
      <p className="max-w-prose text-center">
        An intelligent note taking app with an AI assistant to help you take notes, built with OpenAI,
        Pinecone, Next.js, Clerk and more.
      </p>
      <Button size="lg" asChild>
        <Link href="/notes">Open</Link>
        </Button>
    </main>
  )
}