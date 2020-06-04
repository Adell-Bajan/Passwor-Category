const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const passCatModel =require('../models/password_category')
const passModel =require('../models/add_password')
const LocalStrategy = require('passport-local').Strategy;
const { ensureAuthenticated } = require('../config/auth');
const getPasscat =passCatModel.find({});
const getAllPass =passModel.find({});



// Login router
router.get('/dashboard',ensureAuthenticated ,function(req, res) {
    var fullname = "";
    var email = "";
    var mobile = "";
    var city = "";
    res.render('dashboard', {
        name: req.user.name,
        fullname: fullname,
        email: email,
        mobile: mobile,
        city: city,
    });
});


// Login router
router.get('/', function(req, res) {
	var name=req.body.name
        res.render('index', {
            title: 'Password Management System',name,
        });
});

// Login Handle
router.post('/', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/',
        failureFlash: true
    })(req, res, next);
});






// Register router
router.get('/signup', function(req, res) {
	res.render('signup', {
		title: 'Password Management System',
	});
});

// router.get('/signup', function(req, res) {
// 	res.render('signup', {
// 		title: 'Password Management System',
// 	});
// });


// Register Handle
router.post('/signup', (req, res) => {
    const { name, email, password, confpassword } = req.body;
    let errors = [];

    // Check required fields
    if (!name || !email || !password || !confpassword) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    // Check passwords match
    if (password !== confpassword) {
        errors.push({ msg: 'Passwords do not match' });
    }

    // Check pass length
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('signup', {
            errors,
            name,
            email,
            password,
            confpassword
        });
    } else {
        // Validation passed
        User.findOne({ email: email })
            .then(user => {
                if (user && name) {
                    // User exists
                    errors.push({ msg: 'Email is already registered' });
                    res.render('signup', {
                        errors,
                        name,
                        email,
                        password,
						confpassword,
					});
					
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            // Set password to hashed
                            newUser.password = hash;
                            // Save user
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered and can log in');
                                    res.redirect('/');
                                    // console.log(newUser);
                                })
                                .catch(err => console.log(err));
                        }))

                }
            });
    }
});





router.get('/passwordCategory',ensureAuthenticated, function(req, res) {
	getPasscat.exec(function(err,data){
		if(err) throw err;
	res.render('password_category', {
		title: 'Password Management System',records:data
	});
});
})


// Route Delete Password Category
router.get('/passwordCategory/delete/:id',ensureAuthenticated, function(req, res) {
	var passcat_id=req.params.id;
	var passdelete=passCatModel.findByIdAndDelete(passcat_id);
	passdelete.exec(function(err){
		if(err) throw err;
	res.redirect('/passwordCategory')
	});
});


// Route get Update Password Category
router.get('/passwordCategory/edit/:id',ensureAuthenticated, function(req, res) {
	var passcat_id=req.params.id;
	var getpassCategory=passCatModel.findById(passcat_id);
	getpassCategory.exec(function(err,data){
		if(err) throw err;
		res.render('edit_pass_category', {
			title: 'Password Management System',records:data,id:passcat_id
		});
	});
});




// Route post Update Password Category
router.post('/passwordCategory/edit/',ensureAuthenticated, function(req, res) {
	var passcat_id=req.body.id;
	var passwordCategory=req.body.passwordCategory;
	var update_passCat=passCatModel.findByIdAndUpdate(passcat_id,{password_category:passwordCategory});
	update_passCat.exec(function(err,doc){
		if(err) throw err;
		res.redirect('/passwordCategory')
		});
	});







router.get('/add-new-category',ensureAuthenticated, function(req, res) {
	res.render('addNewCategory', {
		title: 'Password Management System'
	});
});



// Route Category
router.post('/add-new-category',ensureAuthenticated, function(req, res) {
	const {passwordCategory } = req.body;
	let errors = [];
	
	  // Check passwordCategory length
	  if (passwordCategory.length < 1) {
        errors.push({ msg: 'Enter Password Category Name' });
		}
		if (errors.length > 0) {
			res.render('addNewCategory', {
				errors,
				passwordCategory
			});
		}
		else{
			var passCatName =req.body.passwordCategory;
			var passcatDetails =new passCatModel({
				password_category:passCatName
			});
			passcatDetails.save(function(err,doc){
				if(err) throw err;
			req.flash('success_msg', 'Password category inserted Successfully');
			res.render('addNewCategory')
			})
		}
});

// Rout get add new password
router.get('/add-new-password',ensureAuthenticated, function(req, res) {
	getPasscat.exec(function(err,data){
		if(err)throw err;
		res.render('add-new-password', {
			title: 'Password Management System',records:data,
		});
	})
});




