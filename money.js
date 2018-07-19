let http = require("http"),
    superagent = require("superagent"),
    eventproxy = require('eventproxy');

let ep = new eventproxy();

// 存近三年 …… 近一个月 请求url
let url = {
    year3: [],
    year2: [],
    year1: [],
    month6: [],
    month3: [],
    month1: [],
}
// 存爬虫结果
let result = {
    year3: [],
    year2: [],
    year1: [],
    month6: [],
    month3: [],
    month1: [],
}

// 前i页 url
for (let i = 1; i < 3; i++) {
    url.year3.push(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=gp&rs=&gs=0&sc=3nzf&st=desc&sd=2017-07-19&ed=2018-07-19&qdii=&tabSubtype=,,,,,&pi=${i}&pn=50&dx=1&v=0.5642004526099762`);
    url.year2.push(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=gp&rs=&gs=0&sc=2nzf&st=desc&sd=2017-07-19&ed=2018-07-19&qdii=&tabSubtype=,,,,,&pi=${i}&pn=50&dx=1&v=0.4745658355052569`);
    url.year1.push(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=gp&rs=&gs=0&sc=1nzf&st=desc&sd=2017-07-19&ed=2018-07-19&qdii=&tabSubtype=,,,,,&pi=${i}&pn=50&dx=1&v=0.3283191257386804`);
    url.month6.push(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=gp&rs=&gs=0&sc=6yzf&st=desc&sd=2017-07-19&ed=2018-07-19&qdii=&tabSubtype=,,,,,&pi=${i}&pn=50&dx=1&v=0.01517020554413473`)
    url.month3.push(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=gp&rs=&gs=0&sc=3yzf&st=desc&sd=2017-07-19&ed=2018-07-19&qdii=&tabSubtype=,,,,,&pi=${i}&pn=50&dx=1&v=0.8321976563018312`)
    url.month1.push(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=gp&rs=&gs=0&sc=1yzf&st=desc&sd=2017-07-19&ed=2018-07-19&qdii=&tabSubtype=,,,,,&pi=${i}&pn=50&dx=1&v=0.5825533630457385`)
}

function start () {
    let onRequest = (req, res) => {
        // 重置，避免重复合并
        result.year3 = [];
        result.year2 = [];
        result.year1 = [];
        result.month6 = [];
        result.month3 = [];
        result.month1 = [];
        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
        // 异步请求完成后显示筛选结果
        ep.after('fund', 2 * 6, function (fundArr) {
            res.write('<h1>汇总</h1>')
            let allFund = [];
            for (let i of Object.keys(result)) {
                console.log(i,result[i].length)
                allFund = [...allFund, ...result[i]];
            }
            console.log(allFund.length)
            res.write(JSON.stringify(allFund));

            let goodFund = [];
            for (let fund of allFund) {
                let item = allFund.filter(val => val === fund);
                if (item.length >= 6) goodFund.push(fund);
            }

            let money = Array.from(new Set(goodFund))
            res.write('<h1>筛选结果</h1>')
            res.write(JSON.stringify(money));
        });
        url.year3.forEach(url => {
            superagent.get(url).end((err, pres) => {
                concatResult(pres.text, 'year3');
                ep.emit('fund');
            })
        })
        url.year2.forEach(url => {
            superagent.get(url).end((err, pres) => {
                concatResult(pres.text, 'year2');
                ep.emit('fund');
            })
        })
        url.year1.forEach(url => {
            superagent.get(url).end((err, pres) => {
                concatResult(pres.text, 'year1');
                ep.emit('fund');
            })
        })
        url.month6.forEach(url => {
            superagent.get(url).end((err, pres) => {
                concatResult(pres.text, 'month6');
                ep.emit('fund');
            })
        })
        url.month3.forEach(url => {
            superagent.get(url).end((err, pres) => {
                concatResult(pres.text, 'month3');
                ep.emit('fund');
            })
        })
        url.month1.forEach(url => {
            superagent.get(url).end((err, pres) => {
                concatResult(pres.text, 'month1');
                ep.emit('fund');
            })
        })
    };
    http.createServer(onRequest).listen(3333);
}

// 获取基金名称
function getFundName (data) {
    let nameArr = [];
    for (let i of data) {
        let curArr = i.split(',');
        nameArr.push(curArr[1]);
    }
    return nameArr;
}

// 合并结果
function concatResult (data, key) {
    let startIdx = data.indexOf('[');
    let endIdx = data.indexOf(']');
    let objStr = data.slice(startIdx, endIdx + 1);
    let obj = eval(objStr);
    let nameArr = getFundName(obj);
    result[key] = [...result[key], ...nameArr];
}
exports.start = start;