import React, { useEffect, useState } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import CardDataStats from './CardDataStats';
import CountUp from 'react-countup';
import { RiMoneyPoundCircleLine } from "react-icons/ri";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import '@firebase/firestore';
import { GrArticle } from "react-icons/gr";

function Dash() {
    const [count, setCount] = useState(0);
    const [users, setUsers] = useState([]);
    const [blogs, setBlogs] = useState([]);
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

    const fetchBlogs = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'blogs'));
            const blogsList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setBlogs(blogsList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching blogs: ", error);
            setLoading(false);
        }
    };

    const usersCount = users.length;
    const blogsCount = blogs.length;

    useEffect(() => {
        fetchUsers();
        fetchBlogs();
    }, []);

    return (
        <DefaultLayout>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
                <CardDataStats title="Total Users" total={<CountUp end={usersCount} duration={2} />}>
                    <RiMoneyPoundCircleLine className="fill-primary dark:fill-white text-xl" />
                </CardDataStats>
                <CardDataStats title="Total Blogs" total={<CountUp end={blogsCount} duration={2} />}>
                    <GrArticle className="fill-primary dark:fill-white text-xl" />
                </CardDataStats>
            </div>
        </DefaultLayout>
    );
}

export default Dash;
