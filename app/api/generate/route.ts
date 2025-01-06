import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, ImagesTable, UsersTable } from "@/lib/drizzle";
import { eq } from "drizzle-orm";
import { fal } from "@fal-ai/client";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fetch from "node-fetch";

if (!process.env.FAL_KEY) {
  throw new Error("FAL_KEY environment variable is not set");
}

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS credentials are not set");
}

// Configure fal client with the correct credentials format
fal.config({
  proxyUrl: "/api/fal/proxy",
  credentials: process.env.FAL_KEY,
});

// Configure S3 client for Tigris
const s3Client = new S3Client({
  endpoint: "https://fly.storage.tigris.dev",
  region: "auto",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has credits
    const [user] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.id, currentUser.id))
      .limit(1);

    if (!user || user.credits <= 0) {
      return new Response("Insufficient credits", { status: 403 });
    }

    const { prompt, negative_prompt, width, height } = await request.json();

    // Validate input
    if (!prompt || !width || !height) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate image using FAL.ai
    const result = await fal.subscribe("110602490-lora", {
      input: {
        prompt,
        negative_prompt: negative_prompt || "",
        model_name: "stabilityai/stable-diffusion-xl-base-1.0",
        image_size: width === height ? "square_hd" : "landscape_16_9",
        num_inference_steps: 30,
        guidance_scale: 7.5,
        seed: Math.floor(Math.random() * 2147483647),
      },
      pollInterval: 1000,
      logs: true,
      onQueueUpdate(update) {
        if (
          update.status === "IN_QUEUE" ||
          update.status === "IN_PROGRESS" ||
          update.status === "COMPLETED"
        ) {
          console.log("Queue update:", update.status);
        } else {
          console.error("Queue update failed:", update);
        }
      },
    });

    console.log("FAL response:", result);

    // Extract image URL from the correct response structure
    const imageUrl = result.data?.images?.[0]?.url;

    if (!imageUrl) {
      throw new Error("No image URL in response: " + JSON.stringify(result));
    }

    // Download image from FAL
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Generate unique filename with user ID prefix for better access control
    const filename = `${currentUser.id}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.png`;

    // Upload to Tigris S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: "ai-image-app",
        Key: filename,
        Body: Buffer.from(imageBuffer),
        ContentType: "image/png",
        Metadata: {
          userId: currentUser.id,
        },
      })
    );

    // TODO:
    // The maximum expiresIn is only 7 days
    // A better solution:
    // - Add an API endpoint to generate signed URLs on demand
    // - Store the filename instead of presigned URLs in the database
    // Generate a presigned URL that expires in 7 days

    const getObjectCommand = new GetObjectCommand({
      Bucket: "ai-image-app",
      Key: filename,
    });
    const presignedUrl = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: 604800,
    });

    // Use a transaction to ensure both operations succeed or fail together
    const dbResult = await db.transaction(async (tx) => {
      // Deduct credit first
      const [updatedUser] = await tx
        .update(UsersTable)
        .set({ credits: user.credits - 1 })
        .where(eq(UsersTable.id, currentUser.id))
        .returning();

      if (!updatedUser) {
        throw new Error("Failed to update credits");
      }

      // Then create the image
      const [newImage] = await tx
        .insert(ImagesTable)
        .values({
          user_id: currentUser.id,
          prompt,
          negative_prompt,
          width,
          height,
          image_url: presignedUrl,
        })
        .returning();

      return { user: updatedUser, image: newImage };
    });

    return NextResponse.json(dbResult);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
