// JobDetailsPage.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SecondaryButton } from "../../components/common/buttons/SecondaryButton";

export default function JobDetailsPage({ job }) {
  const { jobId } = useParams();
  const navigate = useNavigate();

  if (!job) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No job passed for ID {jobId}.</p>
          <SecondaryButton onClick={() => navigate(-1)}>Go Back</SecondaryButton>
        </div>
      </div>
    );
  }

  const getTagColor = (type) => {
    switch (type) {
      case "Full-time": return "bg-green-100 text-green-700";
      case "Part-time": return "bg-yellow-100 text-yellow-700";
      case "Contract": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh] p-4">
      <div className="max-w-2xl w-full bg-white shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4">{job.title}</h1>

        <div className="flex flex-wrap gap-2 mb-4 text-sm">
          <span className="px-3 py-1 rounded-full border bg-gray-100 text-gray-700">
            {job.company || "Default Company"}
          </span>
          <span className="px-3 py-1 rounded-full border bg-blue-100 text-blue-700">
            {job.location || "Remote"}
          </span>
          <span className={`px-3 py-1 rounded-full border ${getTagColor(job.type)}`}>
            {job.type || "Full-time"}
          </span>
          <span className={`px-3 py-1 rounded-full border ${job.status === "filled" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {job.status ? job.status.charAt(0).toUpperCase() + job.status.slice(1) : "Open"}
          </span>
        </div>

        <p className="text-gray-700 mb-6">
          {/* Add more job details here if needed */}
          {/* Example: description or requirements */}
        </p>

        <div className="flex justify-end">
          <SecondaryButton onClick={() => navigate(-1)}>Back to Jobs</SecondaryButton>
        </div>
      </div>
    </div>
  );
}
