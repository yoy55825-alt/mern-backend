import express from "express";
import userControllers from "../controllers/userController.js"
const router = express.Router()
import HandleRequestValidation from "../validation/HandleRequestValidation.js";
import { body } from "express-validator";
router.get('/hello',(req,res)=>{
    res.send("hello")
})
//create acc admin
router.post('/register',[
    body('name').notEmpty(),
    body('email').notEmpty(),
    body('password').notEmpty(),
],HandleRequestValidation,userControllers.register)
//user login 
router.post('/login',userControllers.login)
//get all users' data
router.get('/index',userControllers.index)
//delete user data
router.delete('/user/delete/:id',userControllers.delete)
//update user data
router.patch('/user/update/:id',[
    body('name').notEmpty(),
    body('email').notEmpty(),
],HandleRequestValidation,userControllers.update)
//single user detail information
router.get('/user/detail/:id',userControllers.detail)
//current user
router.get('/me',userControllers.getMe); 
//logout
router.post('/user/logout',userControllers.logout)

export default router;