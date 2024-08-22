import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Link, useParams } from 'react-router-dom';

const options = {
    chart: {
        fontFamily: 'Satoshi, sans-serif',
        type: 'donut',
    },
    colors: ['#3C50E0', '#6577F3', '#8FD0EF', '#0FADCF'],
    labels: ['Present', 'Absent', 'Leave'],
    legend: {
        show: false,
        position: 'bottom',
    },
    plotOptions: {
        pie: {
            donut: {
                size: '65%',
                background: 'transparent',
            },
        },
    },
    dataLabels: {
        enabled: false,
    },
    responsive: [
        {
            breakpoint: 2600,
            options: {
                chart: {
                    width: 380,
                },
            },
        },
        {
            breakpoint: 640,
            options: {
                chart: {
                    width: 200,
                },
            },
        },
    ],
};

const AttendanceGraph = ({ userAttendance }) => {
    const series = [
        userAttendance.presentCount,
        userAttendance.absentCount,
        userAttendance.leaveCount,
    ];
    const { userId } = useParams();

    return (
        <div className="sm:px-7.5 col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-5">
            <div className="mb-3 justify-between items-center gap-4 sm:flex">
                <div>
                    <h5 className="text-xl font-semibold text-black dark:text-white">
                        Attendance Analytics
                    </h5>
                </div>
                <div className='mt-5 md:mt-0'>
                    <div className="relative z-20 inline-block">
                        <div
                            className="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none"
                        >
                            <Link
                                to={`/attendancelist/${userId}`}
                                className="inline-flex items-center justify-center bg-black py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                            >
                                Attendance List
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-2">
                <div id="chartThree" className="mx-auto flex justify-center">
                    <ReactApexChart
                        options={options}
                        series={series}
                        type="donut"
                    />
                </div>
            </div>

            <div className="-mx-8 flex flex-wrap items-center justify-center gap-y-3">
                <div className="sm:w-1/2 w-full px-8">
                    <div className="flex w-full items-center">
                        <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-primary"></span>
                        <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
                            <span> Present </span>
                            <span> {userAttendance.presentCount}</span>
                        </p>
                    </div>
                </div>
                <div className="sm:w-1/2 w-full px-8">
                    <div className="flex w-full items-center">
                        <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-[#6577F3]"></span>
                        <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
                            <span> Absent </span>
                            <span> {userAttendance.absentCount} </span>
                        </p>
                    </div>
                </div>
                <div className="sm:w-1/2 w-full px-8">
                    <div className="flex w-full items-center">
                        <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-[#8FD0EF]"></span>
                        <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
                            <span> Leave </span>
                            <span> {userAttendance.leaveCount} </span>
                        </p>
                    </div>
                </div>
                <div className="sm:w-1/2 w-full px-8">
                    <div className="flex w-full items-center">
                        <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-[#0FADCF]"></span>
                        <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
                            <span>Total Days</span>
                            <span>{userAttendance.totalEntries} </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceGraph;
