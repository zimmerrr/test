const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.users_get_user = (req, res, next) => {
    User.find()
        .exec()
        .then(user => {
            const response = {
                count: user.length,
                users: user
            }
            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json({
                message: "Error in retrieving users",
                error: err
            });
        })
};

exports.users_profile_user = (req, res, next) => {

    try {
        const AUTH_TOKEN = req.body.token;
        if (!AUTH_TOKEN) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = AUTH_TOKEN;
        console.log("Received token:", token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);

        User.findOne({ _id: decoded.userId })
            .exec()
            .then(user => {
                res.status(200).json(user);
            })
            .catch(err => {
                res.status(500).json({
                    message: "Error in retrieving user information",
                    error: err
                });
            })
    } catch (error) {
        return res.status(500).json({
            message: "Error in validating token",
            error: error
        });
    }


}

exports.users_get_userById = (req, res, next) => {
    User.findOne({ _id: req.params.id })
        .exec()
        .then(user => {
            res.status(200).json(user);
        })
        .catch(err => {
            res.status(500).json({
                message: "Error in retrieving user by id",
                error: err
            })
        })
};

exports.users_create_user = (req, res, next) => {

    User.find({ $or: [{ username: req.body.username }, { employeeId: req.body.employeeId }] })
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "Username or Employee Id already exists"
                });
            }
            else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Error in hashing password",
                            error: err
                        });
                    }
                    else {
                        const userId = new mongoose.Types.ObjectId();

                        const user = new User({
                            _id: userId,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            middleName: req.body.middleName,
                            employeeId: req.body.employeeId,
                            division: req.body.division,
                            username: req.body.username,
                            password: hash,
                        })
                        user.save()
                            .then(doc => {
                                res.status(201).json({ doc });
                            })
                            .catch(err => {
                                res.status(500).json({
                                    message: "Error in creating user",
                                    error: err
                                });
                            });
                    }
                });
            }
        })
};

exports.users_login_user = (req, res, next) => {
    User.find({ username: req.body.username })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Invalid Username'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Invalid Password'
                    });
                }
                if (result) {
                    const token = jwt.sign({
                        userId: user[0]._id,
                        username: user[0].username,
                    },
                        process.env.JWT_SECRET, //private key
                        {
                            expiresIn: "2h" //key expires in 1 hour
                        }
                    )

                    return res.status(200).json({ token });
                }
                return res.status(401).json({
                    message: 'Login failed'
                });
            })
        })
        .catch(err => {
            console.log(err),
                res.status(500).json({
                    error: err
                })
        })

};

exports.users_token_validation = (req, res, next) => {
    try {
        const AUTH_TOKEN = req.body.token;
        if (!AUTH_TOKEN) {
            return res.status(401).json({ isValid: false });
        }

        const token = AUTH_TOKEN;
        console.log("Received token:", token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);

        return res.json({ isValid: true });
    } catch (error) {
        return res.status(500).json({ isValid: false });
    }
};

exports.users_archive_user = async (req, res, next) => {
    const id = req.params.id;
    const { isArchived } = req.body;
    if (typeof isArchived !== 'boolean') {
        return res.status(400).json({
            message: 'Invalid value for isArchived'
        });
    }
    try {
        const archiveUser = await User.findByIdAndUpdate(id, { isArchived }, { new: true });
        if (!archiveUser) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        return res.status(200).json({
            message: 'User archived successfully',
            user: archiveUser
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error in archiving user',
            error: error
        });
    }
};

