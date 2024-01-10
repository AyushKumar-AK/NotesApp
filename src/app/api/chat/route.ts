import { notesIndex } from "@/lib/db/pinecone";
import openai, { getEmbedding } from "@/lib/openai";
import { error } from "console";
import { ChatCompletionMessage } from "openai/resources/index.mjs";
import {OpenAIStream, StreamingTextResponse} from "ai"
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db/prisma";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatCompletionMessage[] = body.messages;

    const messagesTruncated = messages.slice(-6);

    const embedding = await getEmbedding(
      messagesTruncated.map((message) => message.content).join("\n\n")
    );

    const {userId}= auth();

    const vectorQueryResponse = await notesIndex.query({
      vector: embedding,
      topK: 6,
      filter: {userId}
    });

    const relevantNotes = await prisma.note.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id),
        },
      },
    });

    const systemMessages: ChatCompletionMessage = {
        role: "assistant",
        content: "You are an intelligent chat bot do what you want to do" + "The relevant notes for this query are : \n"
        + relevantNotes.map((note) => 
        `Title: ${note.title} \n\n Content: \n ${note.content} \n`).join("\n\n"),
    }

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        stream: true,
        messages: [systemMessages, ...messagesTruncated]
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
