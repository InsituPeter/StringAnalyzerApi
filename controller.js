const {StatusCodes}= require("http-status-codes")
const Analyzer= require("./model")
const CustomAPIError= require("./error")
const parseNaturalLanguageQuery= require("./utility.js")

const createString = async (req,res, next)=>{
  const {value}=req.body;
  if(!value){
    return next(new CustomAPIError("Please provide a string value", StatusCodes.BAD_REQUEST))
  }
  if(typeof value !== "string"){
    return next(new CustomAPIError("Invalid data type for 'value' (must be string)", StatusCodes.UNPROCESSABLE_ENTITY))
  }

  try {
    const stringData= await Analyzer.create({
      id:Analyzer.sha256_hash(value),
      value,
      properties:{
        length: Analyzer.value_length(value),
        is_palindrome:Analyzer.is_palindrome(value),
        unique_characters: Analyzer.unique_characters(value),
        wordCount: Analyzer.wordCount(value),
        sha256_hash: Analyzer.sha256_hash(value),
        character_frequency_map: Analyzer.character_frequency_map(value)
      },
      created_at: new Date().toISOString()
    })

    res.status(StatusCodes.CREATED).json(stringData)
  } catch(error) {
    if(error.code === 11000) {
      return next(new CustomAPIError("String already exists in the system", StatusCodes.CONFLICT))
    }
    next(error)
  }
}

const getSpecificString= async(req,res,next)=>{
  const {stringValue}= req.params

  if(!stringValue){
    return next(new CustomAPIError("Please provide a string value", StatusCodes.BAD_REQUEST))
  }
  
  const stringData= await Analyzer.findOne({value: stringValue});
  if(!stringData){
    return next(new CustomAPIError("String does not exist in the system", StatusCodes.NOT_FOUND))
  }
  res.status(StatusCodes.OK).json({
    id: stringData.properties.sha256_hash,
    value: stringData.value,
    properties: stringData.properties,
    created_at: stringData.created_at
  })
}

const getAllString= async(req,res, next)=>{
  const{is_palindrome,
        min_length,
        max_length,
        word_count,
        contains_character
  }= req.query

  const filters={}

  if(is_palindrome!==undefined){
    filters["properties.is_palindrome"] = is_palindrome === "true"
  }
  
  if (min_length !== undefined) {
    const min = parseInt(min_length, 10);
    if (isNaN(min) || min < 0)
      return next(
        new CustomAPIError("Invalid value for min_length", StatusCodes.BAD_REQUEST)
      );
    filters["properties.length"] = { ...filters["properties.length"], $gte: min };
  }

  if (max_length !== undefined) {
    const max = parseInt(max_length, 10);
    if (isNaN(max) || max < 0)
      return next(
        new CustomAPIError("Invalid value for max_length", StatusCodes.BAD_REQUEST)
      );
    filters["properties.length"] = { ...filters["properties.length"], $lte: max };
  }

  if (word_count !== undefined) {
    const wc = parseInt(word_count, 10);
    if (isNaN(wc) || wc < 0)
      return next(
        new CustomAPIError("Invalid value for word_count", StatusCodes.BAD_REQUEST)
      );
    filters["properties.wordCount"] = wc;
  }

  if (contains_character !== undefined) {
    if (typeof contains_character !== "string" || contains_character.length !== 1) {
      return next(
        new CustomAPIError(
          "contains_character must be a single character",
          StatusCodes.BAD_REQUEST
        )
      );
    }
    filters.value = { $regex: contains_character, $options: "i" };
  }

  const strings = await Analyzer.find(filters).sort({ created_at: -1 });
  const count = await Analyzer.countDocuments(filters);

  res.status(StatusCodes.OK).json({
    data: strings.map(str => ({
      id: str.properties.sha256_hash,
      value: str.value,
      properties: str.properties,
      created_at: str.created_at
    })),
    count,
    filters_applied: {
      is_palindrome: is_palindrome ? is_palindrome === "true" : undefined,
      min_length: min_length ? Number(min_length) : undefined,
      max_length: max_length ? Number(max_length) : undefined,
      word_count: word_count ? Number(word_count) : undefined,
      contains_character,
    },
  });
}

const filterByNaturalLanguage=async(req,res,next)=>{
  const { query } = req.query;
  if (!query) {
    return next(new CustomAPIError("Missing natural language query parameter", StatusCodes.BAD_REQUEST))
  }

  const filters = parseNaturalLanguageQuery(query);

  if (!filters) {
    return next(new CustomAPIError("Unable to interpret the natural language query", StatusCodes.UNPROCESSABLE_ENTITY))
  }

  const data = await Analyzer.find(filters);

  res.status(StatusCodes.OK).json({
    data: data.map(str => ({
      id: str.properties.sha256_hash,
      value: str.value,
      properties: str.properties,
      created_at: str.created_at
    })),
    count: data.length,
    interpreted_query: {
      original: query,
      parsed_filters: filters,
    }
  })
}

const deleteString= async(req,res,next)=>{
  const {stringValue}= req.params
  
  const stringData = await Analyzer.findOne({value: stringValue})
  if(!stringData){
    return next(new CustomAPIError("String does not exist in the system", StatusCodes.NOT_FOUND))
  }
  await stringData.deleteOne()
 
  res.status(StatusCodes.NO_CONTENT).send()
}

module.exports= {createString, getSpecificString, filterByNaturalLanguage, deleteString, getAllString}