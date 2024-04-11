const model = require('../models/model.js');

// post: http://localhost:8080/api/categories
async function create_Categories(req,res){
    // res.json("Get Request from Categories")
    const Create = new model.Categories({
        type:"Investment",
        color: '#fcbe44' // dark
    })

    // await Create.save(function(err){
    //     if(!err) return res.json(Create);
    //     return res.status(400).json({message :`Error while Creating Categories ${err}`});
    // });

    await Create.save().then( result => {
        res.json(Create);
    }).catch( err=>{
        res.status(400).json({message :`Error while Creating Categories ${err}`});
    })
}

// get: http://localhost:8080/api/categories

async function get_Categories(req,res){
    let data= await model.Categories.find({})

    let filter =await data.map(v => Object.assign({},{type:v.type , color: v.color}));

    return res.json(filter);
}

// post: http://localhost:8080/api/transaction
async function create_Transaction(req,res){
    if(!req.body) return res.status(400).json("Post HTTP Data not Provided");
    let {name , type , amount} = req.body;

    const create= await new model.Transaction({
        name,
        type,
        amount,
        date : new Date()
    });

    create.save().then(result =>{
        res.json(create);
    }).catch(err=>{
        res.status(400).json({message : `Error while creating transaction ${err}`});
    })
    
}

// get: http://localhost:8080/api/transaction
async function get_Transaction (req, res){
    let data = await model.Transaction.find({});
    return res.json(data);
}

// delete: http://localhost:8080/api/transaction
async function delete_Transaction(req, res) {
    try {
        if (!req.body) {
            return res.status(400).json({ message: "Request body not found" });
        }

        await model.Transaction.deleteOne(req.body);

        res.json("Record Deleted...!");
    } catch (err) {
        res.json("Error while deleting Transaction Record");
    }
}

// get: http://localhost:8080/api/labels

async function get_labels(req, res) {
    try {
        const result = await model.Transaction.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            {
                $unwind: "$categories_info"
            }
        ]);
        let data = result.map(v=> Object.assign({},{ _id : v._id , name: v.name, type:v.type, amount: v.amount, color: v.categories_info['color']}));
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: "Error performing lookup operation", details: error.message });
    }
}


module.exports = {
    create_Categories,
    get_Categories,
    create_Transaction,
    get_Transaction,
    delete_Transaction,
    get_labels
}