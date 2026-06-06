const mailSender = require('../utils/mailSender');
const tags = require('../modeles/tags');

exports.tagmaker = async (req, res) => {
    try {
        // get tagname and description from request body
        const { name, description } = req.body;

        // validate
        if (!name) {
            return res.status(400).json({
                state: false,
                msg: 'Tag name is necessary'
            });
        }

        // check if tag already exists
        const tagAlready = await tags.findOne({ name });
        if (tagAlready) {
            return res.status(409).json({
                state: false,
                msg: 'Tag already exists'
            });
        }

        // save in db
        const tagDone = await tags.create({
            name,
            description,
            course:null
        });
        console.log('Tag created:', tagDone);

        return res.status(201).json({
            state: true,
            msg: 'Tag created',
            tag: tagDone
        });

    } catch (error) {
        // handle error
        res.status(500).json({
            state: false,
            msg: 'An error occurred while creating the tag',
            error: error.message
        });
    }
}


//getalltags

exports.showAlltags=async(req,res)=>{
    try {
        // Fetch all tags from the database
        const allTags = await tags.find({});
        return res.status(200).json({
            state: true,
            msg: 'All tags fetched successfully',
            tags: allTags
        });


    } catch (error) {
         res.status(500).json({
            state: false,
            msg: 'An error occurred while creating the tag',
            error: error.message
        });
        
    }
}
