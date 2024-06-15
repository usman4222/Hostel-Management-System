// import React, { useEffect, useState } from 'react';
// import ReactApexChart from 'react-apexcharts';
// import { useDispatch, useSelector } from 'react-redux';
// // import { getRevenueList, getTotalRevenueList } from '../actions/revenue';
// import { getExpenseList, getTotalExpenseList } from '../actions/financeController';
// import { getAllUsers } from '../actions/addUserAction';
//  options = {
//   legend: {
//     show: false,
//     position: 'top',
//     horizontalAlign: 'left',
//   },
//   colors: ['#3C50E0', '#80CAEE'],
//   chart: {
//     fontFamily: 'Satoshi, sans-serif',
//     height: 335,
//     type: 'area',
//     dropShadow: {
//       enabled: true,
//       color: '#623CEA14',
//       top: 10,
//       blur: 4,
//       left: 0,
//       opacity: 0.1,
//     },
//     toolbar: {
//       show: false,
//     },
//   },
//   responsive: [
//     {
//       breakpoint: 1024,
//       options: {
//         chart: {
//           height: 300,
//         },
//       },
//     },
//     {
//       breakpoint: 1366,
//       options: {
//         chart: {
//           height: 350,
//         },
//       },
//     },
//   ],
//   stroke: {
//     width: [2, 2],
//     curve: 'straight',
//   },
//   grid: {
//     xaxis: {
//       lines: {
//         show: true,
//       },
//     },
//     yaxis: {
//       lines: {
//         show: true,
//       },
//     },
//   },
//   dataLabels: {
//     enabled: false,
//   },
//   markers: {
//     size: 4,
//     colors: '#fff',
//     strokeColors: ['#3056D3', '#80CAEE'],
//     strokeWidth: 3,
//     strokeOpacity: 0.9,
//     strokeDashArray: 0,
//     fillOpacity: 1,
//     discrete: [],
//     hover: {
//       size: undefined,
//       sizeOffset: 5,
//     },
//   },
//   xaxis: {
//     type: 'category',
//     categories: [
//       'Jan',
//       'Feb',
//       'Mar',
//       'Apr',
//       'May',
//       'Jun',
//       'Jul',
//       'Aug',
//       'Sep',
//       'Oct',
//       'Nov',
//       'Dec',
//     ],
//     axisBorder: {
//       show: false,
//     },
//     axisTicks: {
//       show: false,
//     },
//   },
//   yaxis: {
//     title: {
//       style: {
//         fontSize: '0px',
//       },
//     },
//     min: 0,
//     max: 150000,
//   },
// };

// const ChartOne = () => {
//   const { totalExpenseList } = useSelector((state) => state.totalExpenseList);
//   const { totalRevenueList } = useSelector((state) => state.totalRevenueList);
//   const dispatch = useDispatch();
//   const [state, setState] = useState(null);

//   useEffect(() => {
//     dispatch(getAllUsers());
//     dispatch(getTotalExpenseList());
//     dispatch(getTotalRevenueList());
//   }, [dispatch]);

//   useEffect(() => {
//     if (!totalExpenseList || !totalRevenueList) {
//       return;
//     }

//     const monthlyExpenses = Array.from({ length: 12 }, (_, monthIndex) => {
//       return totalExpenseList.filter(expense => new Date(expense.date).getMonth() === monthIndex);
//     });

//     const monthlyRevenues = Array.from({ length: 12 }, (_, monthIndex) => {
//       return totalRevenueList.filter(revenue => new Date(revenue.date).getMonth() === monthIndex);
//     });

//     const monthlyExpenseData = monthlyExpenses.map(expenses => expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0));
//     const monthlyRevenueData = monthlyRevenues.map(revenues => revenues.reduce((total, revenue) => total + parseFloat(revenue.amount), 0));

//     const maxAmount = Math.max(
//       Math.max(...monthlyExpenseData),
//       Math.max(...monthlyRevenueData)
//     );

//     setState({
//       series: [
//         {
//           name: 'Revenue',
//           data: monthlyRevenueData,
//         },
//         {
//           name: 'Expense',
//           data: monthlyExpenseData,
//         },
//       ],
//       options: {
//         ...options,
//         xaxis: {
//           ...options.xaxis,
//           categories: [
//             'Jan',
//             'Feb',
//             'Mar',
//             'Apr',
//             'May',
//             'Jun',
//             'Jul',
//             'Aug',
//             'Sep',
//             'Oct',
//             'Nov',
//             'Dec',
//           ],
//         },
//         yaxis: {
//           ...options.yaxis,
//           max: Math.ceil(maxAmount / 10000) * 10000,
//         },
//       },
//     });
//   }, [totalExpenseList, totalRevenueList]);

//   if (!state) {
//     return null;
//   }

//   return (
//     <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
//       <div className='mb-5'>
//         <h4 className="text-xl font-semibold text-black dark:text-white">
//           Monthly Profit
//         </h4>
//       </div>
//       <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap ">
//         <div className="flex w-full flex-wrap gap-3 sm:gap-5">
//           <div className="flex min-w-47.5">
//             <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
//               <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
//             </span>
//             <div className="w-full">
//               <p className="font-semibold text-primary">Total Revenue</p>
//             </div>
//           </div>
//           <div className="flex min-w-47.5">
//             <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
//               <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
//             </span>
//             <div className="w-full">
//               <p className="font-semibold text-secondary">Total Expense</p>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div>
//         <div id="chartOne" className="-ml-5">
//           <ReactApexChart
//             options={state.options}
//             series={state.series}
//             type="area"
//             height={350}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChartOne;
