import express from 'express'
const router=express.Router()
import assignmentController from '../controllers/assignmentController.js'
import assignmentDeleteController from '../controllers/assignmentDeleteController.js'
import upload from '../helper/fileHelper.js'
//create new assignment
router.post('/assignment/create',upload.array('attachments',5),assignmentController.create);
//get all assignment data
router.get('/assignment/fetchAll',assignmentController.fetch)
//detail assignment
router.get('/assignment/detail/:id',assignmentController.detail)
//update assignment
router.patch('/assignment/update/:id',upload.array('attachments',5),assignmentController.update)
//delete assignment
router.delete('/assignment/delete/:assignmentId',assignmentDeleteController.deleteAssignment)
export default router;