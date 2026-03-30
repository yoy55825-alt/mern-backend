import express from "express"
const router=express.Router()
import submissionController from '../controllers/submissionController.js'
import upload from '../helper/fileHelper.js'
import {protect} from '../middleware/authMiddleware.js'
//fetch assignment
router.get('/assignment/fetchAll',submissionController.fetch)
//submit file upload 
router.post('/assignment/fileUpload/:assignmentId',upload.array('attachments',5),submissionController.submitFileAssignment)
//get assignment detail
router.get('/assignment/detail/:id',submissionController.getAssignmentById)
//fetch all submission
router.get('/submission/fetchAll',submissionController.fetchSubmission)
//submit online assignment
router.post('/submission/online/:assignmentId',submissionController.submitOnlineAssignment)
//fetch single user submissions
router.get('/submission/fetchSingle/:assignmentId',submissionController.fetchSingle)
//fetch single user submission using submissionId
router.get('/submission/fetch/subId/:submissionId',submissionController.fetchSubId)
//grade submission
router.patch('/submission/grade/:submissionId',submissionController.gradeSubmission)
export default router;