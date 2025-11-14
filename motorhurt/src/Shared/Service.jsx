import axios from "axios";
//This value is essential to hit the right API endpoint.
const SendBirdApplicationId=import.meta.env.VITE_SENDBIRD_APP_ID;
const SendBirdApiToken=import.meta.env.VITE_SENDBIRD_APP_TOKEN;
//FormatResult function in detail — it’s an important helper that transforms raw data from the backend into a structure that's easier to use in the frontend UI.
//Formats the backend car listing + images into a flattened structure:
//Not related to Sendbird, but likely used in displaying listings on the frontend.

/*
Multiple items may have the same carLisiting.id, but different carImages.
🔍 What does FormatResult(resp) do?
This function:
Groups car images by car listing ID
Flattens the response into a clean structure:
Each car object contains a list of its images.
*/
const FormatResult=(resp)=>{
    let result=[];  // Used to group cars by listing ID
    let finalResult=[]; // Final array to return
    resp.forEach((item)=>{
        const listingId=item.carLisiting?.id;

          // Initialize a new car entry in result[] if not already there
        if(!result[listingId])
        {
            result[listingId]={
                car:item.carLisiting,
                images:[]
            }
        }

        // Push the image into that car’s image array
        if(item.carImages)
        {
            result[listingId].images.push(item.carImages)
        }
    })
   
    // Convert grouped objects into a flat array
    result.forEach((item)=>{
        finalResult.push({
            ...item.car,
            images:item.images
        })
    })
 
    return finalResult;
}
//Creates a new Sendbird user if they don’t already exist.
/*Registers a new Sendbird user via REST API.
Inputs:
user_id: unique ID (like your app user ID).
nickname: display name in chat.
profile_url: image/avatar.

*/
//https://api-'+SendBirdApplicationId+'.sendbird.com/v3/users'
const CreateSendBirdUser=async(userId,nickName,profileUrl)=>{
      if (!userId || !nickName) {
    console.error("❌ Missing required fields for SendBird user:", {
      userId,
      nickName,
    });
    return Promise.reject(new Error("Missing required SendBird user data"));
  }

  try {
    const response = await axios.get(
      `https://api-${SendBirdApplicationId}.sendbird.com/v3/users/${userId}`,
      {
        headers: {
          "Api-Token": SendBirdApiToken,
        },
      }
    );
    console.log(`✅ User ${userId} already exists.`);
    return response.data;
  } catch (err) {
    if (err.response?.status === 404) {
      console.log("📤 Creating user with:", { userId, nickName, profileUrl });
      try {
        return await axios.post(
          `https://api-${SendBirdApplicationId}.sendbird.com/v3/users`,
          {
            user_id: userId,
            nickname: nickName,
            profile_url: profileUrl,
            issue_access_token: false,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Api-Token": SendBirdApiToken,
            },
          }
        );
      } catch (creationError) {
        console.error("❌ Failed to create user:", creationError);
        throw creationError;
      }
    } else {
      console.error("❌ Error checking/creating user:", err);
      throw err;
    }
  }
}

//Creates a distinct 1-to-1 chat channel between a buyer and a seller.
/*
Key Points:
user_ids: Array of 2 user IDs (buyer and seller).
is_distinct: true: Ensures only 1 channel is created between the same users.
operator_ids: Sets the first user as the operator (can manage the channel).
*/
const CreateSendBirdChannel=async (users,title)=>{
    
      if (!Array.isArray(users) || users.length < 2 || users.some(u => !u)) {
    console.error("❌ Invalid user list for channel:", users);
    return Promise.reject(new Error("Invalid user list"));
  }
    /*return axios.post('https://api-'+SendBirdApplicationId+'.sendbird.com/v3/group_channels',{
        user_ids:users,
        is_distinct:true,//to make one to one channel
        name:title,
        operator_ids:[users[0]]
    },{
        headers:{
            'Content-Type':'application/json',
            'Api-Token':SendBirdApiToken
        }
    }) */

      const body = {
    user_ids: users,
    is_distinct: true
  };

  try {
    const { data } = await axios.post(
      `https://api-${SendBirdApplicationId}.sendbird.com/v3/group_channels`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          "Api-Token": SendBirdApiToken,
        },
      }
    );
    return data;
  } catch (err) {
    console.error("❌ Channel creation failed:", err.response?.data || err);
    throw err;
  }  
}

export default{
    FormatResult,
    CreateSendBirdUser,
    CreateSendBirdChannel
}