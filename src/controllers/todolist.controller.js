import mongoose from "mongoose";
import { TodoList } from "../models/todolist.model.js"
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTodoList = asyncHandler( async (req, res) => {
    const {title, description 
        // isShared = false
        } = req.body;

    if(!title){
        throw new ApiError(400,"Title is required");
    }
    
    // if(isShared === "true") isShared = true;
    // else isShared = false;

    const user = await User.findById(req.user?._id);
    
    const newTodoList = TodoList.create({
        title: title,
        description: description,
        admins: [user?.id],
        tasks: [],
        sharedToRead: [],
        sharedToWrite: [],
        // SharedToPartialWrite: [],
        // isShared: isShared
    });

    if(!newTodoList){
        throw new ApiError(400, "Couldb't create new Todo");
    }

    user.todoLists.push(newTodoList?._id);
    if(!await user.save()){
        await User.findByIdAndDelete(newTodoList?.id);
        throw new ApiError(400,"Couldn't Update User!!");
    }

    res.status(200).json(new ApiResponse(200, newTodoList, "todolist created"));

});

const deleteTodoList = asyncHandler( async (req, res) => {

    const { todoListId } = req.body;
    if(!todoListId){
        throw new ApiError(400, "Nothing to delete");
    }

    const user = await User.findOneAndUpdate(req.user?._id, {
        $pull:{todoLists:todoListId}
    });
    
    const toBeDeletedTodoList = await TodoList.findById(todoListId);
    
    //Deletion of Todolist by all admin does not history of todolist,
    //it downgrades others' access to read level
    
    let flag = 1, adminsGone = 0;
    for (const [index,elem] of toBeDeletedTodoList.admins.entries()){
        if(elem === user?._id){
            flag = 0;
            toBeDeletedTodoList.splice(index,1);
        }
    } 

    if(toBeDeletedTodoList.admins.length == 0){
        adminsGone = 1;
    }

    for (const [index,elem] of toBeDeletedTodoList.sharedToRead.entries()){
        if(elem === user?.username){
            flag = 0;
            toBeDeletedTodoList.splice(index,1);
        }
    }

    for (const [index,elem] of toBeDeletedTodoList.sharedToWrite.entries()){
        if(elem === user?.username){
            flag = 0;
            toBeDeletedTodoList.splice(index,1);
        }
        else if(isAdmin){
            toBeDeletedTodoList.sharedToRead.push()
        }
    }

    // for (const [index,elem] of toBeDeletedTodoList.SharedToPartialWrite.entries()){
    //     if(elem === user?.username){
    //         flag = 0;
    //         toBeDeletedTodoList.splice(index,1);
    //     }
    // }

    if(adminsGone){
        toBeDeletedTodoList.sharedToRead
        .push(...toBeDeletedTodoList.sharedToWrite,
                // ...toBeDeletedTodoList.SharedToPartialWrite
                );
        // toBeDeletedTodoList.SharedToPartialWrite=[],
        toBeDeletedTodoList.sharedToWrite=[];
    }

    if(flag){
        throw new ApiError(400,"the TodoList doesn't exist for the current user");
    }

    if(toBeDeletedTodoList.admins.length
        +toBeDeletedTodoList.sharedToRead.length
        +toBeDeletedTodoList.sharedToWrite.length
        //+toBeDeletedTodoList.SharedToPartialWrite
    ){
        await TodoList.delete({_id : toBeDeletedTodoList._id});
    }else{
        await toBeDeletedTodoList.save()
    }
    
    res.status(200).json(new ApiResponse(200,toBeDeletedTodoList,"Removed the TodoList from user."))

});


const updateTodoList = asyncHandler( async (req, res) => {
    const {title, description} = req.body;
    const {todoListId} = req.params;
    if(!mongoose.isValidObjectId(todoListId)){
        throw new ApiError(400, " invalidid");
    }
    if(!title){
        throw new ApiError(400, "Can't have an empty Title")
    }
    const data = await TodoList.findOneAndUpdate({
        _id:todoListId,
        $or:[{sharedToWrite:req.user?.username}
            ,{admins:req.user?.username}]
    }, {
        $set:{title:title,description:description}
    });
    if(!data){
        throw new ApiError(400,"Wrong Autherisation or No Existance of todo");
        
    }
    res.status(200).json(new ApiResponse(200, data, "Updated"));
});

//TODO:add proper aggregation pipeline here
const getTodoListById =  asyncHandler( async (req, res) => {
    const {todoListId} = req.params;
    if(!mongoose.isValidObjectId(todoListId)){
        throw new ApiError(400,"Invalid Id");
    }
    const user = await User.findOne({_id:req.user?._id, todoLists:todoListId});
    if(!user){
        throw new ApiError(400,"couldn't find any todolist");
    }

    const todo = await TodoList.findById(todoListId);
    res.status(200).json(new ApiResponse(200,todo,"Fetched Succesfylly"))    
});


export {
    createTodoList,
    deleteTodoList,
    updateTodoList,
    getTodoListById,
};