import { promises as fs } from "fs";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { openai, supabase } from "./config.js";

async function main() {
  try {
    const movies = await fs.readFile("./moviesDb.txt", "utf-8");

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 100,
      chunkOverlap: 10,
    });
    const chunks = await splitter.splitText(movies);

    const data = await Promise.all(
      chunks.map(async (textChunk) => {
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: textChunk,
        });
        return {
          content: textChunk,
          embedding: embeddingResponse.data[0].embedding, //Returned at embeddings.data[0].embedding)
        };
      }),
    );
    // Insert content and embedding into Supabase
    await supabase.from("documents").insert(data);
    console.log("Embedding complete!");
  } catch (error) {
    console.error("Error embedding and storing document:", error);
  }
}

main();
