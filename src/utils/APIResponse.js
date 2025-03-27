class APIResponse {
    constructor(statusCode, data, message = "Success") {
        if (statusCode < 100 || statusCode > 599) {
            console.error("Invalid status code: ", statusCode); // Log invalid status codes
        }
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}
module.exports = APIResponse;