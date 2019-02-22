let BASE_URL = "http://show.maiboparking.com";
let config = {
    todayIncorme: BASE_URL + "/index/platform/income_comparison",
    stopLenth: BASE_URL + "/index/platform/parking_length",
    getAllPark: BASE_URL + "/index/platform/get_country_parking",   //获取所有停车场的信息
    getOneParkInfo: BASE_URL + "/index/platform/get_parking_info",  //获取某个停车场的详细信息
    getWarning: BASE_URL + "/index/platform/device_warning" //获取设备警告信息
};
let updateTime = 3000;
let stop = {
    //今日收入
    todayIncorme: function () {
        let oldData = {
            "code": 1,
            "data": {
                "t_number": "960,712", //今日收入
                "y_number": 682620,    //昨日收入
                "ratio": "0.94"        //同比昨日(%)
            }
        }
        render();
        setPage(oldData.data);
        setInterval(render, updateTime);

        function render() {
            $.ajax({
                url: config["todayIncorme"],
                success: function (data) {
                    if (data.code === 1) {
                        setPage(data.data);
                    } else {
                        setPage(oldData.data);
                    }
                },
                error: function () {
                    setPage(oldData.data);
                }
            });
        }

        function setPage(data) {
            $(".today-income .money-left").text(data["t_number"]);
            $(".today-income .ratio").text(data.ratio);
            if (data.ratio >= 0) {
                $(".today-income .money-right img").attr("src", "images/up.png");
            } else {
                $(".today-income img").attr("src", "images/down.png");
            }
        }

        return this;
    },
    //停车时长
    stopLenth: function () {

        let pipBox = $(".stop-lenth .pip");
        let myEcharts = echarts.init(pipBox[0]);
        let oldData = {
            "code": 1,
            "data": [
                {"name": "30分钟以内", "total": 8640, "ratio": 16.69},
                {"name": "30-60分钟", "total": 6420, "ratio": 12.4},
                {"name": "1-2小时", "total": 13200, "ratio": 25.49},
                {"name": "2-4小时", "total": 15810, "ratio": 30.53},
                {"name": "4小时以上", "total": 7710, "ratio": 14.89}
            ]
        };
        let option = {
            color: [
                "red",
                "yellow",
                "blue",
                "green",
                "orange",
                "pink"
            ],
            tooltip: {
                trigger: 'item',
                formatter: "时长：{b}<br/>总计：{c}<br/>占比：{d}"
            },
            series: [
                {
                    name: '访问来源',
                    type: 'pie',
                    radius: ['50%', '70%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: true,
                            position: 'outside',
                            textStyle: {
                                fontSize: '12',
                            }
                        },
                        emphasis: {
                            show: false,
                            textStyle: {
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: true
                        }
                    },
                    data: getData(oldData)
                }
            ]
        };
        myEcharts.setOption(option);

        //把数据格式转化成需要设置的格式
        function getData(data) {
            let d = [];

            data.data.forEach(function (val) {
                d.push({
                    name: val.name,
                    value: val.total
                });
            });

            return d;
        }

        render();
        setInterval(render, updateTime);

        function render() {
            $.ajax({
                url: config["stopLenth"],
                success: function (data) {
                    if (data.code === 1) {
                        option.series[0].data = getData(data);
                    } else {
                        option.series[0].data = getData(oldData);
                    }
                    myEcharts.setOption(option);
                },
                error: function () {
                    option.series[0].data = getData(oldData);
                    myEcharts.setOption(option);
                }
            });
        }

        return this;
    },
    //map
    map: function () {

        let map = $(".map");
        let myEcharts = echarts.init(map[0]);
        let option = {
            tooltip: {
                trigger: 'item',
                triggerOn: "none",
                borderColor: "rgb(74, 223, 255)",
                borderWidth: 1,
                padding: 20,
                position:"left",
                //设置提示框格式
                formatter: function (params) {
                    return `
                    <div>
                        <h5 style="color:rgb(74, 223, 255);font-size: 20px;">
                            ${params.data.name}                    
                        </h5>
                        <div style="font-size: 12px;margin-top: 5px;">今日收入</div>
                        <div style="text-align: center;font-size: 16px;color: #5592FF;">${params.data.info["total_money"]}</div>
                        <div style="display: flex;justify-content: center;text-align: center">
                            <div style="margin-right:10px;">
                                <div>总车位</div>
                                <div>${params.data.info["total_seat"]}</div>
                            </div>
                            <div>
                                <div>空余车位</div>
                                <div>${params.data.info["surplus_seat"]}</div>
                            </div>
                        </div>
                        <div style="font-size: 12px;">
                        <span style="margin-right: 10px;">本日进场 ${params.data.info["in_number"]}</span>
                        <span>本日出场 ${params.data.info["out_number"]}</span>
</div>
                    </div>
                  `;
                }
            },
            geo: {
                zoom: 1.2,
                map: 'china',
                label: {
                    emphasis: {
                        show: true,
                        fontSize: "14",
                        color: "#fff"
                    }
                },
                itemStyle: {
                    normal: {
                        areaColor: '#194e7c',
                        borderColor: '#111'
                    },
                    emphasis: {
                        areaColor: '#64BDDA'
                    }
                }
            },
            series: [
                {
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: [],
                    symbolSize: 10,
                    label: {
                        normal: {
                            show: false
                        },
                        emphasis: {
                            show: true,
                            position: "right",
                            formatter: "{b}",
                            fontSize: 20
                        }
                    },
                    itemStyle: {
                        emphasis: {
                            borderColor: '#fff',
                            borderWidth: 1
                        }
                    }
                },
                {
                    symbolSize: 16,
                    name: 'Top 5',
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    data: [],
                    showEffectOn: 'render',
                    rippleEffect: {
                        brushType: 'stroke'
                    },
                    hoverAnimation: true,
                    label: {
                        normal: {
                            formatter: '{b}',
                            position: 'right',
                            show: true
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#4affd2',
                            shadowBlur: 10,
                            shadowColor: '#333'
                        }
                    },
                    zlevel: 1
                }
            ]
        };
        myEcharts.setOption(option);
        render();

        //转化数据格式
        function convertData(data) {
            let d = [];
            data.forEach(function (val) {
                d.push({
                    name: val.name,
                    value: [val["baidumap_longitude"], val["baidumap_latitude"], val["park_id"]]
                });
            });
            return d;
        }

        function render() {
            $.ajax({
                url: config["getAllPark"],
                success: function (data) {
                    if (data.code === 1) {
                        option.series[0].data = convertData(data.data);
                        option.series[1].data = [convertData(data.data)[0]];
                        myEcharts.setOption(option);
                        option.series[0].data.forEach(function (val) {
                            $.ajax({
                                url: config["getOneParkInfo"],
                                data: {
                                    park_id: val.value[2]
                                },
                                success: function (data) {

                                    if (data.code === 1) {

                                        val.info = data.data;
                                    }
                                }
                            });
                        });
                    }
                }
            });
        }

        //设置波纹自动跳转
        let index = 0;
        setInterval(function () {
            if (index > option.series[0].data.length - 1) {
                index = 0;
            }
            option.series[1].data = [option.series[0].data[index]];
            myEcharts.setOption(option);
            myEcharts.dispatchAction({
                type: 'showTip',
                seriesIndex: "1",
                name: option.series[0].data[index].name
            });
            index++;
        }, 3000);
        return this;
    },
    //设备警告
    deviceWarning: function () {
        setInterval(render,updateTime);
        render();
        function render() {
            $.ajax({
                url:config["getWarning"],
                success:function (data) {
                    let str = "";
                    if(data.code===1){
                        data.data.forEach(function (val) {

                            str+=`
                                <li class="device-item ${val.status===0?'error':'success'}">
                                    <div class="top">
                                        <div class="person">
                                            <span>${val["status_name"]}</span>
                                            <span>巡逻人员：${val["patrol_name"]}</span>
                                        </div>
                                        <div class="time">${val["time"]}</div>
                                    </div>
                                    <div class="info">
                                        <div class="pos">${val["park_name"]}</div>
                                        <div class="error">${val["error"]}</div>
                                    </div>
                                </li>
                            `;

                        });
                    }
                    $(".device-list-box").html(str);
                }
            });


        }
    }
};
stop.todayIncorme().stopLenth().map().deviceWarning();




















