import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import Assignment from "../models/Assignments.js";

dotenv.config();

const s3 = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: process.env.B2_REGION || "us-west-002",
  credentials: {
    accessKeyId: process.env.B2_APPLICATION_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
  forcePathStyle: true,
});

const assignmentDeleteController = {
  deleteAssignment: async (req, res) => {
    try {
      const { assignmentId } = req.params;

      // 1. Find assignment
      const assignment = await Assignment.findById(assignmentId);

      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      // 2. Delete all attachments from Backblaze
      if (assignment.attachments && assignment.attachments.length > 0) {
        console.log(`Found ${assignment.attachments.length} attachments to delete`);

        for (const attachment of assignment.attachments) {
          if (attachment.fileKey) {
            try {
              const deleteCommand = new DeleteObjectCommand({
                Bucket: process.env.B2_BUCKET_NAME,
                Key: attachment.fileKey, 
              });
            } catch (deleteError) {
              console.error("Delete failed:", {
                error: deleteError.message,
                name: deleteError.name,
                code: deleteError.Code,
                statusCode: deleteError.$metadata?.httpStatusCode
              });
            }
          }
        }
      }
      const deletedAssignment = await Assignment.findByIdAndDelete(assignmentId);

      return res.status(200).json({ message: "Assignment deleted successfully", data: deletedAssignment });

    } catch (e) {
      console.error(e);

      return res.status(500).json({
        error: e.message,
      });
    }
  },
};

export default assignmentDeleteController;
