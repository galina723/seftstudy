import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = Number(req.headers.get("x-user-id"));

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const categories = await prisma.category.findMany();

    const notes = await prisma.note.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const lessons = await prisma.lesson.findMany({
      include: {
        category: true,
      },
    });

    const quizzes = await prisma.quiz.findMany({
      include: {
        category: true,
      },
    });


    const formattedLessons = lessons.map((l) => ({
      ...l,
      category: l.category.name,
    }));


    const formattedQuizzes = quizzes.map((q) => ({
      ...q,
      category: q.category.name,
      options: q.options.split(","),
    }));


    return NextResponse.json({
      categories,
      notes,
      lessons: formattedLessons,
      quizzes: formattedQuizzes,
    });

  } catch (error) {
    console.error("FETCH DATA ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}