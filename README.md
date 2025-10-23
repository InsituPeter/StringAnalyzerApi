# String Analyzer API

A Node.js REST API service for analyzing and querying string properties. This service stores strings and computes various metrics including length, character frequency, palindrome status, and word count.

## Features

- **Create strings** with automatic analysis of properties
- **Query strings** by various filters (length, palindrome status, word count, character containment)
- **Natural language filtering** to search strings using conversational queries
- **Retrieve specific strings** by value
- **Delete strings** from the database
- **Rate limiting** to prevent abuse (100 requests per 15 minutes)

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally on port 27017, or configured via `MONGO_URI`)
- npm or yarn

## Installation

1. Clone or download the project files
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following configuration:
```
NODE_ENV=development
PORT=8081
MONGO_URI=mongodb://localhost:27017/stringAnalyzerDB
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on the configured port (default: 8081).

## API Endpoints

### 1. Create a String
**POST** `/api/v1/strings`

Request body:
```json
{
  "value": "Hello World"
}
```

Response:
```json
{
  "_id": "...",
  "id": "sha256_hash",
  "value": "Hello World",
  "properties": {
    "length": 10,
    "is_palindrome": false,
    "unique_characters": 8,
    "wordCount": 2,
    "sha256_hash": "...",
    "character_frequency_map": {
      "h": 1,
      "e": 1,
      "l": 3,
      "o": 2,
      "w": 1,
      "r": 1,
      "d": 1
    }
  },
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### 2. Get All Strings (with optional filters)
**GET** `/api/v1/strings`

Query parameters (all optional):
- `is_palindrome` (true/false)
- `min_length` (number)
- `max_length` (number)
- `word_count` (number)
- `contains_character` (single character)

Example:
```
GET /api/v1/strings?is_palindrome=true&min_length=5
```

### 3. Get Specific String
**GET** `/api/v1/strings/:stringValue`

Example:
```
GET /api/v1/strings/Hello
```

### 4. Natural Language Query
**GET** `/api/v1/strings/filter-by-natural-language?query=palindromes+longer+than+10`

Supported query patterns:
- "palindrome" - filter for palindromes
- "single word" - strings with exactly one word
- "N word(s)" - strings with N words (e.g., "3 words")
- "longer than N" - strings longer than N characters
- "shorter than N" - strings shorter than N characters
- "contain(s) letter X" - strings containing character X (e.g., "contains letter a")

Examples:
```
GET /api/v1/strings/filter-by-natural-language?query=palindrome
GET /api/v1/strings/filter-by-natural-language?query=longer+than+10
GET /api/v1/strings/filter-by-natural-language?query=contains+the+letter+e
```

### 5. Delete String
**DELETE** `/api/v1/strings/:stringValue`

Example:
```
DELETE /api/v1/strings/Hello
```

## String Properties

Each string is analyzed and the following properties are stored:

- **length**: Number of characters (excluding whitespace)
- **is_palindrome**: Boolean indicating if the string is a palindrome
- **unique_characters**: Count of distinct characters
- **wordCount**: Number of words in the string
- **sha256_hash**: SHA-256 hash of the string (used as unique identifier)
- **character_frequency_map**: Object with character counts

## Error Handling

The API returns appropriate HTTP status codes:

- `201 Created` - String successfully created
- `200 OK` - Successful retrieval or filtering
- `204 No Content` - String successfully deleted
- `400 Bad Request` - Invalid input or query parameters
- `404 Not Found` - String does not exist
- `409 Conflict` - String already exists in the database
- `422 Unprocessable Entity` - Invalid data type

Error responses include a descriptive message explaining what went wrong.

## Rate Limiting

The API implements rate limiting of 100 requests per 15-minute window per IP address. Requests exceeding this limit will receive a 429 (Too Many Requests) response.

## Project Structure

```
.
├── app.js              # Express application entry point
├── controller.js       # Route handlers and business logic
├── model.js            # MongoDB schema and string analysis methods
├── db.js               # Database connection
├── route.js            # API route definitions
├── utility.js          # Natural language query parser
├── errorHandler.js     # Express error middleware
├── error.js            # Custom error class
├── package.json        # Dependencies and scripts
└── .env                # Environment configuration
```

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **dotenv**: Environment variable management
- **express-rate-limit**: Rate limiting middleware
- **http-status-codes**: HTTP status code constants
- **crypto**: Node.js built-in for SHA-256 hashing

## Development Dependencies

- **nodemon**: Auto-reload server on file changes
- **cross-env**: Cross-platform environment variable setting

## Notes

- Strings are stored with unique identifiers based on their SHA-256 hash
- Whitespace is ignored when computing string properties
- The natural language filter provides flexible query parsing for common use cases
- All timestamps are stored in ISO 8601 format
