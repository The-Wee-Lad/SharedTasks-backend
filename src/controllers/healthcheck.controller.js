import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheckController = asyncHandler( async (req, res) => {
    res.status(200).json({status:"ok"});
}
);

export { healthcheckController };