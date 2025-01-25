import { Task } from "../models/task.model";
import { User } from "../models/user.model.js";
import { TodoList } from "../models/todolist.model.js";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


//TODO: ADD Discussions like issues in github.
const createTask = asyncHandler( async (req, res) => {

    const { todoListId } = req.params;
    const {title, description, time, isExp} = req.body;
    const user = await User.findById(req.user?._id);
    const todo = await TodoList.findById(todoListId);
    if(!todo){
        throw new ApiError(400,"Invalid Id");
        
    }
    if(!(todo.admins.include(user)||todo.sharedToWrite.include(user))){
        throw new ApiError(401,"Unauthorised");
    }
    
    const newTask = await Task.create({
        title: title,
        description: description,
        expiresIn: {
            in: time,
            is: isExp,
        },
        createdBy:req.user?._id
    })

    res
    .status(200)
    .json(new ApiResponse(200,newTask,"Task Created"));
});

const deleteTask = asyncHandler( async (req, res) => {
    const { todoListId, taskId } = req.params;

    const user = await User.findById(req.user?._id);
    const todo = await TodoList.findById(todoListId);
    if(!todo){
        throw new ApiError(400,"Invalid Id");        
    }
    if(!(todo.admins.include(user?._id)||todo.sharedToWrite.include(user?.username))){
        throw new ApiError(401,"Unauthorised");
    }
    const deletedTask = await Task.findByIdAndDelete(taskId);
    if(!deletedTask){
        throw new ApiError(400,"No Task Found");
    }
    res
    .status(200)
    .json(new ApiResponse(200,deletedTask,"Task deleted"));
});

const updateTask = asyncHandler( async (req, res) => {
    const { todoListId, taskId } = req.params;
    
    const {title, description} = req.body;
    if(!title){
        throw new ApiError(200,"Title Required");
    }
    
    const user = await User.findById(req.user?._id);
    const todo = await TodoList.findById(todoListId);

    if(!todo){
        throw new ApiError(400,"Invalid Id");        
    }
    if(!(todo.admins.include(user?._id)||todo.sharedToWrite.include(user?.username))){
        throw new ApiError(401,"Unauthorised");
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId,{
        $set:{
            title:title,
            description :description
        }
    });

    if(!updatedTask){
        throw new ApiError(400,"No Task Found");
    }
    res
    .status(200)
    .json(new ApiResponse(200,updatedTask,"Task deleted"));
});

const toggleComplete = asyncHandler( async (req, res) => {
    const { todoListId, taskId } = req.params;
    
    if(!title){
        throw new ApiError(200,"Title Required");
    }
    
    const user = await User.findById(req.user?._id);
    const todo = await TodoList.findById(todoListId);

    if(!todo){
        throw new ApiError(400,"Invalid Id");        
    }
    
    const task = await Task.findById(taskId);
    if(!task){
        throw new ApiError(400,"Task not found");
    }
    if(!(todo.admins.include(user?._id)||todo.sharedToWrite.include(user?.username))){
        if(!(task.assignedTo.include(user?._id))){
            throw new ApiError(401,"Not Assigned");    
        }
        throw new ApiError(401,"Unauthorised");
    }

    const set={};
    if(task.done){
        set.done = false,
        set.doneBy = null,
        set.whenDone = null
    }else{
        set.done = true,
        set.doneBy = user?._id,
        set.whenDone = Date.now()
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId,{$set:set});
    if(!updatedTask){
        throw new ApiError(400,"No Task Found");
    }
    res
    .status(200)
    .json(new ApiResponse(200,updatedTask,"Toggled Done Status"));
});

const updateExpiry = asyncHandler( async (req, res) => {
    const {todoListId,taskId,time,isExp} = req.params;
    const user = await User.findById(req.user?._id);
    const todo = await TodoList.findById(todoListId);

    if(!todo){
        throw new ApiError(400,"Invalid Id");        
    }
    if(!(todo.admins.include(user?._id)||todo.sharedToWrite.include(user?.username))){
        throw new ApiError(401,"Unauthorised");
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId,{
        $set:{
            expiresIn:{
                is:isExp,
                in:time,
            }
        }
    });

    if(!updatedTask){
        throw new ApiError(400,"couldn't find task");
    }

    res
    .status(200)
    .json(new ApiResponse(200,updatedTask,"Toggled Done Status"));

});

export {
    createTask,
    deleteTask,
    updateTask,
    toggleComplete,
    updateExpiry,
}