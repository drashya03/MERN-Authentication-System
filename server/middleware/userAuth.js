import jwt from "jsonwebtoken"


// next is nest function after completing userAuth it will
// execute the authcontroller
// 


// this fun find token  from the cookie
// then userId from token


const userAuth = async(req,res,next) => {

    const {token} = req.cookies;

    
    if(!token){
        return res.json({success: false, message:'Not Authorized. Login again'})
    }

    try {

        // decode the token to find id
       const tokenDecode =  jwt.verify(token, process.env.JWT_SECRET);
        
        // from the above decoded token find the id
        // because for creating the  token we have used userID

        if(tokenDecode.id){
            req.body = req.body || {};
            req.body.userId = tokenDecode.id;
            // req.body.userId = tokenDecode.id
        }
        else{
            return res.json({success: false, message:'Not Authorized. Login again'})
        }
        // call controller fun
        next();

    } catch (error) {
       return res.json({success: false, message:error.message})
    }

    

}

export default userAuth;