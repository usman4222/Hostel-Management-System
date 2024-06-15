import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import CardDataStats from './CardDataStats';
// import ChartOne from '../../Charts/ChartOne';
import CountUp from 'react-countup';
import { RiMoneyPoundCircleLine } from "react-icons/ri";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import firebase from '@firebase/app';
import '@firebase/firestore';

function Dash() {

    const [count, setCount] = useState(0);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'profiles'));
            const usersList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setUsers(usersList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching users: ", error);
            setLoading(false);
        }
    };

    const usersCount = users.length

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <DefaultLayout>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
                <CardDataStats title="Total Users" total={<CountUp end={usersCount} duration={2} />}>
                    <RiMoneyPoundCircleLine className="fill-primary dark:fill-white text-xl" />
                </CardDataStats>
                {/* <CardDataStats title="Current Month Expense" total={<CountUp end={totalCurrentMonthExpenses} duration={2} />} >
                    <RiMoneyDollarCircleLine className="fill-primary dark:fill-white text-xl" />
                </CardDataStats>
                <CardDataStats title="Total Revenue" total={<CountUp end={totalRevenue} duration={2} />} >
                    <BiMoneyWithdraw className="fill-primary dark:fill-white text-xl" />
                </CardDataStats>
                <CardDataStats title="Current Month Revenue" total={<CountUp end={totalCurrentMonthRevenue} duration={2} />} >
                    <TbMoneybag className="text-primary dark:text-white text-xl" />
                </CardDataStats> */}
            </div>

            <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
                {/* <ChartOne /> */}
                {/* <ChartTwo /> */}
                {/* <ChartThree /> */}
                {/* <ChatCard /> */}

                {/* <div className="col-span-12 xl:col-span-8">
                <TableOne />
              </div>
              <ChatCard /> */}
            </div>
        </DefaultLayout>
    );
}

export default Dash;