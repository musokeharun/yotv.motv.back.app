const fs = require("fs");
const axios = require("axios");

axios({
  url:
    "https://mw.channels256.com/monitoring-statistics/api/datasources/proxy/3/_msearch?max_concurrent_shard_requests=256",
  headers: {
    accept: "application/json, text/plain, */*",
    "accept-language": "en-UG,en-US;q=0.9,en;q=0.8",
    "content-type": "application/json",
    "sec-ch-ua":
      '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-grafana-org-id": "1",
    cookie:
      "mw_grafana_user=etalemwa@albayanmedia-africa.com; mw_grafana_hash=KuwPr_NfLqrVkxm0VqrbWQ; mw_grafana_expires=1621065940",
  },
  referrerPolicy: "no-referrer-when-downgrade",
  data:
    '{"search_type":"query_then_fetch","ignore_unavailable":true,"index":"watching_statistics"}\n{"size":0,"query":{"bool":{"filter":[{"range":{"@timestamp":{"gte":1618174800000,"lte":1618261199000,"format":"epoch_millis"}}},{"query_string":{"analyze_wildcard":true,"query":"vendorsName:(\\"Albayan\\") AND devicesType:(\\"android\\" OR \\"ios\\" OR \\"web\\\\ player\\" OR \\"android\\\\ tv\\") AND type:(\\"unicast\\" OR \\"multicast\\" OR \\"broadcast\\") AND streamType:(\\"live\\" OR \\"timeshift\\" OR \\"catchup\\" OR \\"vod\\" OR \\"recording\\") AND (channelsName:NTV OR (NOT _exists_: channelsName))"}}]}},"aggs":{"3":{"terms":{"field":"type","size":10,"order":{"_key":"desc"},"min_doc_count":1},"aggs":{"2":{"date_histogram":{"interval":"1h","field":"@timestamp","min_doc_count":0,"extended_bounds":{"min":1618174800000,"max":1618261199000},"format":"epoch_millis"},"aggs":{"1":{"cardinality":{"field":"channelsName"}}}}}}}}\n',
  method: "POST",
  mode: "cors",
})
  .then(function ({ data, status }) {
    fs.writeFileSync(
      "./" + new Date().getTime() + ".json",
      JSON.stringify(data)
    );
    console.log(status);
  })
  .catch(function (res) {
    console.log("status", res.status);
    console.log(res);
  });
