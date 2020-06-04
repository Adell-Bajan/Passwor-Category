const mongoose = require('mongoose');
const mogoosePaginate =require('mongoose-paginate');

const passSchema = new mongoose.Schema({
    password_category: {
        type: String,
        required: true
	},
	password_detail:{
		type:String,
		required:true
	},
	project_name:{
		type:String,
		required:true
	},
    date: {
        type: Date,
        default: Date.now
    }
});
passSchema.plugin(mogoosePaginate);
const passModel = mongoose.model('password_details', passSchema);

module.exports = passModel;