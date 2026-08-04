import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {
  try {
    const { username, author, category, title, content } = await req.json();

    const userName = username || author;

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


    const lesson = await prisma.lesson.create({
      data: {
        author: userName,
        title,
        content,
        categoryId: catRecord.id,
      },
    });


    return NextResponse.json(lesson, {
      status: 201,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to create lesson",
      },
      {
        status: 400,
      }
    );
  }
}



export async function PUT(req: Request) {
  try {

    const {
      id,
      category,
      title,
      content,
    } = await req.json();


    if (!id) {
      return NextResponse.json(
        {
          error: "Missing id",
        },
        {
          status:400,
        }
      );
    }


    let catRecord = await prisma.category.findUnique({
      where:{
        name:category
      }
    });


    if(!catRecord){
      catRecord = await prisma.category.create({
        data:{
          name:category
        }
      });
    }



    const lesson = await prisma.lesson.update({
      where:{
        id:Number(id)
      },

      data:{
        title,
        content,
        categoryId:catRecord.id
      }
    });



    return NextResponse.json(lesson);


  } catch(error){

    console.error("UPDATE LESSON ERROR:",error);

    return NextResponse.json(
      {
        error:"Failed to update lesson"
      },
      {
        status:400
      }
    );

  }
}




export async function DELETE(req:Request){

  try{

    const {searchParams}=new URL(req.url);

    const id=Number(searchParams.get("id"));


    await prisma.lesson.delete({
      where:{
        id
      }
    });


    return NextResponse.json({
      success:true
    });


  }catch(error){

    return NextResponse.json(
      {
        error:"Failed to delete lesson"
      },
      {
        status:400
      }
    );

  }

}