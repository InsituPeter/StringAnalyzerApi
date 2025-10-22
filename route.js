const express= require("express")
const router= express.Router()
const {createString, getSpecificString,filterByNaturalLanguage, deleteString, getAllString} = require("./controller")


router.route("/strings").post(createString).get(getAllString)
router.route("/strings/:stringValue").get(getSpecificString).delete(deleteString)
router.get("/strings/filter-by-natural-language", filterByNaturalLanguage )




module.exports= router