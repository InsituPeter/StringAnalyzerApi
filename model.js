const mongoose= require("mongoose")
const crypto= require('crypto');
const analyzerSchema = new mongoose.Schema({
    id:{
        type:String,
        required:true
    },
    value:{
        type:String,
        required:[true, "please provide string below"],
        trim:true,
        unique: true
    },
    properties:{
        length:{
        type: Number,
       required: true

    },
    is_palindrome:{
        type: Boolean,
        required: true  
     },
    unique_characters:{
        type: Number,
       required: true
    },
    wordCount:{
        type: Number,
        required: true
    },
    sha256_hash:{
        type: String,
       required: true
       
    },
    character_frequency_map:{
        type: Map,
        of: Number,
        required: true
    }
    },

    created_at: {
        type:Date,
        default:Date.now
    }
})
    

analyzerSchema.statics.is_palindrome= function(value){
    if(!value || typeof value !== 'string'){
        throw new Error("Invalid input: value must be a non-empty string.");
    }
    const clean = value.replace(/\s+/g, "").toLowerCase();
    const reversed= clean.split('').reverse().join('');
    return value === reversed
}  

analyzerSchema.statics.unique_characters= function(value){
    const clean = value.replace(/\s+/g, "")
    const uniqueChars= new Set(clean);
    return uniqueChars.size
}

analyzerSchema.statics.wordCount= function(value){
    if(!value || typeof value !== 'string'){
        throw new Error("Invalid input: value must be a non-empty string.");
    }
   
    const words= value.trim().split(/\s+/);
    return words.length
}
analyzerSchema.statics.sha256_hash= function(value){
     const clean = value.replace(/\s+/g, "")
 
    return crypto.createHash('sha256').update(clean).digest('hex');
}

analyzerSchema.statics.character_frequency_map= function(value){
    const clean = value.replace(/\s+/g, "")                                                                            
    const frequencyMap= {}; 
    for(const char of clean){
        frequencyMap[char]= (frequencyMap[char] || 0) + 1;
    }       

    return frequencyMap;
}
analyzerSchema.statics.value_length= function(value){
    const clean = value.replace(/\s+/g, "")
    return clean.length
}
module.exports= mongoose.model("Analyzer", analyzerSchema)
