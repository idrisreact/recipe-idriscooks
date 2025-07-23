import { NextRequest,NextResponse } from "next/server";

type TopUpRequest = {
  amount: TopUpAmount;
  userId: string;
} 

type TopUpAmount = 5 | 10 | 20 | 30;

type User = {
  userId: string;
  name: string;
  email: string;
  balance: number;
};

export const user : User = {
  userId: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  balance: 0,
};

const validateTopUpAmount = (amount: TopUpAmount) => {
  if (amount !== 5 && amount !== 10 && amount !== 20 && amount !== 30) {
    return false;
  }
  return true;
};

export async function POST(request: NextRequest) {
  const { amount,userId }:TopUpRequest = await request.json();

  if (!validateTopUpAmount(amount)) {
    return NextResponse.json({ message: "Invalid top up amount" }, { status: 400 });
  }

  if (user.userId !== userId) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }


  user.balance += amount;

  return NextResponse.json({ message: "Top up successful",balance:user.balance }, { status: 200 });
}