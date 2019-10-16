const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const nodemailer = require('nodemailer');


// @route    POST api/users/register
// @desc     Register user and sends verification email
// @access   Public
exports.register = async (req, res) => {
    
    const { name, email, password } = req.body;
  
    try {
        let user = await User.findOne({ email });

        if (user) {
            return res
            .status(400)
            .json({ errors: [{ msg: 'User already exists' }] });
        }

        user = new User({
            name,
            email,
            password
        });

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);
        user.verification_key = await User.generateKey();

        await user.save();

        let transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            auth: {
                user: config.email.user,
                pass: config.email.pass
            }
        });

        let info = await transporter.sendMail({
            from: 'CMS <cms@example.com>',
            to: user.email, 
            subject: 'Email verification',
            html: `<b>Please validate your email</b> <br> <a href="http://localhost:4200/verification/${user.verification_key}/${user.email}">http://localhost:4200/verification/${user.verification_key}/${user.email}</a>`
        });

        res.json({
          success:true
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
}



// @route    POST api/users/login
// @desc     Authenticate user & get token
// @access   Public
exports.login = async (req, res) => {

    const { email, password } = req.body;
    
    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const payload = {
        user: {
          id: user.id,
          verified: user.verified
        }
      };

      jwt.sign(payload, config.jwtSecret, { expiresIn: 360000 }, (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
}

// @route    GET api/users/profile
// @desc     Returns user object based on JWT token
// @access   Private
exports.profile = async (req, res) => {
    console.log(req.user);

    let user = await User.findOne({ _id:req.user.id });
    res.json({data:user});
}

// @route    POST api/users/validate
// @desc     Verify user email
// @access   Public
exports.verify = async (req, res) => {

  const { email, key } = req.body;

  try {

    let user = await User.findOne({email, verification_key:key});
    
    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid verification key or email' }] });
    }

    user.verified = true;
    await user.save();

    res.json({
      success:true
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}


// @route    POST api/users/reset-password
// @desc     Send password reset email
// @access   Public
exports.resetPassword = async (req, res) => {

  const { email } = req.body;

  try {

    let user = await User.findOne({email});

    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Entered email doesn't exist in our database." }] });
    }

    user.password_reset_key = await User.generateKey();

    await user.save();

    let transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        auth: {
            user: config.email.user,
            pass: config.email.pass
        }
    });

    let info = await transporter.sendMail({
        from: 'CMS <cms@example.com>',
        to: user.email, 
        subject: 'Password reset',
        html: `<b>Please reset your password on link:</b> <br> <a href="http://localhost:4200/password/reset/${user.password_reset_key}/${user.email}">http://localhost:4200/password/reset/${user.password_reset_key}/${user.email}</a>`
    });


    res.json({
      success:true
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}


// @route    POST api/users/reset-password-verify
// @desc     Verify key and email for password reset
// @access   Public
exports.resetPasswordVerify = async (req, res) => {

  const { email, key } = req.body;

  try {

    let user = await User.findOne({email, password_reset_key:key});

    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Invalid verification key or email." }] });
    }

    res.json({
      success:true
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}


// @route    POST api/users/reset-password-submit
// @desc     Save new password to database
// @access   Public
exports.resetPasswordSubmit = async (req, res) => {

  const { email, password } = req.body;

  try {

    let user = await User.findOne({email});

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.json({
      success:true
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}