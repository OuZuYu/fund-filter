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


const PAGE = 2; // 这里填 每类排名（3年，2年）分别获取多少页数据。
const GET_NUM = 5 * 2; // 这里填请求次数，比如3年和2年这两类排名分别获取前两页 就是 2 * 2
const FILTER_NUM = 5; // 这里填 某基金出现的次数，比如筛选3年和2年这两类排名，那么应该出现两次。

/*
    筛选的逻辑是：若某基金位于各类排名的前某页，那这就是好基金，比如我要筛选3年、2年、1年都排在前两页的基金，那么在下面循环里填好3年2年1年的地址。PAGE填入2，GET_NUM填入3 * 2，FILTER_NUM填入3。运行：node index ，然后打开localhost:8888那么就能显示出筛选好的在3年、2年、1年都位于前2页的基金，每页是50条，其实就是选出
    3年2年1年都排在前100名。
*/

for (let i = 1; i <= PAGE; i++) {
    url.year3.push(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=gp&rs=&gs=0&sc=3nzf&st=desc&sd=2019-09-03&ed=2020-09-03&qdii=&tabSubtype=,,,,,&pi=${i}&pn=50&dx=1&v=0.8635594364362218`);
    url.year2.push(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=gp&rs=&gs=0&sc=2nzf&st=desc&sd=2019-09-03&ed=2020-09-03&qdii=&tabSubtype=,,,,,&pi=${i}&pn=50&dx=1&v=0.6672559290347202`);
    url.year1.push(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=gp&rs=&gs=0&sc=1nzf&st=desc&sd=2019-09-03&ed=2020-09-03&qdii=&tabSubtype=,,,,,&pi=${i}&pn=50&dx=1&v=0.39173997358439294`);
    url.month6.push(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=gp&rs=&gs=0&sc=6yzf&st=desc&sd=2019-09-03&ed=2020-09-03&qdii=&tabSubtype=,,,,,&pi=${i}&pn=50&dx=1&v=0.5677526443032623`)
    url.month3.push(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=gp&rs=&gs=0&sc=3yzf&st=desc&sd=2018-03-08&ed=2019-03-08&qdii=&tabSubtype=,,,,,&pi=${i}&pn=50&dx=1&v=0.8709048966771133`)
    // url.month1.push(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=gp&rs=&gs=0&sc=1yzf&st=desc&sd=2018-03-08&ed=2019-03-08&qdii=&tabSubtype=,,,,,&pi=${i}&pn=50&dx=1&v=0.8329699048199899`)

    // 指数型
    // url.year3.push(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=zs&rs=&gs=0&sc=3nzf&st=desc&sd=2019-07-16&ed=2020-07-16&qdii=|&tabSubtype=,,,,,&pi=${i}&pn=50&dx=1&v=0.7228072430938599`);
    // url.year2.push(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=zs&rs=&gs=0&sc=2nzf&st=desc&sd=2019-07-16&ed=2020-07-16&qdii=|&tabSubtype=,,,,,&pi=${i}&pn=50&dx=1&v=0.9851648858549926`);
    // url.year1.push(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=zs&rs=&gs=0&sc=1nzf&st=desc&sd=2019-07-16&ed=2020-07-16&qdii=|&tabSubtype=,,,,,&pi=${i}&pn=50&dx=1&v=0.08407942239905108`);
    // url.month6.push(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=zs&rs=&gs=0&sc=6yzf&st=desc&sd=2019-07-16&ed=2020-07-16&qdii=|&tabSubtype=,,,,,&pi=${i}&pn=50&dx=1&v=0.049594508963676454`)
    // url.month3.push(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=gp&rs=&gs=0&sc=3yzf&st=desc&sd=2018-03-08&ed=2019-03-08&qdii=&tabSubtype=,,,,,&pi=${i}&pn=50&dx=1&v=0.8709048966771133`)
    // url.month1.push(`http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=gp&rs=&gs=0&sc=1yzf&st=desc&sd=2018-03-08&ed=2019-03-08&qdii=&tabSubtype=,,,,,&pi=${i}&pn=50&dx=1&v=0.8329699048199899`)
}

function start() {
    console.log('请打开 localhost:8888 查看筛选结果')
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
        // 这里GET_NUM为请求次数，比如3年 2年 1年 6月 3月 1月 每个要获取 4 页 就是 6 * 4；

        ep.after('fund', GET_NUM, function (fundArr) {
            res.write('<h1>3年</h1>')
            res.write(JSON.stringify(result.year3));
            res.write('<h1>2年</h1>')
            res.write(JSON.stringify(result.year2));
            res.write('<h1>1年</h1>')
            res.write(JSON.stringify(result.year1));
            res.write('<h1>6月</h1>')
            res.write(JSON.stringify(result.month6));
            res.write('<h1>3月</h1>')
            res.write(JSON.stringify(result.month3));
            res.write('<h1>1月</h1>')
            res.write(JSON.stringify(result.month1));
            res.write('<h1>汇总</h1>')

            // 合并汇总数据
            let allFund = [];
            for (let i of Object.keys(result)) {
                console.log(i,result[i].length)
                allFund = [...allFund, ...result[i]];
            }
            console.log(allFund.length)
            res.write(JSON.stringify(allFund));

            // 筛选好的数据。
            let goodFund = [];
            for (let fund of allFund) {
                let item = allFund.filter(val => val === fund);
                if (item.length >= FILTER_NUM) goodFund.push(fund);
            }

            let money = Array.from(new Set(goodFund))
            res.write('<h1>筛选结果</h1>')
            res.write(JSON.stringify(money));
        });
        url.year3.forEach(url => {
            superagent
                .get(url)
                .set('Referer', 'http://fund.eastmoney.com/data/fundranking.html')
                .end((err, pres) => {
                    concatResult(pres.text, 'year3');
                    ep.emit('fund');
                })
        })
        url.year2.forEach(url => {
            superagent
                .get(url)
                .set('Referer', 'http://fund.eastmoney.com/data/fundranking.html')
                .end((err, pres) => {
                    concatResult(pres.text, 'year2');
                    ep.emit('fund');
                })
        })
        url.year1.forEach(url => {
            superagent
                .get(url)
                .set('Referer', 'http://fund.eastmoney.com/data/fundranking.html')
                .end((err, pres) => {
                    concatResult(pres.text, 'year1');
                    ep.emit('fund');
                })
        })
        url.month6.forEach(url => {
            superagent
                .get(url)
                .set('Referer', 'http://fund.eastmoney.com/data/fundranking.html')
                .end((err, pres) => {
                    concatResult(pres.text, 'month6');
                    ep.emit('fund');
                })
        })
        url.month3.forEach(url => {
            superagent
                .get(url)
                .set('Referer', 'http://fund.eastmoney.com/data/fundranking.html')
                .end((err, pres) => {
                    concatResult(pres.text, 'month3');
                    ep.emit('fund');
                })
        })
        url.month1.forEach(url => {
            superagent
                .get(url)
                .set('Referer', 'http://fund.eastmoney.com/data/fundranking.html')
                .end((err, pres) => {
                    concatResult(pres.text, 'month1');
                    ep.emit('fund');
                })
        })
    };
    http.createServer(onRequest).listen(8888);
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