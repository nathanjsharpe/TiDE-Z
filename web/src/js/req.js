var req = {
  queryParams: null,
  params: function() {
    if (this.queryParams) {
      return this.queryParams;
    } else {
      var qs = location.search.replace('?', '').split('&');
      var params = {}

      qs.forEach(function(q) {
        var p1 = q.split('=')[0],
            p2 = q.split('=')[1];

        if (p2.match(/[%,]/)) {
          p2 = p2.replace(/%2C/g, ',').split(',');
        }

        params[p1] = p2;
      });

      this.queryParams = params;
      return params;
    }
  }
}

module.exports = req;