// Rout add new password
router.post('/add-new-password',ensureAuthenticated, function(req, res) {
	var pass_cat=req.body.pass_cat;
	var pass_details=req.body.pass_details;
	var project_name=req.body.project_name;
	var pass_details =new passModel({
		password_category:pass_cat,
		project_name:project_name,
		password_detail:pass_details
	});
		pass_details.save(function(err,doc){
			getPasscat.exec(function(err,data){
				if(err)throw err;
			
			else{
				req.flash('success_msg', 'Password category inserted Successfully');
						res.render('add-new-password', {
				title: 'Password Management System',records:data,
			});	
			}

		})
	})
});





// Copy view all password
// router.get('/view-all-password',ensureAuthenticated, function(req, res) {

// 	var perPage=3;
// 	var page =req.params.page || 1;

// 	getAllPass.skip((perPage * page) - perPage).limit(perPage).exec(function(err,data){
// 		if(err)throw err;
// 		passModel.countDocuments({}).exec((err,count)=>{
// 		res.render('view-all-password', {
// 			title: 'Password Management System',
// 			records:data,
// 			current:page,
// 			pages: Math.ceil(count / perPage)
// 		});
// 	})
// })
// });




// Copy view all password/** 
// router.get('/view-all-password/',ensureAuthenticated, function(req, res) {

// 	var perPage=3;
// 	var page = 1;

// 	getAllPass.skip((perPage * page) - perPage).limit(perPage).exec(function(err,data){
// 		if(err)throw err;
// 		passModel.countDocuments({}).exec((err,count)=>{
// 		res.render('view-all-password', {
// 			title: 'Password Management System',
// 			records:data,
// 			current:page,
// 			pages: Math.ceil(count / perPage)
// 		});
// 	})
// })
// });
// // Copy view all password
// router.get('/view-all-password/:page',ensureAuthenticated, function(req, res) {

// 	var perPage=3;
// 	var page =req.params.page || 1;

// 	getAllPass.skip((perPage * page) - perPage).limit(perPage).exec(function(err,data){
// 		if(err)throw err;
// 		passModel.countDocuments({}).exec((err,count)=>{
// 		res.render('view-all-password', {
// 			title: 'Password Management System',
// 			records:data,
// 			current:page,
// 			pages: Math.ceil(count / perPage)
// 		});
// 	})
// })
// });



router.get('/view-all-password/',ensureAuthenticated, function(req, res) {

		var options ={
			offset:1,
			limit:3
		};
			passModel.paginate({},options).then(function(result){
			console.log(result);
			res.render('view-all-password', {
				title: 'Password Management System',
				records:result.docs,
				current:result.offset,
				pages:Math.ceil(result.total / result.limit)
			});
		})
	})
// Copy view all password
router.get('/view-all-password/:page',ensureAuthenticated, function(req, res) {

	var perPage=3;
	var page =req.params.page || 1;

	getAllPass.skip((perPage * page) - perPage).limit(perPage).exec(function(err,data){
		if(err)throw err;
		passModel.countDocuments({}).exec((err,count)=>{
		res.render('view-all-password', {
			title: 'Password Management System',
			records:data,
			current:page,
			pages: Math.ceil(count / perPage)
		});
	})
})
});



// view all password
router.get('/password-detail',ensureAuthenticated, function(req, res) {
	res.redirect('/dashboard');
});


// view all password
router.get('/password-detail/eidt/:id',ensureAuthenticated, function(req, res) {
	var id=req.params.id;
	var getPassDetails =passModel.findById({_id:id});
	getPassDetails.exec(function(err,data){
		if(err)throw err;
		getPasscat.exec(function(err,data1){
		res.render('edit_password_detail', {
			title: 'Password Management System',records:data1,record:data
		});
	});
});
});


// view all password
router.post('/password-detail/eidt/:id',ensureAuthenticated, function(req, res) {
	var id=req.params.id;
	var passcat=req.body.pass_cat;
	var project_name=req.body.project_name;
	var pass_details=req.body.pass_details;
	passModel.findByIdAndUpdate(id,{password_category:passcat,project_name:project_name,password_detail:pass_details}).exec(function(err){
	if(err)throw err;	
	var getPassDetails=passModel.findById({_id:id});
	getPassDetails.exec(function(err,data){
		if(err)throw err;
		getPasscat.exec(function(err,data1){
		res.render('edit_password_detail', {
			title: 'Password Management System',records:data1,record:data
		});
	});
});
});
});



// Route get Update Password Category
router.get('/password-detail/delete/:id',ensureAuthenticated, function(req, res) {
	var id=req.params.id;
	var passdelete=passModel.findByIdAndDelete(id);
	passdelete.exec(function(err){
		if(err) throw err;
		res.redirect('/view-all-password/')
	});
});








// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
})



module.exports = router;