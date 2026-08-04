import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const userId = Number(req.headers.get("x-user-id"));

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }


    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Missing name" },
        { status: 400 }
      );
    }


    const category = await prisma.category.create({
      data: {
        name: name.trim(),
      },
    });


    return NextResponse.json(
      category,
      { status: 201 }
    );

  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);

    return NextResponse.json(
      { error: "Category already exists or invalid data" },
      { status: 400 }
    );
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const userId = Number(req.headers.get("x-user-id"));

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }


    const { searchParams } = new URL(req.url);

    const id = Number(searchParams.get("id"));


    if (!id) {
      return NextResponse.json(
        { error: "Missing category id" },
        { status: 400 }
      );
    }


    await prisma.category.delete({
      where: {
        id,
      },
    });


    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);

    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 400 }
    );
  }
}