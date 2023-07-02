function extendResponse(res) {
  res.send = function (body) {
    res.writeHead(this.statusCode || 200, { 'Content-Type': 'text/plain' });
    res.end(body);
  };

  res.json = function (data) {
    res.writeHead(this.statusCode || 200, {
      'Content-Type': 'application/json',
    });
    res.end(JSON.stringify(data));
  };

  res.status = function (statusCode) {
    this.statusCode = statusCode;
    return res;
  };
}

module.exports = { extendResponse };
