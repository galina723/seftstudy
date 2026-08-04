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

    const {
      category,
      title,
      question,
      options,
      answer,
    } = await req.json();


    if (!category || !title || !question || !options || !answer) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }


    let catRecord = await prisma.category.findUnique({
      where: {
        name: category,
      },
    });


    if (!catRecord) {
      catRecord = await prisma.category.create({
        data: {
          name: category,
        },
      });
    }


    const quiz = await prisma.quiz.create({
      data: {
        author: user.username,
        title,
        question,
        options: Array.isArray(options)
          ? options.join(",")
          : options,
        answer,
        categoryId: catRecord.id,
      },
    });


    return NextResponse.json(
      quiz,
      { status: 201 }
    );

  } catch (error) {
    console.error("CREATE QUIZ ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
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


    const quiz = await prisma.quiz.findFirst({
      where: {
        id,
      },
    });


    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }


    await prisma.quiz.delete({
      where: {
        id,
      },
    });


    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error("DELETE QUIZ ERROR:", error);

    return NextResponse.json(
      { error: "Delete quiz failed" },
      { status: 500 }
    );
  }
}