const Report = require('../models/Report');

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
    const { issue, description, location } = req.body;

    try {
        const reportData = {
            user: req.user.id,
            location,
            issue,
            description
        };

        const createdReport = await Report.create(reportData);
        res.status(201).json({
            ...createdReport,
            _id: createdReport.id // Keep _id for frontend compatibility
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private
const getReports = async (req, res) => {
    try {
        const reports = await Report.find({});
        // Map id to _id for frontend
        const mappedReports = reports.map(r => ({ ...r, _id: r.id }));
        res.json(mappedReports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in user reports
// @route   GET /api/reports/myreports
// @access  Private
const getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user.id });
        const mappedReports = reports.map(r => ({ ...r, _id: r.id }));
        res.json(mappedReports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update report status
// @route   PUT /api/reports/:id/status
// @access  Private (Admin/Volunteer)
const updateReportStatus = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (report) {
            const { status, completionNotes, completionBudget } = req.body;
            const { run } = require('../db');

            if (status === 'declined') {
                await run('UPDATE reports SET status = ?, assignedTo = NULL WHERE id = ?', [status, req.params.id]);
            } else if (status === 'resolved') {
                await run('UPDATE reports SET status = ?, completionNotes = ?, completionBudget = ? WHERE id = ?',
                    [status, completionNotes || '', completionBudget || '', req.params.id]);
            } else {
                await run('UPDATE reports SET status = ? WHERE id = ?', [status, req.params.id]);
            }

            const updatedReport = await Report.findById(req.params.id);
            res.json({ ...updatedReport, _id: updatedReport.id });
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get report statistics
// @route   GET /api/reports/stats
// @access  Private (Admin)
const getReportStats = async (req, res) => {
    try {
        const total = await Report.count();
        const pending = await Report.count({ status: 'pending' });
        const resolved = await Report.count({ status: 'resolved' });
        const investigating = await Report.count({ status: 'investigating' });

        res.json({ total, pending, resolved, investigating });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user's report statistics
// @route   GET /api/reports/my/stats
// @access  Private
const getMyReportStats = async (req, res) => {
    try {
        const total = await Report.count({ user: req.user.id });
        const resolved = await Report.count({ user: req.user.id, status: 'resolved' });

        res.json({ total, resolved });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign a report to a volunteer
// @route   PUT /api/reports/:id/assign
// @access  Private (Admin)
const assignReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (report) {
            const { assignedTo } = req.body;
            const { run } = require('../db');
            // When an admin assigns a task, reset the status back to 'pending' from 'declined' or others if applicable
            await run('UPDATE reports SET assignedTo = ?, status = ? WHERE id = ?', [assignedTo, 'pending', req.params.id]);

            const updatedReport = await Report.findById(req.params.id);
            res.json({ ...updatedReport, _id: updatedReport.id });
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assigned reports for a volunteer
// @route   GET /api/reports/assigned
// @access  Private (Volunteer)
const getAssignedReports = async (req, res) => {
    try {
        const reports = await Report.find({ assignedTo: req.user.id });
        const mappedReports = reports.map(r => ({ ...r, _id: r.id }));
        res.json(mappedReports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReport,
    getReports,
    getMyReports,
    updateReportStatus,
    getReportStats,
    getMyReportStats,
    assignReport,
    getAssignedReports
};
