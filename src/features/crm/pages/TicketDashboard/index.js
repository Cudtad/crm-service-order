// import React, { useContext, useEffect, useRef, useState } from 'react';

// import { XLayout, XLayout_Bottom, XLayout_Box, XLayout_Center, XLayout_Left, XLayout_Title, XLayout_Top } from '@ui-lib/x-layout/XLayout';
// import ReactApexChart from 'react-apexcharts';
// import XToolbar from '@ui-lib/x-toolbar/XToolbar';
// import _ from "lodash";
// import { Dropdown } from "primereact/dropdown";
// import classNames from "classnames";
// import TicketApi from 'services/ticket/TicketApi';
// import ProjectApi from "services/ProjectService";
// import { MultiSelect } from "primereact/multiselect";
// import CommonFunction from '@lib/common';

// export default function TicketDashboard() {
//     const t = CommonFunction.t;
//     const defaultRadial = {
//         series: [],
//         options: {
//             chart: {
//                 width: '100%',
//                 type: 'donut',
//             },
//             labels: [],
//             title: {
//                 text: ""
//             },
//             tooltip: {
//                 y: {
//                     formatter: function (val) {
//                         return val + " ticket"
//                     }
//                 }
//             },
//             colors:["#0092ff","#00BA5A","#FAEF6A","#AFBAAF","#ff285b","#FF8150","#7c5cd7","#24FA4D","#FF79C0","#FAEF6A","#E67600"],
//             dataLabels: {
//                 enabled: true
//             },
//             responsive: [{
//                 breakpoint: 480,
//                 options: {
//                     chart: {
//                         width: 200
//                     },
//                     legend: {
//                         show: false
//                     }
//                 }
//             }],
//             // fill: {
//             //     type: 'gradient'
//             // },
//             legend: {
//                 position: 'right',
//                 offsetY: 0,
//                 height: 230,
//             }
//         },
//     };
//     const defaultBarStacked = {
//         series: [],
//         options: {
//             chart: {
//                 height: 350,
//                 type: 'line',
//                 zoom: {
//                     enabled: true,
//                     autoScaleYaxis: true
//                 },
//                 dropShadow: {
//                     enabled: true,
//                     color: '#4f4545',
//                     top: 11,
//                     left: 3,
//                     blur: 3,
//                     opacity: 0.1
//                 },
//             },

//             dataLabels: {
//                 enabled: false
//             },

//             title: {
//                 text: '',
//             },
//             // dataLabels: {
//             //     enabled: true,
//             //   },
//             // line
//             stroke: {
//                 width: [4, 4],
//                 curve: 'smooth',
//                 dashArray: [0, 0]
//             },
//             colors: ['#3b9d3a', '#e77f35'],
//             grid: {
//                 row: {
//                     colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
//                     opacity: 0.5
//                 },
//             },
//             xaxis: {
//                 categories: [],
//             },
//             // fill: {
//             //     type: 'gradient',
//             //     gradient: {
//             //         shadeIntensity: 1,
//             //         inverseColors: false,
//             //         opacityFrom: 0.5,
//             //         opacityTo: 0,
//             //         stops: [0, 90, 100]
//             //     },
//             // },
//         },
//     }
//     const defaultBar = {
//         series: [],
//         options: {
//             chart: {
//                 type: 'bar',
//                 height: 350,
//                 toolbar: {
//                     show: true
//                 },

//                 zoom: {
//                     enabled: true
//                 }
//             },
//             title: {
//                 text: ""
//             },
//             responsive: [{
//                 breakpoint: 480,
//                 options: {
//                     legend: {
//                         position: 'bottom',
//                         offsetX: -10,
//                         offsetY: 0
//                     }
//                 }
//             }],
//             plotOptions: {
//                 bar: {
//                     horizontal: false,
//                     columnWidth: '55%',
//                     endingShape: 'rounded'
//                 },
//             },
//             colors: ["#008ffb", "#feb019"],
//             xaxis: {
//                 categories: "",
//             },
//             // legend: {
//             //     position: 'button',
//             //     offsetY: 40
//             // },
//             stroke: {
//                 show: true,
//                 width: 2,
//                 colors: ['transparent']
//             }
//         },
//     };
//     const viewingModes = [
//         {
//             code: 'week',
//             name: t('calendar.viewing-week'),
//         },
//         {
//             code: 'month',
//             name: t('calendar.viewing-month'),
//         }
//     ]
//     const [typeChart, setTypeChart] = useState(defaultRadial);
//     const [stateChart, setStateChart] = useState(defaultRadial);
//     const [resolveDeadlineChart, setResolveDeadlinechart] = useState(defaultBarStacked);
//     const [deadlineChart, setDeadlineChart] = useState(defaultBarStacked);
//     const [projectChart, setProjectChart] = useState(defaultBar);
//     const [projects, setProjects] = useState([]);

