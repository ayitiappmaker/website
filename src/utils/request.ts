import { NextResponse } from "next/server";

export const getUserId = (request: Request) => {
    const authorization = request.headers.get('authorization');
    if (!authorization) {
        return new NextResponse(
            JSON.stringify({ message: 'Unauthorized. Authorization required!' }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            }
          )
    }
    return authorization.split(' ')[1];
}