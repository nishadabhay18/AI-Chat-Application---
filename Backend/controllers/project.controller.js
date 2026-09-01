import projectModel from "../models/project.model.js";
import userModel from "../models/user.model.js";
import * as projectService from '../services/project.service.js'
import { validationResult } from 'express-validator'


export const createProject = async (req, res) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    try {

        const { name } = req.body

        const email = req.user.email

        const loggedInUser = await userModel.findOne({ email })

        if (!loggedInUser) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        const userId = loggedInUser._id

        const newProject = await projectService.createProject({
            name,
            userId
        })

        return res.status(201).json(newProject)

    } catch (err) {

        console.log(err)

        return res.status(500).json({
            message: err.message
        })
    }
}


export const getAllProject = async (req, res) => {

    try {

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        if (!loggedInUser) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        const allUserProjects =
            await projectService.getAllProjectByUserId({
                userId: loggedInUser._id
            })

        return res.status(200).json({
            projects: allUserProjects
        })

    } catch (err) {
 
        console.log(err)

        return res.status(500).json({
            error: err.message
        })
    }
}

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    try {
        const { projectId, users } = req.body

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const project = await projectService.addUsersToProject({
            projectId, users, userId: loggedInUser._id
        })

        return res.status(200).json({
            project
        })
    }
    catch (err) {
        console.log(err)
        return res.status(400).json({
            error: err.message
        })
    }
}

export const getProjectById = async (req, res) => {
    const { projectId } = req.params

    try {
        const project = await projectService.getProjectById({
            projectId
        })

        return res.status(200).json({
            project
        })
    }
    catch (err) {
        console.log(err)
        return res.status(400).json({
            error: err.message
        })
    }
}
  