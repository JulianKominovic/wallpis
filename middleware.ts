import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  console.log([...request.headers.entries()]);
  NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/wallpapers/:rest*",
};
