function parseNaturalLanguageQuery(query) {
  query = query.toLowerCase();

  const filters = {};

  // Match palindrome
  if (query.includes("palindrome")) {
    filters["properties.is_palindrome"] = true;
  }

  // Match single/multiple word
  if (query.includes("single word")) {
    filters["properties.wordCount"] = 1;
  } else if (query.match(/(\d+)\s*word/)) {
    const num = parseInt(query.match(/(\d+)\s*word/)[1]);
    filters["properties.wordCount"] = num;
  }

  // Match length-based patterns
  if (query.match(/longer than (\d+)/)) {
    const num = parseInt(query.match(/longer than (\d+)/)[1]);
    filters["properties.length"] = { $gt: num };
  } else if (query.match(/shorter than (\d+)/)) {
    const num = parseInt(query.match(/shorter than (\d+)/)[1]);
    filters["properties.length"] = { $lt: num };
  }

  // Match "contain letter"
  if (query.match(/contain[s]? the letter ([a-z])/)) {
    const char = query.match(/contain[s]? the letter ([a-z])/)[1];
    filters.value = { $regex: char, $options: "i" };
  } else if (query.match(/contain[s]? ([a-z])/)) {
    const char = query.match(/contain[s]? ([a-z])/)[1];
    filters.value = { $regex: char, $options: "i" };
  }

  return Object.keys(filters).length ? filters : null;
}


module.exports= parseNaturalLanguageQuery