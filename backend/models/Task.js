import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true,
        maxLength: 200
    },
    description: {
        type: String,
        trim: true,
        maxLength: 1000
    },
    type: { 
        type: String, 
        enum: ["inperson", "remote"], 
        required: true 
    },
    urgency: { 
        type: String, 
        enum: ["low", "medium", "high"], 
        required: true 
    },
    peopleRequired: { 
        type: Number, 
        default: 1, 
        min: 1,
        max: 100
    },
    skillsRequired: [{
        skill: {
            type: String,
            trim: true
        },
        count: {
            type: Number,
            min: 1,
            default: 1
        }
    }],
    reward: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    autoIncrement: { 
        type: Boolean, 
        default: false 
    },
    maxCap: { 
        type: Number, 
        default: 0,
        min: 0
    },
    location: {
        address: {
            type: String,
            trim: true
        },
        lat: {
            type: Number,
            min: -90,
            max: 90
        },
        lng: {
            type: Number,
            min: -180,
            max: 180
        }
    },
    notes: {
        type: String,
        trim: true,
        maxLength: 500
    },
    postedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true,
        index: true
    },
    assignedTo: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }],
    status: { 
        type: String, 
        enum: ["open", "assigned", "completed", "cancelled"], 
        default: "open", 
        index: true 
    },
    views: {
        type: Number,
        default: 0,
        min: 0
    },
    meta: {
        type: Object,
        default: {}
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Compound indexes for efficient querying
taskSchema.index({ status: 1, type: 1, urgency: 1, createdAt: -1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ status: 1, autoIncrement: 1 }); // For cron job efficiency

// Text search indexes
taskSchema.index({ title: 'text', description: 'text' });

// Sorting indexes
taskSchema.index({ reward: -1 }); // For reward sorting
taskSchema.index({ views: -1 }); // For views sorting

// Validation: if autoIncrement is true, maxCap should be >= reward
taskSchema.pre('save', function(next) {
    if (this.autoIncrement && this.maxCap < this.reward) {
        return next(new Error('maxCap must be greater than or equal to reward when autoIncrement is true'));
    }
    next();
});

export const Task = mongoose.model("Task", taskSchema);