//     const [filter, setFilter] = useState({
//         rangeMode: "week",
//         projectIds: [],
//         selectedProjectIds: [],
//         rangeCount: 8
//     });

//     useEffect(() => {
//         loadData()
//     }, [filter]);

//     useEffect(() => {
//         loadProjects();
//     }, []);

//     const loadData = (_filter) => {
//         let _currentFilter = _filter?_filter:filter
//         TicketApi.getDashboardByState(_currentFilter).then(res =>{
//             if(res) {
//                 buildTypeChart(res);
//                 buildStateChart(res);
//                 buildProjectChart(res);
//             }
//         })
//         TicketApi.getDashboardByDatelineState(_currentFilter).then(res =>{
//             if(res) {
//                 buildResolveDatelineChart(res);
//                 buildDatelineChart(res);
//             }
//         })
//     }

//     const loadProjects = () => {
//         let _lazy = {
//             first: 0,
//             rows: 999,
//             page: 0,
//         };

//         ProjectApi.get(_lazy).then(res => {
//             if (res) {
//                 // setTotalRecords(res.total);
//                 // prepare data
//                 let _filter = _.cloneDeep(filter)
//                 let _requests = [];
//                 if (res.content && res.content.length > 0) {
//                     _requests = res.content;
//                     _filter.projectIds = res.content.map(p=>p.id)
//                     _filter.selectedProjectIds = res.content.map(p=>p.id)
//                 }
//                 setProjects(_requests);
//                 setFilter(_filter);
//                 loadData(_filter);
//             }
//         })
//     }

//     // thể loại
//     const buildTypeChart = (res) => {
//         let _typeChart = _.cloneDeep(typeChart);
//         let _tickets = 0, _changes = 0, _problems = 0;
//         res.forEach(_ticket => {
//             switch (_ticket.type) {
//                 case "TICKET":
//                     _tickets += _ticket.total || 0
//                     break;
//                 case "CHANGE":
//                     _changes += _ticket.total || 0
//                     break;
//                 case "PROBLEM":
//                     _problems += _ticket.total || 0
//                     break;
//             }
//         });
//         // loại
//         _typeChart.series = [_tickets, _changes, _problems];
//         _typeChart.options.labels = [t("ticket.dashboard.ticket"), t("ticket.dashboard.change"), t("ticket.dashboard.problem")];
//         // _typeChart.options.title.text = t("ticket.dashboard.type");
//         setTypeChart(_typeChart);
//     }


//     // trạng thái
//     const buildStateChart = (res) => {
//         let _stateChart = _.cloneDeep(stateChart);
//         let _init = 0, _response = 0, _pending = 0, _inProgress = 0, _canceled = 0,
//             _solved = 0, _completed = 0, _evalution = 0, _accepted = 0;
//         res.forEach(_ticket => {
//             switch (_ticket.state) {
//                 case "INIT":
//                     _init += _ticket.total || 0
//                     break;
//                 case "RESPONSE":
//                     _response += _ticket.total || 0
//                     break;
//                 case "IN_PROGRESS":
//                     _inProgress += _ticket.total || 0
//                     break;
//                 case "PENDING":
//                     _pending += _ticket.total || 0
//                     break;
//                 case "CANCELED":
//                     _canceled += _ticket.total || 0
//                     break;
//                 case "SOLVED":
//                     _solved += _ticket.total || 0
//                     break;
//                 case "COMPLETED":
//                     _completed += _ticket.total || 0
//                     break;
//                 case "EVALUTION":
//                     _evalution += _ticket.total || 0
//                     break;
//                 case "ACCEPTED":
//                     _accepted += _ticket.total || 0
//                     break;
//             }
//         });
//         _stateChart.series = [_init, _response, _pending, _inProgress,_canceled
//             , _solved, _completed, _evalution,_accepted];
//         _stateChart.options.labels = [t("ticket.state.ticket.INIT"),
//                                         t("ticket.state.ticket.RESPONSE"),
//                                         t("ticket.state.ticket.PENDING"),
//                                         t("ticket.state.ticket.IN_PROGRESS"),
//                                         t("ticket.state.ticket.CANCELED"),
//                                         t("ticket.state.ticket.SOLVED"),
//                                         t("ticket.state.ticket.COMPLETED"),
//                                         t("ticket.state.ticket.EVALUTION"),
//                                         t("ticket.state.ticket.ACCEPTED")];
//         // _stateChart.options.title.text = t("ticket.dashboard.state");

