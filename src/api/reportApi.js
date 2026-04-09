import axios from "./axios";

// body: { targetId, targetType, reason, details }
export const createReport       = (data)       => axios.post("/reports/create", data);

// Admin: get all reports
export const getAllReports       = ()           => axios.get("/reports/");

// Admin: get reports for a specific target (post or comment id)
export const getReportsByTarget = (targetId)   => axios.get(`/reports/${targetId}`);

// User: get reports submitted by logged-in user
export const getReportsByUser   = ()           => axios.get("/reports/me");

// Admin: update report status — PATCH not PUT
export const updateReportStatus = (reportId, data) =>
  axios.patch(`/reports/${reportId}`, data);

// Admin: delete a report
export const deleteReport       = (reportId)   => axios.delete(`/reports/${reportId}`);
