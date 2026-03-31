import Assignment from "../models/Assignments.js";
import mongoose from "mongoose";
import Submission from '../models/Submission.js'
const submisssionController = {
    fetch: async (req, res) => {
        try {
            const data = await Assignment.find().sort({ createdAt: -1 });
            return res.json({
                data
            })
        } catch (error) {
            console.log(error);

        }
    },
    submitFileAssignment: async (req, res) => {
        try {
            const { assignmentId } = req.params;
            const { studentId } = req.body;
            // Check if assignment exists and is active
            const assignment = await Assignment.findById(assignmentId);
            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: 'Assignment not found'
                });
            }

            // Check if assignment submission type is file
            if (assignment.submissionType !== 'file') {
                return res.status(400).json({
                    success: false,
                    message: 'This assignment does not accept file submissions'
                });
            }

            // Check if deadline has passed
            const now = new Date();
            const deadline = new Date(assignment.deadLine);
            const isLate = now > deadline;

            // Check if assignment is active
            if (assignment.status !== 'active') {
                return res.status(400).json({
                    success: false,
                    message: 'Assignment is not accepting submissions'
                });
            }
            const attachments = [];


            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    attachments.push({
                        fileName: file.originalname,
                        fileUrl: file.location,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        fileKey: file.key
                    });
                });
            }
            console.log(attachments);
            const data = {
                assignmentId,
                studentId,
                submissionType: 'file',
                attachments,
                submittedAt: new Date(),
                isLate: isLate,
                status: isLate ? 'late' : 'submitted'

            }
            let existingSubmission = await Submission.findOne({
                assignmentId,
                studentId
            });
            if (existingSubmission) {
                return res.json({
                    message: "assignment is already submitted"
                })
            }
            const submission = await Submission.create(data);
            assignment.status = 'submitted';
            await assignment.save();

            return res.status(201).json({
                success: true,
                message: 'File submitted successfully',
                data: submission
            });


        } catch (error) {
            console.error('Error in file submission:', error);
            return res.status(500).json({
                success: false,
                message: 'Error submitting file',
                error: error.message
            });
        }
    },
    getAssignmentById: async (req, res) => {
        try {
            const id = req.params.id;

            const assignment = await Assignment.findById(id);

            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: 'Assignment not found'
                });
            }

            // Optional: Check if assignment is for this student
            // const student = req.user;
            // if (assignment.targetYear !== student.year ||
            //     assignment.targetMajor !== student.major ||
            //     assignment.targetSemester !== student.semester) {
            //     return res.status(403).json({
            //         success: false,
            //         message: 'You are not authorized to view this assignment'
            //     });
            // }

            return res.status(200).json({
                success: true,
                data: assignment
            });

        } catch (error) {
            console.error('Error fetching assignment:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching assignment',
                error: error.message
            });
        }
    },
    //fetch all submission
    fetchSubmission: async (req, res) => {
        try {
            const data = await Submission.find().sort({ 'createdAt': 1 }).populate("assignmentId", "title");
            res.status(200).json({
                data
            })
        } catch (error) {
            return res.status(500).json({
                messaage: 'error fetching submissions'
            })
        }
    },
    // submitting online assignments
    submitOnlineAssignment: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { assignmentId } = req.params;
            const { answers, timeSpent } = req.body;
            const { studentId } = req.body; // Assuming authentication middleware sets req.user

            // 1. Validate input
            if (!answers || !Array.isArray(answers)) {
                return res.status(400).json({
                    success: false,
                    message: "Answers array is required"
                });
            }

            // 2. Fetch assignment with questions
            const assignment = await Assignment.findById(assignmentId).session(session);

            if (!assignment) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({
                    success: false,
                    message: "Assignment not found"
                });
            }

            // 3. Check if assignment is still accepting submissions
            const now = new Date();
            const deadline = new Date(assignment.deadLine);
            const isLate = now > deadline;
            const isClosed = assignment.status === 'closed';

            if (isClosed) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: "This assignment is closed and no longer accepting submissions"
                });
            }

            // 4. Check if student already submitted
            let existingSubmission = await Submission.findOne({
                assignmentId,
                studentId
            }).session(session);

            let attemptsCount = 1;
            if (existingSubmission) {
                // Allow resubmission - update existing
                attemptsCount = (existingSubmission.onlineSubmission?.attemptsCount || 0) + 1;
            }

            // 5. Process answers and calculate score
            const processedAnswers = [];
            let totalEarnedPoints = 0;
            const totalPoints = assignment.totalPoints || assignment.questions.length;

            for (const submittedAnswer of answers) {
                // Find the corresponding question from assignment
                const question = assignment.questions.find(
                    q => q._id.toString() === submittedAnswer.questionId
                );

                if (!question) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({
                        success: false,
                        message: `Question with id ${submittedAnswer.questionId} not found`
                    });
                }

                let isCorrect = false;
                let pointsEarned = 0;
                let processedAnswer = submittedAnswer.answer;

                // Handle different question types
                switch (question.questionType) {
                    case 'true_false':
                        // For true/false, answer should be boolean
                        const studentBoolean = submittedAnswer.answer === true ||
                            submittedAnswer.answer === 'true' ||
                            submittedAnswer.answer === 'True';
                        isCorrect = studentBoolean === question.correctBoolean;
                        pointsEarned = isCorrect ? question.points : 0;
                        processedAnswer = studentBoolean;
                        break;

                    case 'multiple_choice':
                        const correctOption = question.options.find(opt => opt.isCorrect);
                        isCorrect = submittedAnswer.answer === correctOption.optionId;

                        pointsEarned = isCorrect ? question.points : 0;
                        break;

                    case 'short_answer':
                        // For short answer, check against correct answers (case insensitive)
                        if (question.correctAnswers && question.correctAnswers.length > 0) {
                            isCorrect = question.correctAnswers.some(
                                correct => correct.toLowerCase() === submittedAnswer.answer?.toLowerCase()
                            );
                        }
                        pointsEarned = isCorrect ? question.points : 0;
                        break;

                    case 'essay':
                        // Essay questions need manual grading
                        isCorrect = false;
                        pointsEarned = 0;
                        break;

                    case 'fill_blank':
                        // For fill in the blank
                        if (question.correctAnswers && question.correctAnswers.length > 0) {
                            isCorrect = question.correctAnswers.some(
                                correct => correct.toLowerCase() === submittedAnswer.answer?.toLowerCase()
                            );
                        }
                        pointsEarned = isCorrect ? question.points : 0;
                        break;

                    default:
                        pointsEarned = 0;
                }

                totalEarnedPoints += pointsEarned;

                processedAnswers.push({
                    questionId: submittedAnswer.questionId,
                    answer: processedAnswer,
                    isCorrect,
                    pointsEarned,
                    submittedAt: new Date()
                });
            }

            // 6. Calculate percentage
            const percentage = totalPoints > 0 ? (totalEarnedPoints / totalPoints) * 100 : 0;

            // 7. Prepare submission data
            const submissionData = {
                assignmentId,
                studentId,
                submissionType: 'online',
                onlineSubmission: {
                    answers: processedAnswers,
                    score: {
                        earned: totalEarnedPoints,
                        total: totalPoints,
                        percentage
                    },
                    completedAt: new Date(),
                    timeSpent: timeSpent || 0,
                    attemptsCount
                },
                submittedAt: new Date(),
                isLate,
                status: 'submitted'
            };

            // 8. Auto-grade if all questions are auto-gradable (no essay questions)
            const hasEssayQuestions = assignment.questions.some(q => q.questionType === 'essay');
            if (!hasEssayQuestions) {
                submissionData.status = 'graded';
                submissionData.grade = {
                    score: totalEarnedPoints,
                    gradedAt: new Date(),
                    feedback: "Auto-graded submission"
                };
            }

            //finally post the submission
            const submission = new Submission(submissionData);
            await submission.save({ session });


            // 10. Update assignment status to 'submitted' for this student
            // (Optional: If you track individual student submission status in assignment)

            await session.commitTransaction();
            session.endSession();

            // 11. Return response
            return res.status(200).json({
                success: true,
                message: existingSubmission ? "Assignment resubmitted successfully" : "Assignment submitted successfully",
                data: {
                    submissionId: submission._id,
                    score: totalEarnedPoints,
                    totalPoints,
                    percentage,
                    status: submission.status,
                    isLate,
                    attemptsCount,
                    answers: processedAnswers.map(a => ({
                        questionId: a.questionId,
                        isCorrect: a.isCorrect,
                        pointsEarned: a.pointsEarned
                    }))
                }
            });

        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            console.error("Error submitting assignment:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to submit assignment",
                error: error.message
            });
        }
    },
    fetchSingle: async (req, res) => {
        try {
            const { assignmentId } = req.params;
            const { studentId } = req.query;
            console.log(assignmentId, studentId);

            // Validate required fields
            if (!assignmentId || !studentId) {
                return res.status(400).json({
                    message: "Assignment ID and Student ID are required"
                });
            }

            const submissions = await Submission.find({
                assignmentId,
                studentId
            });

            // Return the first submission if exists, or null
            const submission = submissions.length > 0 ? submissions[0] : null;

            return res.status(200).json({
                success: true,
                data: submission,
                exists: submission !== null
            });

        } catch (error) {
            console.error('Error fetching submission:', error);
            return res.status(500).json({
                success: false,
                message: "Error fetching submission"
            });
        }
    },
    fetchSubId: async (req, res) => {
        try {
            const { submissionId } = req.params;
            const submission = await Submission.find({ _id: submissionId });
            return res.status(200).json({
                submission
            })
        } catch (error) {
            return res.status(500).json({
                message: "internal server error"
            })
        }
    },
    gradeSubmission : async (req, res) => {
        try {
            const { submissionId } = req.params;
            const { score, feedback, status, gradedAt } = req.body;

            // Validate submissionId
            if (!submissionId) {
                return res.status(400).json({
                    success: false,
                    message: 'Submission ID is required'
                });
            }

            // Validate score
            if (score === undefined || score === null) {
                return res.status(400).json({
                    success: false,
                    message: 'Score is required'
                });
            }

            // First check if submission exists
            const existingSubmission = await Submission.findById(submissionId);
            if (!existingSubmission) {
                return res.status(404).json({
                    success: false,
                    message: 'Submission not found'
                });
            }

            // Prepare update object
            const updateData = {
                'grade.score': score,
                'grade.feedback': feedback || '',
                'grade.gradedAt': gradedAt || new Date().toISOString(),
                status: status || 'graded'
            };

            // Add gradedBy if user is authenticated
            if (req.user && req.user._id) {
                updateData['grade.gradedBy'] = req.user._id;
            }

            // Update the submission
            const updatedSubmission = await Submission.findByIdAndUpdate(
                submissionId,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!updatedSubmission) {
                return res.status(404).json({
                    success: false,
                    message: 'Submission not found or update failed'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Submission graded successfully',
                data: updatedSubmission
            });

        } catch (error) {
            console.error('Error in gradeSubmission:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to grade submission',
                error: error.message
            });
        }
    }
}

export default submisssionController;