import { NextResponse } from "next/server"

export async function POST(request){
    try {
        const {name,sellerCode,phone,email,physicalAddress,contactPerson,contactPersonPhone,terms,notes}=await request.json()
        const newSeller = {name,sellerCode,phone,email,physicalAddress,contactPerson,contactPersonPhone,terms,notes}
        console.log(newSeller)
        return NextResponse.json(newSeller)
    } catch (error) {
        console.log(error)
        return NextResponse.json({
            message: "Adding Seller Failed !",
            error
        },{status:500})
  }
}