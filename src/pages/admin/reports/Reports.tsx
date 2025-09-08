import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MainLayout from "../../../components/layout/MainLayout";
const maxDate = new Date();
interface ReportRequest {
  reportType: string;
  startDate: string;
  endDate: string;
}

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reportTypes = [
    { value: "INCOME", label: "Income Report" },
    { value: "DISBURSEMENT", label: "Disbursement Report" },
    { value: "SUMMARY", label: "Summary Report" },
    { value: "DETAILED", label: "Detailed Report" },
    { value: "PAYMENTS", label: "Payments Report" },
    // { value: "ROLES", label: "Roles Report" },
  ];

  const handleDownloadReport = async () => {
    // Validation
    if (!reportType) {
      setError("Please select a report type");
      return;
    }
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after end date");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const requestData: ReportRequest = {
        reportType,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      };

      // Make API call to download report
       const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://tscfadmin.traversia.net' 
        : 'http://localhost:5029';
      
      const response = await fetch(`${baseUrl}/api/Reports/download`, {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      // Generate filename based on report type and dates
      const startDateStr = startDate.replace(/\//g, "-");
      const endDateStr = endDate.replace(/\//g, "-");
      link.download = `${reportType}_Report_${startDateStr}_to_${endDateStr}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess("Report downloaded successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download report");
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setReportType("");
    setStartDate("");
    setEndDate("");
    setError(null);
    setSuccess(null);
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
          Reports
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <AssessmentIcon sx={{ mr: 1, color: "#1e3a8a" }} />
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Generate Report
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    label="Report Type"
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    {reportTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                      max: maxDate.toISOString().split("T")[0],
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                   inputProps={{
                      max: maxDate.toISOString().split("T")[0],
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleDownloadReport}
                    disabled={loading}
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <DownloadIcon />
                    }
                    sx={{ minWidth: 150 }}
                  >
                    {loading ? "Downloading..." : "Download Report"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleResetForm}
                    disabled={loading}
                  >
                    Reset
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Report Types
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {reportTypes.map((type) => (
                  <Box
                    key={type.value}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: "#f5f5f5",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {type.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {type.value === "INCOME" && "Financial income data and analytics"}
                      {type.value === "DISBURSEMENT" && "Payment disbursement records"}
                      {type.value === "SUMMARY" && "Consolidated summary of all transactions"}
                      {type.value === "DETAILED" && "Comprehensive detailed transaction report"}
                      {type.value === "PAYMENTS" && "Consolidated summary of all transactions"}
                      {/* {type.value === "ROLES" && "Comprehensive detailed Roles report"} */}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 2, mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Instructions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                1. Select the type of report you want to generate
                <br />
                2. Choose the date range for the report
                <br />
                3. Click "Download Report" to generate and download the file
                <br />
                4. The report will be downloaded as a PDF file
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MainLayout>
  );
};

export default Reports;