import { NextResponse } from "next/server";

export const getUserId = (request: Request): string | null => {
    const authorization = request.headers.get('authorization');
    if (!authorization) {
        new NextResponse(
            JSON.stringify({ message: 'Unauthorized. Authorization required!' }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        return null;
    }
    return authorization.split(' ')[1];
}