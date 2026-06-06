const mail=require('../utils/mailSender')
const {contactUsEmail}=require('../mail/contactFormRes')

exports.contactUsController=async(req,res)=>{
    const {email,firstname,lstname,message,phoneNo,countrycode}=req.body
    try{
        const emailans=mail(email,"your  Data send successfully",contactUsEmail(email,firstname,lstname,message,phoneNo,countrycode))
         return res.json({
            success:true,
            message:"email send successfully",
         })

    }
    catch (error) {
    console.log("Error", error)
    console.log("Error message :", error.message)
    return res.json({
      success: false,
      message: "Something went wrong...",
    })
    }
}