//         setStateChart(_stateChart);
//     }

//     // hạn xử lí

//     const buildResolveDatelineChart = (res) => {
//         let _resolveDeadlineChart = _.cloneDeep(resolveDeadlineChart);

//         let _series = [
//             {
//                 name: t('ontime'),
//                 data: []
//             }, {
//                 name: t("due"),
//                 data: []
//             }
//         ]

//         let _categories = [];
//         for (const property in res) {
//             _series[0].data.push(res[property][0].totalticket - res[property][0].qua_xu_ly);
//             _series[1].data.push(res[property][0].qua_xu_ly);
//             if(filter.rangeMode === 'week') {
//                 _categories.push(property)
//             } else {
//                 _categories.push(property);
//             }
//         }

//         _resolveDeadlineChart.series = _series;
//         _resolveDeadlineChart.options.xaxis.categories = _categories;
//         // _resolveDeadlineChart.options.title.text = t("ticket.dashboard.resolve-deadline");
//         setResolveDeadlinechart(_resolveDeadlineChart);
//     }

//     // hạn phản hồi
//     const buildDatelineChart = (res) => {
//         let _deadlineChart = _.cloneDeep(deadlineChart);

//         let _series = [
//             {
//                 name: t('ontime'),
//                 data: []
//             }, {
//                 name: t("due"),
//                 data: []
//             }
//         ]

//         let _categories = [];
//         for (const property in res) {
//             _series[0].data.push(res[property][0].totalticket - res[property][0].qua_phan_hoi);
//             _series[1].data.push(res[property][0].qua_phan_hoi);
//             if(filter.rangeMode === 'week') {
//                 _categories.push(property)
//             } else {
//                 _categories.push(property);
//             }
//         }

//         _deadlineChart.series = _series;
//         _deadlineChart.options.xaxis.categories = _categories;
//         // _deadlineChart.options.title.text = t("ticket.dashboard.deadline");
//         setDeadlineChart(_deadlineChart);
//     }

//      // dự án
//      const buildProjectChart = (res) => {
//         let _projectChart = _.cloneDeep(projectChart);
//         let _series = [
//             {
//                 name: t("common.open"),
//                 data: []
//             }, {
//                 name: t("common.close"),
//                 data: []
//             }
//         ]

//         let _categories = []
//         let _listProjects = [];
//         res.forEach(_ticket => {
//             let _indexProject = _.findIndex(_listProjects,{projectid: _ticket.projectid})
//             if(_indexProject > -1) {
//                 if(_ticket.state && (_ticket.state !== "COMPLETED") && (_ticket.state !== "CANCELED")) {
//                     _listProjects[_indexProject].open += _ticket.total;
//                     _listProjects[_indexProject].total += _ticket.total;
//                 } else if (_ticket.state && (_ticket.state === "COMPLETED")) {
//                     _listProjects[_indexProject].close += _ticket.total
//                     _listProjects[_indexProject].total += _ticket.total
//                 }
//             } else if(_ticket.projectid) {
//                 if(_ticket.state && (_ticket.state !== "COMPLETED") && (_ticket.state !== "CANCELED")) {
//                     _ticket.close = 0;
//                     _ticket.open = _ticket.total;
//                     _listProjects.push(_ticket);
//                 } else if (_ticket.state && (_ticket.state === "COMPLETED")) {
//                     _ticket.open = 0;
//                     _ticket.close = _ticket.total;
//                     _listProjects.push(_ticket);
//                 }
//             }
//         });

