import { NextResponse } from "next/server";
import { getForecastAction } from "@/app/actions/ai.actions";

export async function GET() {
  try {
    const data = await getForecastAction();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message === "UNAUTHORIZED" ? 401 : 500 });
  }
}
