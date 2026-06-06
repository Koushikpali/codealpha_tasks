const mongoose=require("mongoose");
const mailSender = require("../utils/mailSender");

const otp= new mongoose.Schema({
    email:{
        type:String,
        require:true
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        defaulkt:Date.now(),
        expires:5*60 
    }
    
});

async function sendVerificationEmail(email,otp) {
    try {
        const mailresponse=await mailSender(email,"verfication email from study notion",otp);
        console.log("email is sent",mailresponse)

    } catch (error) {
        console.log(("error occured while sending mails",error));
        throw error
        
    }
    
}

otp.pre('save',async function(next){
    console.log("NEW DOCUMENT SAVED TO DATABASE")

    if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
	next();


});

module.exports = mongoose.model('otp', otp);