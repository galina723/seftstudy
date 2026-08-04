import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ username và password." },
        { status: 400 }
      );
    }

    // Kiểm tra username đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Username đã tồn tại." },
        { status: 409 }
      );
    }

    // Tạo tài khoản
    const user = await prisma.user.create({
      data: {
        username,
        password, // Project demo nên lưu trực tiếp
      },
      select: {
        id: true,
        username: true,
      },
    });

    return NextResponse.json(
      {
        message: "Đăng ký thành công.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Lỗi server." },
      { status: 500 }
    );
  }
}