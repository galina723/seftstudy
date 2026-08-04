import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = Number(request.headers.get("x-user-id"));

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const notes = await prisma.note.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(notes);

  } catch (error) {
    console.error("GET NOTES ERROR:", error);

    return NextResponse.json(
      { error: "Fetch notes failed" },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const userId = Number(request.headers.get("x-user-id"));

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Missing content" },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        content,
        userId,
      },
    });

    return NextResponse.json(note);

  } catch (error) {
    console.error("CREATE NOTE ERROR:", error);

    return NextResponse.json(
      { error: "Create note failed" },
      { status: 500 }
    );
  }
}


export async function PUT(request: NextRequest) {
  try {
    const userId = Number(request.headers.get("x-user-id"));

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, content } = await request.json();

    const note = await prisma.note.findFirst({
      where: {
        id: Number(id),
        userId,
      },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.note.update({
      where: {
        id: Number(id),
      },
      data: {
        content,
      },
    });

    return NextResponse.json(updated);

  } catch (error) {
    console.error("UPDATE NOTE ERROR:", error);

    return NextResponse.json(
      { error: "Update note failed" },
      { status: 500 }
    );
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const userId = Number(request.headers.get("x-user-id"));

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const id = Number(searchParams.get("id"));

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    await prisma.note.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error("DELETE NOTE ERROR:", error);

    return NextResponse.json(
      { error: "Delete note failed" },
      { status: 500 }
    );
  }
}