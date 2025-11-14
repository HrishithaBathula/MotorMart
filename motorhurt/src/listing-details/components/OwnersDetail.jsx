import Service from '@/Shared/Service'
import { Button } from '@/components/ui/button'
//import { useUser } from '@clerk/clerk-react'
import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useUser, SignInButton } from '@clerk/clerk-react';

function OwnersDetail({carDetail}) {

  const { isSignedIn,user}=useUser();

  const navigation=useNavigate();

  /*const OnMessageOwnerButtonClick=async()=>{
      //  onClick={OnMessageOwnerButtonClick};
    const userId=user.primaryEmailAddress.emailAddress.split('@')[0];
    const ownerUserId=carDetail?.createdBy.split('@')[0];
    //Create Current User ID
      try{
        await Service.CreateSendBirdUser(userId,user?.fullName,user?.imageUrl)
        .then(resp=>{
          console.log(resp);
        })
      }catch(e){}
    // Owner User Id
      try{
        await Service.CreateSendBirdUser(ownerUserId,carDetail?.userName,carDetail?.userImageUrl)
        .then(resp=>{
          console.log(resp);
        })
      }catch(e){}
    // Create Channel
      try{
        await Service.CreateSendBirdChannel([userId,ownerUserId],carDetail?.listingTitle)
        .then(resp=>{
          console.log(resp);
          console.log("Chaneel Created");
          navigation('/profile');
        })
      }catch(e){}
  } */
 const OnMessageOwnerButtonClick = async () => {
  const userId = user?.primaryEmailAddress?.emailAddress?.split('@')[0];
  const userName = user?.fullName || "Guest";
  const userImage = user?.imageUrl || "";
  const ownerUserId = carDetail?.createdBy?.split('@')[0];
  const ownerName = carDetail?.userName || "Owner";
   const ownerImage = carDetail?.userImageUrl || "";
   console.log("Creating current user:", { userId, userName, userImage });
  console.log("Creating owner user:", { ownerUserId, ownerName, ownerImage });


  try {
    await Service.CreateSendBirdUser(userId, user?.fullName, user?.imageUrl);
    console.log("✅ Logged-in user created in SendBird");
  } catch (e) {
    console.error("❌ Error creating logged-in user in SendBird", e);
  }

  try {
    await Service.CreateSendBirdUser(ownerUserId, carDetail?.userName, carDetail?.userImageUrl);
    console.log("✅ Owner user created in SendBird");
  } catch (e) {
    console.error("❌ Error creating owner user in SendBird", e);
  }

  try {
    const channel = await Service.CreateSendBirdChannel([userId, ownerUserId], carDetail?.listingTitle);
    console.log("📢 Channel created:", channel);
    navigation('/profile');
  } catch (e) {
    console.error("❌ Error creating channel in SendBird", e);
  }
};

  return (
    <div className='p-10 border rounded-xl shadow-md mt-7'>
        <h2 className='font-medium text-2xl mb-3'>Owner/ Deals</h2>
        <img src={carDetail?.userImageUrl} className='w-[70px] h-[70px] rounded-full'/>
        <h2 className='mt-2 font-bold text-xl'>{carDetail?.userName}</h2>
        <h2 className='mt-2 text-gray-500'>{carDetail?.createdBy}</h2>

      {/*  <Button className="w-full mt-6"
        onClick={OnMessageOwnerButtonClick}
        >Message Owner</Button>  */}
          {isSignedIn ? (
        <Button className="w-full mt-6"
        onClick={OnMessageOwnerButtonClick}
        >Message Owner</Button>
      ) : (
        <SignInButton mode="modal">
          <Button>Message Owner</Button>
        </SignInButton>
      )}
    </div>
  )
}

export default OwnersDetail