//         _listProjects.forEach(_project => {
//             _series[0].data.push(_project.open);
//             _series[1].data.push(_project.close);
//             _categories.push(_project.projectName)
//         });

//         _projectChart.series = _series
//         _projectChart.options.xaxis.categories = _categories;
//         // _projectChart.options.title.text = t("ticket.dashboard.project");
//         setProjectChart(_projectChart);
//     }



//     const applyChangeFilter = (prop, val) => {
//         let _filter = _.cloneDeep(filter);
//         switch (prop) {
//             case "rangeMode":
//                 break;
//             case "selectedProjectIds":
//                 if(!val || val.length === 0){
//                     _filter.projectIds = projects.map(p => p.id)
//                 } else {
//                     _filter.projectIds = val
//                 }
//                 break;
//         }
//         if (val === "week") {
//             _filter.rangeCount = 8
//         } else if(val === "month") {
//             _filter.rangeCount = 6
//         }
//         _filter[prop] = val;
//         setFilter(_filter);
//     }

//     return (<>
//         <XLayout className="p-2">
//             <XLayout_Top>
//                 <XToolbar
//                     className="mb-2"
//                     left={() => (
//                         <MultiSelect optionLabel="name" optionValue="id"
//                             disply="chip" 
//                             value={filter.selectedProjectIds}
//                             style={{ width: "300px" }}
//                             inputId="state-filter"
//                             placeholder={t("project")}
//                             options={projects}
//                             onChange={(e) => applyChangeFilter("selectedProjectIds", e.value)} />
//                     )}
//                     right={() => (<>
//                         <div>
//                             <Dropdown value={filter.rangeMode}
//                                 onChange={(e) => applyChangeFilter("rangeMode", e.target.value)}
//                                 className={classNames({ 'p-invalid w-220': false, 'dense my-1 mr-2': true })}
//                                 optionValue="code" optionLabel="name"
//                                 options={viewingModes} />
//                         </div>
//                     </>)}

//                 ></XToolbar>
//             </XLayout_Top>

//             <XLayout_Center>
//                 <div className="grid formgrid" >
//                     <div className="col-6 p-lg-5 p-field">
//                         <div className="p-2 bg-white h-full">
//                             <XLayout_Title>{t("ticket.dashboard.type")}</XLayout_Title>
//                             <ReactApexChart options={typeChart.options} series={typeChart.series} type="pie" height="250px" />
//                         </div>
//                     </div>
//                     <div className="col-6 p-lg-7 p-field">
//                         <div className="p-2 bg-white h-full">
//                             <XLayout_Title>{t("ticket.dashboard.resolve-deadline")}</XLayout_Title>
//                             <ReactApexChart options={resolveDeadlineChart.options} series={resolveDeadlineChart.series} type="line" height="250px" />
//                         </div>
//                     </div>
//                     <div className="col-6 p-lg-5 p-field">
//                         <div className="p-2 bg-white h-full">
//                             <XLayout_Title>{t("ticket.dashboard.state")}</XLayout_Title>
//                             <ReactApexChart options={stateChart.options} series={stateChart.series} type="pie" height="250px" />
//                         </div>
//                     </div>
//                     <div className="col-6 p-lg-7 p-field">
//                         <div className="p-2 bg-white h-full">
//                             <XLayout_Title>{t("ticket.dashboard.deadline")}</XLayout_Title>
//                             <ReactApexChart options={deadlineChart.options} series={deadlineChart.series} type="line" height="250px" />
//                         </div>
//                     </div>
//                     <div className="col-12 p-field">
//                         <div className="p-2 bg-white h-full">
//                             <XLayout_Title>{t("ticket.dashboard.project")}</XLayout_Title>
//                             <ReactApexChart options={projectChart.options} series={projectChart.series} type="bar" height="350px" />
//                         </div>
//                     </div>
//                 </div>
//             </XLayout_Center>
//         </XLayout>
//     </>);
// }
