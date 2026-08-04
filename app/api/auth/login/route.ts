import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();


  let user = await prisma.user.findFirst({
    where: {
      username,
      password,
    },
  });


  // tạo sẵn 2 account demo
  if (!user) {

    if (
      (username === "yen" && password === "123456") ||
      (username === "thanh" && password === "123456")
    ) {
      user = await prisma.user.create({
        data: {
          username,
          password,
        },
      });
    }
  }


  if (!user) {
    return NextResponse.json(
      {
        message: "Sai tài khoản hoặc mật khẩu",
      },
      {
        status: 401,
      }
    );
  }


  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
    },
  });
}