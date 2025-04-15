const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/reporting_app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const reportSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Request', 'Komplain']
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Diproses', 'Selesai'],
        default: 'Pending'
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    handler: {
        type: String,
        default: null
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    comment: {
        type: String,
        default: null
    },
    updates: [{
        message: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Method untuk mendapatkan laporan berdasarkan periode
reportSchema.statics.getReportsByPeriod = async function(startDate, endDate) {
    return this.find({
        createdAt: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ createdAt: -1 });
};

// Method untuk ekspor data
reportSchema.statics.exportReports = async function(startDate, endDate) {
    const reports = await this.find({
        createdAt: {
            $gte: startDate,
            $lte: endDate
        }
    }).lean();

    return reports.map(report => ({
        'ID': report._id,
        'Tipe': report.type,
        'Judul': report.title,
        'Deskripsi': report.description,
        'Status': report.status,
        'Progress': report.progress + '%',
        'PIC': report.handler || 'Belum ditugaskan',
        'Rating': report.rating ? `${report.rating}/5` : '-',
        'Komentar': report.comment || '-',
        'User': report.userId,
        'Tanggal Dibuat': new Date(report.createdAt).toLocaleDateString('id-ID'),
        'Update Terakhir': report.updates.length > 0 
            ? new Date(report.updates[report.updates.length - 1].date).toLocaleDateString('id-ID')
            : '-'
    }));
};

const Report = mongoose.model('Report', reportSchema);

module.exports = { Report };
