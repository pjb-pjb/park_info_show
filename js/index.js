let BASE_URL = "http://show.maiboparking.com";
let config = {
    todayIncorme:BASE_URL+"/index/platform/income_comparison",
    stopLenth:BASE_URL+"/index/platform/parking_length",
    getAllPark:BASE_URL+"/index/platform/get_country_parking"
};
let updateTime = 3000;
let stop = {
    //今日收入
    todayIncorme:function () {
        let oldData = {
            "code":1,
            "data":{
                "t_number":"960,712", //今日收入
                "y_number":682620,    //昨日收入
                "ratio":"0.94"        //同比昨日(%)
            }
        }
        render();
        setPage(oldData.data);
        setInterval(render,updateTime);
        function render() {
            $.ajax({
                url:config["todayIncorme"],
                success:function (data) {
                    if(data.code===1){
                        setPage(data.data);
                    }else {
                        setPage(oldData.data);
                    }
                },
                error:function () {
                    setPage(oldData.data);
                }
            });
        }
        function setPage(data) {
            $(".today-income .money-left").text(data["t_number"]);
            $(".today-income .ratio").text(data.ratio);
            if(data.ratio>=0){
                $(".today-income .money-right img").attr("src","images/up.png");
            }else {
                $(".today-income img").attr("src","images/down.png");
            }
        }
        return this;
    },
    //停车时长
    stopLenth:function () {

        let pipBox = $(".stop-lenth .pip");
        let myEcharts = echarts.init(pipBox[0]);
        let oldData = {
            "code":1,
            "data":[
                {"name":"30分钟以内","total":8640,"ratio":16.69},
                {"name":"30-60分钟","total":6420,"ratio":12.4},
                {"name":"1-2小时","total":13200,"ratio":25.49},
                {"name":"2-4小时","total":15810,"ratio":30.53},
                {"name":"4小时以上","total":7710,"ratio":14.89}
            ]
        };
        let option = {
            color:[
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
                    name:'访问来源',
                    type:'pie',
                    radius: ['50%', '70%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: true,
                            position: 'outside',
                            textStyle:{
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
                    data:getData(oldData)
                }
            ]
        };
        myEcharts.setOption(option);
        //把数据格式转化成需要设置的格式
        function getData(data) {
            let d = [];

            data.data.forEach(function (val) {
                d.push({
                    name:val.name,
                    value:val.total
                });
            });

            return d;
        }
        render();
        setInterval(render,updateTime);
        function render() {
            $.ajax({
                url:config["stopLenth"],
                success:function (data) {
                    if(data.code===1){
                       option.series[0].data = getData(data);
                    }else {
                        option.series[0].data = getData(oldData);
                    }
                    myEcharts.setOption(option);
                },
                error:function () {
                    option.series[0].data = getData(oldData);
                    myEcharts.setOption(option);
                }
            });
        }
        return this;
    },
    //map
    map:function () {

        let map = $(".map");
        let myEcharts = echarts.init(map[0]);
        //转化数据格式
        var convertData = function (data) {
            let d = [];
            data.forEach(function (val) {
                d.push({
                    name:val.name, value:[val["baidumap_longitude"]*1,val["baidumap_latitude"]*1,val["park_id"]]
                });
            });
            return d;
        };
        let option = {
            tooltip: {
                trigger: 'item',
                //设置提示框格式
                formatter: function (params) {
                    return `<div style="width: 200px;height: 200px;background: rgba(255,255,255,0.3);"><em>${params.data.name}</em></div>`;
                }
            },
            geo: {
                zoom:1.2,
                map: 'china',
                label: {
                    emphasis: {
                        show: true,
                        fontSize:"14",
                        color:"#fff"
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
                    data:[
                        {
                            name:1,
                            value:[1,2,3]
                        }
                    ],
                    symbolSize: 15,
                    label: {
                        normal: {
                            show: false
                        },
                        emphasis: {
                            show: true,
                            position: "right",
                            formatter: "{b}",
                            fontSize:20
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
                    symbolSize:16,
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
        //获取数据
        function render() {
            $.ajax({
                url:config["getAllPark"],
                success:function (data) {
            if(data.code===1){
                option.series[0].data = convertData(data.data);
                option.series[1].data = [convertData(data.data)[0]];
                myEcharts.setOption(option);
            }
                }
            });
        }
        let index = 0;
        //设置波纹跳转
        setInterval(function () {
            index++;
            if(index>option.series[0].data.length-1){
                index = 0;
            }
            //设置波纹的数据
            option.series[1].data = [option.series[0].data[index]];
            myEcharts.setOption(option);
            //触发波纹的提示框
            myEcharts.dispatchAction({
                type:"showTip",
                seriesIndex:1,
                name:option.series[1].data[0].name
            });
        },1000)


    }
};
stop.todayIncorme().stopLenth().map();




















