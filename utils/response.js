
exports.success = function (code, message, data, meta) {
    const SucessResponse = {
        message: message,
        status: 'Success',
        code: code,
        data: data,
        meta: meta
    };
    return SucessResponse;
};


exports.failure = function (code, message, data) {
    const FailureResponse = {
        message: message,
        status: 'Failure',
        code: code,
        data: data,
    };
    return FailureResponse;
};


